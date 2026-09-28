// Star Wars Adventure — lightsaber, Force powers, and shots.

const POWER_DMG = { push: 3, throw: 4, lightning: 5, rock: 4 };

const Combat = {
    hurtEnemy(game, ent, dmg) {
        if (!ent || !ent.alive) return;
        ent.hp -= dmg;
        ent.hitFlash = 0.12;
        this.addDamageNumber(game, ent.x, ent.y, dmg, false);
        for (let n = 0; n < 3; n++) {
            const a = Math.random() * Math.PI * 2;
            game.fx.push({
                kind: "spark",
                x: ent.x,
                y: ent.y,
                vx: Math.cos(a) * 70,
                vy: Math.sin(a) * 70,
                life: 0.12,
                maxLife: 0.12,
                color: PALETTE.foam,
            });
        }
        if (ent.hp <= 0) {
            ent.hp = 0;
            ent.alive = false;
            SoundSystem.boom();
            this.burst(game, ent.x, ent.y, ent.kind === "boss" ? PALETTE.gold : PALETTE.foam);
            if (ent.kind === "boss") {
                game.hitStop = 0.08;
                game.fx.push({ kind: "ring", x: ent.x, y: ent.y, r: 8, life: 0.32, color: PALETTE.gold, grow: 160 });
                game.onBossDown(ent.bossId);
            }
        }
    },

    hurtPlayer(game, dmg, fromX, fromY) {
        const p = game.player;
        if (!p || game.frozen || p.invuln > 0 || p.hp <= 0) return;
        p.hp -= dmg;
        p.invuln = 0.95;
        const away = normalize(p.x - fromX, p.y - fromY);
        p.kx = away.x * 180;
        p.ky = away.y * 180;
        game.shake = 0.12;
        game.flash = 0.12;
        this.addDamageNumber(game, p.x, p.y, dmg, false);
        SoundSystem.hurt();
        if (p.hp > 0 && p.hp <= 2) SoundSystem.lowHp();
        if (p.hp <= 0) {
            p.hp = 0;
            game.onPlayerDown();
        }
    },

    burst(game, x, y, color) {
        for (let i = 0; i < 7; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 30 + Math.random() * 50;
            const life = 0.28 + Math.random() * 0.12;
            game.fx.push({
                kind: "spark",
                x: x,
                y: y,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                life: life,
                maxLife: life,
                color: color,
            });
        }
    },

    melee(game) {
        const p = game.player;
        const hero = HEROES[p.heroId];
        if (p.attackCd > 0 || p.hp <= 0) return;
        p.attackCd = hero.cooldown;
        p.swing = 0.14;
        if (hero.melee !== "bowcaster") p.ignite = 0.09;
        if (hero.melee === "bowcaster") {
            const dir = p.facing;
            game.shots.push({
                kind: "bow",
                team: "player",
                x: p.x + dir.x * 16,
                y: p.y + dir.y * 16,
                vx: dir.x * 260,
                vy: dir.y * 260,
                r: 5,
                dmg: hero.damage,
                life: 0.8,
                color: PALETTE.gold,
                hit: {},
            });
            SoundSystem.shot();
            return;
        }
        if (hero.melee === "spin") SoundSystem.spin();
        else SoundSystem.swing();
        let connected = false;
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            let landed = false;
            if (hero.melee === "spin") {
                landed = d < hero.range + e.r;
            } else if (d < hero.range + e.r * 0.35) {
                const dot = (dx / d) * p.facing.x + (dy / d) * p.facing.y;
                landed = dot > 0.34;
            }
            if (!landed) continue;
            this.hurtEnemy(game, e, hero.damage);
            const away = normalize(dx, dy);
            e.kx += away.x * 120;
            e.ky += away.y * 120;
            connected = true;
        }
        if (hero.melee === "hope") {
            const nx = p.x + p.facing.x * 14;
            const ny = p.y + p.facing.y * 14;
            if (!game.circleBlocked(nx, ny, p.r)) {
                p.x = nx;
                p.y = ny;
            }
            if (connected && p.hopeCd <= 0 && p.hp < p.maxHp) {
                p.hp += 1;
                p.hopeCd = 2.4;
                this.addDamageNumber(game, p.x, p.y, 1, true);
                this.burst(game, p.x, p.y, PALETTE.green);
            }
        }
    },

    usePower(game) {
        const id = game.activePower;
        if (!id || game.powers.indexOf(id) < 0) {
            game.toast("No power yet");
            return;
        }
        const p = game.player;
        if (p.powerCd > 0 || p.hp <= 0) return;
        p.powerCd = POWER_COOLDOWN;
        this.cast(game, p, id, { weak: false, team: "player" });
        game.lastPower = id;
        game.notePowerUsed(id);
    },

    cast(game, source, id, opts) {
        let dmg = POWER_DMG[id] || 2;
        if (opts.dmg != null) dmg = opts.dmg;
        else if (opts.weak) dmg = Math.max(1, Math.round(dmg * 0.5));
        const team = opts.team || "player";
        if (id === "push") this.push(game, source, dmg, team, !!opts.weak);
        else if (id === "throw") this.saberThrow(game, source, dmg, team, !!opts.weak);
        else if (id === "lightning") this.lightning(game, source, dmg, team, !!opts.weak);
        else if (id === "rock") this.rock(game, source, dmg, team, !!opts.weak);
        SoundSystem.force(id, !!opts.weak || team === "foe");
    },

    push(game, source, dmg, team, weak) {
        const range = weak ? 62 : 98;
        const dir = source.facing || { x: 1, y: 0 };
        const targets = team === "foe" ? [game.player] : game.enemies.filter((e) => e.alive);
        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            if (!t) continue;
            const dx = t.x - source.x;
            const dy = t.y - source.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d > range + (t.r || 0)) continue;
            const dot = (dx / d) * dir.x + (dy / d) * dir.y;
            if (dot < 0.18) continue;
            const away = normalize(dx, dy);
            if (team === "foe") {
                this.hurtPlayer(game, 1, source.x, source.y);
                game.player.kx += away.x * 280;
                game.player.ky += away.y * 280;
            } else {
                this.hurtEnemy(game, t, dmg);
                t.kx += away.x * 260;
                t.ky += away.y * 260;
            }
        }
        const px = source.x + (dir.x || 0) * 34;
        const py = source.y + (dir.y || 0) * 34;
        game.fx.push({ kind: "ring", x: px, y: py, r: 14, life: 0.28, color: PALETTE.blue, grow: 160 });
        game.fx.push({ kind: "ring", x: px, y: py, r: 6, life: 0.22, color: PALETTE.foam, grow: 110 });
    },

    saberThrow(game, source, dmg, team, weak) {
        const dir = source.facing || { x: 1, y: 0 };
        const color = team === "foe" ? PALETTE.purple : saberById(game.saber).color;
        const speed = weak ? 200 : 280;
        game.shots.push({
            kind: "saber",
            team: team,
            x: source.x + dir.x * 14,
            y: source.y + dir.y * 14,
            vx: dir.x * speed,
            vy: dir.y * speed,
            r: 6,
            dmg: dmg,
            life: weak ? 1.05 : 1.55,
            color: color,
            phase: "out",
            traveled: 0,
            max: weak ? 88 : 156,
            hit: {},
            owner: source,
        });
    },

    lightning(game, source, dmg, team, weak) {
        const range = weak ? 120 : 188;
        const dir = source.facing || { x: 1, y: 0 };
        const x2 = source.x + dir.x * range;
        const y2 = source.y + dir.y * range;
        game.fx.push({
            kind: "bolt",
            pts: jaggedLine(source.x, source.y, x2, y2),
            life: 0.16,
            color: PALETTE.lightning,
        });
        game.fx.push({
            kind: "bolt",
            pts: jaggedLine(
                source.x,
                source.y,
                source.x + dir.x * range * 0.62 + dir.y * 22,
                source.y + dir.y * range * 0.62 - dir.x * 22
            ),
            life: 0.1,
            color: PALETTE.foam,
        });
        if (team === "foe") {
            if (beamHits(source, game.player, dir, range, 16)) {
                this.hurtPlayer(game, Math.max(1, dmg), source.x, source.y);
            }
            return;
        }
        let best = null;
        let bestD = range + 1;
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            if (!beamHits(source, e, dir, range, 24)) continue;
            const d = dist(source.x, source.y, e.x, e.y);
            if (d < bestD) {
                best = e;
                bestD = d;
            }
        }
        if (best) this.hurtEnemy(game, best, dmg);
    },

    rock(game, source, dmg, team, weak) {
        const dir = source.facing || { x: 1, y: 0 };
        const speed = weak ? 150 : 200;
        game.shots.push({
            kind: "rock",
            team: team,
            x: source.x + dir.x * 10,
            y: source.y + dir.y * 10,
            vx: dir.x * speed,
            vy: dir.y * speed,
            r: 5,
            dmg: dmg,
            life: weak ? 0.36 : 0.48,
            color: PALETTE.panel,
            hop: 0,
            aoe: weak ? 20 : 32,
            hit: {},
        });
    },

    explode(game, shot) {
        SoundSystem.boom();
        this.burst(game, shot.x, shot.y, PALETTE.gold);
        game.fx.push({ kind: "ring", x: shot.x, y: shot.y, r: 8, life: 0.28, color: PALETTE.gold });
        game.fx.push({ kind: "ring", x: shot.x, y: shot.y, r: 4, life: 0.2, color: PALETTE.danger });
        if (shot.team === "player") {
            for (let i = 0; i < game.enemies.length; i++) {
                const e = game.enemies[i];
                if (!e.alive) continue;
                if (dist(shot.x, shot.y, e.x, e.y) <= shot.aoe + e.r) this.hurtEnemy(game, e, shot.dmg);
            }
        } else if (game.player && dist(shot.x, shot.y, game.player.x, game.player.y) <= shot.aoe + game.player.r) {
            this.hurtPlayer(game, 1, shot.x, shot.y);
        }
    },

    updateShots(game, dt) {
        const keep = [];
        for (let i = 0; i < game.shots.length; i++) {
            const s = game.shots[i];
            s.life -= dt;
            if (s.kind === "saber" && s.phase === "back" && s.owner && s.owner.hp !== 0) {
                const back = normalize(s.owner.x - s.x, s.owner.y - s.y);
                s.vx = back.x * 300;
                s.vy = back.y * 300;
                if (dist(s.x, s.y, s.owner.x, s.owner.y) < 14) continue;
            }
            const nx = s.x + s.vx * dt;
            const ny = s.y + s.vy * dt;
            const blocked = s.kind !== "saber" && game.circleBlocked(nx, ny, 2);
            if (blocked) {
                if (s.kind === "rock") this.explode(game, s);
                continue;
            }
            s.x = nx;
            s.y = ny;
            if (s.kind === "saber" && s.phase === "out") {
                s.traveled += Math.hypot(s.vx, s.vy) * dt;
                if (s.traveled >= s.max) {
                    s.phase = "back";
                    s.hit = {};
                }
            }
            if (s.kind === "saber") {
                s.spin = (s.spin || 0) + dt * 22;
                game.fx.push({ kind: "spark", x: s.x, y: s.y, vx: 0, vy: 0, life: 0.08, maxLife: 0.08, color: s.color });
            }
            if (s.kind === "bow") {
                game.fx.push({ kind: "spark", x: s.x, y: s.y, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, life: 0.1, maxLife: 0.1, color: PALETTE.gold });
            }
            if (s.kind === "rock") {
                s.hop += dt;
                if (Math.random() < 0.55) {
                    game.fx.push({
                        kind: "spark",
                        x: s.x,
                        y: s.y,
                        vx: -s.vx * 0.05 + (Math.random() - 0.5) * 20,
                        vy: -s.vy * 0.05 + (Math.random() - 0.5) * 20,
                        life: 0.16,
                        color: PALETTE.gold,
                    });
                }
                if (s.life <= 0) {
                    this.explode(game, s);
                    continue;
                }
            } else if (s.life <= 0) {
                continue;
            }

            if (s.kind === "rock") {
                const bumped = s.team === "player"
                    ? game.enemies.some((e) => e.alive && dist(s.x, s.y, e.x, e.y) < s.r + e.r)
                    : game.player && dist(s.x, s.y, game.player.x, game.player.y) < s.r + game.player.r;
                if (bumped) {
                    this.explode(game, s);
                    continue;
                }
            } else if (s.team === "player") {
                for (let n = 0; n < game.enemies.length; n++) {
                    const e = game.enemies[n];
                    if (!e.alive || s.hit[e.id]) continue;
                    if (dist(s.x, s.y, e.x, e.y) < s.r + e.r) {
                        s.hit[e.id] = true;
                        this.hurtEnemy(game, e, s.dmg);
                        if (s.kind !== "saber") s.life = 0;
                    }
                }
            } else if (game.player && !s.hit.player && dist(s.x, s.y, game.player.x, game.player.y) < s.r + game.player.r) {
                s.hit.player = true;
                this.hurtPlayer(game, 1, s.x, s.y);
                if (s.kind !== "saber") s.life = 0;
            }
            if (s.life > 0) keep.push(s);
        }
        game.shots = keep;
    },

    addDamageNumber(game, x, y, amount, heal) {
        if (!game.numbers) game.numbers = [];
        const n = Math.max(1, Math.round(amount));
        game.numbers.push({
            x: x + (Math.random() - 0.5) * 14,
            y: y - 16,
            text: heal ? "+" + n : "−" + n,
            heal: !!heal,
            life: 0.75,
            maxLife: 0.75,
            vy: -42,
        });
    },

    updateFx(game, dt) {
        for (let i = 0; i < game.fx.length; i++) {
            const f = game.fx[i];
            if (f.kind === "spark" && f.maxLife == null) f.maxLife = f.life;
            f.life -= dt;
            if (f.kind === "spark") {
                f.x += f.vx * dt;
                f.y += f.vy * dt;
            }
            if (f.kind === "ring") f.r += dt * (f.grow || 70);
        }
        game.fx = game.fx.filter((f) => f.life > 0);
        if (!game.numbers) return;
        for (let i = 0; i < game.numbers.length; i++) {
            const d = game.numbers[i];
            d.y += d.vy * dt;
            d.life -= dt;
        }
        game.numbers = game.numbers.filter((d) => d.life > 0);
    },
};

function jaggedLine(x1, y1, x2, y2) {
    const pts = [{ x: x1, y: y1 }];
    const segs = 6;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    for (let i = 1; i < segs; i++) {
        const t = i / segs;
        const off = (Math.random() - 0.5) * 22;
        pts.push({
            x: x1 + dx * t + (-dy / len) * off,
            y: y1 + dy * t + (dx / len) * off,
        });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
}

function beamHits(source, target, dir, range, width) {
    if (!target) return false;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const along = dx * dir.x + dy * dir.y;
    if (along < 0 || along > range) return false;
    const cx = source.x + dir.x * along;
    const cy = source.y + dir.y * along;
    return Math.hypot(target.x - cx, target.y - cy) < width + (target.r || 0) * 0.3;
}
