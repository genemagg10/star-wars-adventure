// Star Wars Adventure — lightsaber, Force powers, and shots.

const POWER_DMG = { push: 3, throw: 4, lightning: 5, rock: 4 };

// The walk-in chip lands while the stick is moving. The rest of her plate
// was stuck because a kid then plants their feet still facing the dodge, and
// that swing missed. During the hold, a saber or Force Push in reach connects
// either way. The telegraph itself is not a free hit.
function shadowPunish(e) {
    if (!e || !e.alive || e.bossId !== "shadow" || e.intro) return false;
    if (e.state === "telegraph") return false;
    return true;
}

// Same idea on the Kylo Deck. The cross is not a free hit. Once he is
// holding in reach, a saber or Force cast connects even if the stick
// still points at the dodge.
function fallenPunish(e) {
    if (!e || !e.alive || e.bossId !== "fallen" || e.intro) return false;
    if (e.state === "telegraph") return false;
    return true;
}

function fallenAim(game, source, maxDist) {
    let best = null;
    let bestD = maxDist;
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!fallenPunish(e)) continue;
        const d = dist(source.x, source.y, e.x, e.y);
        if (d < bestD) {
            best = e;
            bestD = d;
        }
    }
    return best;
}

// During the finish hold, a heart from the lunge or the deck troopers
// should not chain. The cross itself still uses the short breather.
function kyloHoldBreath(game) {
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.alive || e.bossId !== "fallen" || e.intro) continue;
        if (e.state !== "approach" || e.clearGrace > 0) continue;
        return true;
    }
    return false;
}

// Same idea in the Throne Gallery. The opening tether is not a free hit.
// After that, the hold and the later orange ring both connect, even if
// the stick still points at the dodge. That ring is the cue a kid swings at.
function darkPunish(e) {
    if (!e || !e.alive || e.bossId !== "dark" || e.intro) return false;
    return true;
}

function darkAim(game, source, maxDist) {
    let best = null;
    let bestD = maxDist;
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!darkPunish(e)) continue;
        const d = dist(source.x, source.y, e.x, e.y);
        if (d < bestD) {
            best = e;
            bestD = d;
        }
    }
    return best;
}

// During the finish hold and the later orange ring, a heart from the tug
// or the gallery troopers should not chain. The first tether still uses
// the short breather.
function vaderHoldBreath(game) {
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.alive || e.bossId !== "dark" || e.intro) continue;
        if (e.state === "telegraph") return true;
        if (e.state !== "approach" || e.clearGrace > 0) continue;
        return true;
    }
    return false;
}

// Same idea at the Core Gate. The opening storm is not a free hit.
// After that, the hold connects even if the stick still points at the dodge.
// The painted storm itself is not a free hit.
function hoodedPunish(e) {
    if (!e || !e.alive || e.bossId !== "hooded" || e.intro) return false;
    if (e.state === "telegraph") return false;
    return true;
}

// The teen plate. This is the hug: storms and troopers stop spending hearts.
function emperorFinishing(e) {
    return !!(e && e.alive && e.bossId === "hooded" && !e.intro && e.hp > 0 && e.hp <= EMPEROR_CLEAR.finishHp);
}

function hoodedAim(game, source, maxDist) {
    let best = null;
    let bestD = Infinity;
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!hoodedPunish(e)) continue;
        const cap = emperorFinishing(e) ? EMPEROR_CLEAR.finishAim : maxDist;
        const d = dist(source.x, source.y, e.x, e.y);
        if (d <= cap && d < bestD) {
            best = e;
            bestD = d;
        }
    }
    return best;
}

// After the first storm, a heart from the bolt or the core troopers
// should not chain. That storm ends the intro as it lands, so the
// heart that opens the finish window already gets this breather.
function emperorHoldBreath(game) {
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.alive || e.bossId !== "hooded" || e.intro) continue;
        return true;
    }
    return false;
}

// Troopers stay quiet during the punish hold, and for a breath after a
// heart, so they cannot turn the finish into another death loop.
function emperorGuardsQuiet(game) {
    if (game.coreBreath > 0) return true;
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.alive || e.bossId !== "hooded" || e.intro) continue;
        if (emperorFinishing(e)) return true;
        if (e.state === "approach" && !(e.clearGrace > 0)) return true;
    }
    return false;
}

const Combat = {
    hurtEnemy(game, ent, dmg) {
        if (!ent || !ent.alive) return;
        // Teen plate onward. A messy Lightning or saber still finishes.
        // A hit from full health stays a chip; the bonus waits for the hug.
        const hug = emperorFinishing(ent);
        if (hug) dmg += EMPEROR_CLEAR.finishBonus;
        const prevHp = ent.hp;
        ent.hp -= dmg;
        if (!hug && ent.bossId === "hooded" && !ent.intro && prevHp > EMPEROR_CLEAR.finishHp && ent.hp <= EMPEROR_CLEAR.finishHp && ent.hp > 0 && game.player) {
            if (game.player.invuln < EMPEROR_CLEAR.finishBreath) game.player.invuln = EMPEROR_CLEAR.finishBreath;
            game.coreBreath = Math.max(game.coreBreath || 0, EMPEROR_CLEAR.finishBreath);
        }
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
        p.invuln = 1.2;
        if (p.hp > 0 && kyloHoldBreath(game) && p.invuln < KYLO_CLEAR.clipInvuln) {
            p.invuln = KYLO_CLEAR.clipInvuln;
        }
        if (p.hp > 0 && vaderHoldBreath(game) && p.invuln < VADER_CLEAR.clipInvuln) {
            p.invuln = VADER_CLEAR.clipInvuln;
        }
        if (p.hp > 0 && emperorHoldBreath(game)) {
            if (p.invuln < EMPEROR_CLEAR.breath) p.invuln = EMPEROR_CLEAR.breath;
            game.coreBreath = Math.max(game.coreBreath || 0, EMPEROR_CLEAR.breath);
        }
        // Compactor clear only. A heart from a bolt or the sludge should not
        // become a second bolt from the other stormtrooper.
        if (p.hp > 0 && game.sector && game.sector.id === "trash" && game.owns("rock")) {
            if (p.invuln < TRASH_CLEAR.breath) p.invuln = TRASH_CLEAR.breath;
            game.trashBreath = Math.max(game.trashBreath || 0, TRASH_CLEAR.breath);
        }
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
        if (!hero || p.attackCd > 0 || p.hp <= 0) return;
        p.attackCd = hero.cooldown;
        p.swing = 0.26;
        p.ignite = 0.09;
        const face = p.facing.x || p.facing.y ? p.facing : { x: 0, y: 1 };
        p.swingFacing = { x: face.x, y: face.y };
        p.facing = p.swingFacing;
        SoundSystem.swing();
        this.arcHit(game, p, hero.range, hero.damage, 0.2, 110);
    },

    special(game) {
        const p = game.player;
        const hero = HEROES[p.heroId];
        if (!hero || p.specialCd > 0 || p.hp <= 0) return;
        p.specialCd = hero.specialCooldown;
        p.specialKind = hero.special;
        const face = p.facing.x || p.facing.y ? p.facing : { x: 0, y: 1 };
        p.swingFacing = { x: face.x, y: face.y };
        p.facing = p.swingFacing;
        if (hero.special === "hope") this.hopeStrike(game, p, hero);
        else if (hero.special === "spin") this.staffSpin(game, p, hero);
        else this.bowcasterBlast(game, p, hero);
    },

    arcHit(game, p, range, dmg, dotNeed, kick) {
        let connected = false;
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            const open = shadowPunish(e) || fallenPunish(e) || darkPunish(e) || hoodedPunish(e);
            if (open) {
                const pad = darkPunish(e) ? VADER_CLEAR.swingPad : emperorFinishing(e) ? EMPEROR_CLEAR.finishPad : hoodedPunish(e) ? EMPEROR_CLEAR.swingPad : 18;
                if (d >= range + e.r + pad) continue;
            } else if (d >= range + e.r * 0.5 + 6) continue;
            const dot = (dx / d) * p.facing.x + (dy / d) * p.facing.y;
            if (!open && dot <= dotNeed) continue;
            this.hurtEnemy(game, e, dmg);
            const away = normalize(dx, dy);
            e.kx += away.x * kick;
            e.ky += away.y * kick;
            connected = true;
        }
        return connected;
    },

    hopeStrike(game, p, hero) {
        p.specialT = 0.48;
        SoundSystem.hope();
        const nx = p.x + p.facing.x * 22;
        const ny = p.y + p.facing.y * 22;
        if (!game.circleBlocked(nx, ny, p.r)) {
            p.x = nx;
            p.y = ny;
        }
        const connected = this.arcHit(game, p, hero.specialRange, hero.specialDamage, 0.05, 180);
        const tipX = p.x + p.facing.x * 36;
        const tipY = p.y + p.facing.y * 36;
        game.fx.push({ kind: "ring", x: tipX, y: tipY, r: 8, life: 0.36, color: saberById(game.saber).color, grow: 200 });
        game.fx.push({ kind: "ring", x: tipX, y: tipY, r: 4, life: 0.28, color: PALETTE.foam, grow: 140 });
        game.flash = 0.08;
        if (connected && p.hp < p.maxHp) {
            p.hp += 1;
            this.addDamageNumber(game, p.x, p.y, 1, true);
            this.burst(game, p.x, p.y, PALETTE.green);
            game.fx.push({ kind: "ring", x: p.x, y: p.y, r: 6, life: 0.4, color: PALETTE.green, grow: 160 });
        } else if (connected) {
            this.burst(game, tipX, tipY, PALETTE.green);
        }
    },

    staffSpin(game, p, hero) {
        p.specialT = 0.5;
        SoundSystem.spin();
        SoundSystem.hum();
        const range = hero.specialRange;
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            const d = dist(p.x, p.y, e.x, e.y);
            if (d >= range + e.r) continue;
            this.hurtEnemy(game, e, hero.specialDamage);
            const away = normalize(e.x - p.x, e.y - p.y);
            e.kx += away.x * 200;
            e.ky += away.y * 200;
        }
        const color = saberById(game.saber).color;
        game.fx.push({ kind: "ring", x: p.x, y: p.y, r: 10, life: 0.42, color: color, grow: 210 });
        game.fx.push({ kind: "ring", x: p.x, y: p.y, r: 6, life: 0.32, color: PALETTE.foam, grow: 160 });
        game.fx.push({ kind: "ring", x: p.x, y: p.y, r: 14, life: 0.24, color: color, grow: 90 });
        this.burst(game, p.x, p.y, color);
    },

    bowcasterBlast(game, p, hero) {
        p.specialT = 0.36;
        let dir = p.facing.x || p.facing.y ? p.facing : { x: 1, y: 0 };
        const kylo = fallenAim(game, p, KYLO_CLEAR.aim);
        const vader = kylo ? null : darkAim(game, p, VADER_CLEAR.aim);
        const marked = kylo || vader;
        if (marked) {
            const aim = normalize(marked.x - p.x, marked.y - p.y);
            if (aim.x || aim.y) {
                dir = aim;
                p.facing = { x: aim.x, y: aim.y };
                p.swingFacing = { x: aim.x, y: aim.y };
            }
        }
        SoundSystem.shot();
        SoundSystem.hum();
        game.shots.push({
            kind: "bow",
            team: "player",
            x: p.x + dir.x * 18,
            y: p.y + dir.y * 18,
            vx: dir.x * 340,
            vy: dir.y * 340,
            r: 9,
            dmg: hero.specialDamage,
            life: 0.95,
            color: PALETTE.gold,
            big: true,
            hit: {},
        });
        const mx = p.x + dir.x * 20;
        const my = p.y + dir.y * 20;
        game.fx.push({ kind: "ring", x: mx, y: my, r: 6, life: 0.28, color: PALETTE.gold, grow: 180 });
        game.fx.push({ kind: "ring", x: mx, y: my, r: 3, life: 0.2, color: PALETTE.foam, grow: 120 });
        this.burst(game, mx, my, PALETTE.gold);
        game.shake = 0.08;
    },

    confetti(game, x, y) {
        const colors = [PALETTE.gold, PALETTE.foam, PALETTE.blue, PALETTE.green];
        for (let i = 0; i < 26; i++) {
            game.fx.push({
                kind: "confetti",
                x: x + (Math.random() - 0.5) * 48,
                y: y,
                vx: (Math.random() - 0.5) * 90,
                vy: -30 - Math.random() * 90,
                life: 0.85 + Math.random() * 0.45,
                color: colors[i % colors.length],
                w: 2 + (i % 3),
                h: 3 + (i % 2),
            });
        }
    },

    usePower(game, opts) {
        const id = game.activePower;
        if (!id || game.powers.indexOf(id) < 0) {
            game.toast("No power yet");
            return;
        }
        const p = game.player;
        if (p.powerCd > 0 || p.hp <= 0) return;
        p.powerCd = POWER_COOLDOWN;
        this.cast(game, p, id, {
            weak: false,
            team: "player",
            aimAssist: !!(opts && opts.aimAssist),
        });
        game.lastPower = id;
        game.notePowerUsed(id);
    },

    cast(game, source, id, opts) {
        let dmg = POWER_DMG[id] || 2;
        if (opts.dmg != null) dmg = opts.dmg;
        else if (opts.weak) dmg = Math.max(1, Math.round(dmg * 0.5));
        const team = opts.team || "player";
        if (team !== "foe" && (id === "throw" || id === "rock")) {
            const kylo = fallenAim(game, source, KYLO_CLEAR.aim);
            const vader = kylo ? null : darkAim(game, source, VADER_CLEAR.aim);
            const marked = kylo || vader;
            if (marked) {
                const aim = normalize(marked.x - source.x, marked.y - source.y);
                if (aim.x || aim.y) source.facing = { x: aim.x, y: aim.y };
            }
        }
        if (team !== "foe") {
            const hood = hoodedAim(game, source, EMPEROR_CLEAR.aim);
            if (hood) {
                const aim = normalize(hood.x - source.x, hood.y - source.y);
                if (aim.x || aim.y) source.facing = { x: aim.x, y: aim.y };
            }
        }
        if (id === "push") this.push(game, source, dmg, team, !!opts.weak);
        else if (id === "throw") this.saberThrow(game, source, dmg, team, !!opts.weak, !!opts.aimAssist);
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
            const open = team !== "foe" && (shadowPunish(t) || fallenPunish(t) || darkPunish(t) || hoodedPunish(t));
            if (open) {
                const pad = darkPunish(t) ? VADER_CLEAR.swingPad : emperorFinishing(t) ? EMPEROR_CLEAR.finishPad : hoodedPunish(t) ? EMPEROR_CLEAR.swingPad : 20;
                if (d > range + (t.r || 0) + pad) continue;
            } else if (d > range + (t.r || 0)) continue;
            const dot = (dx / d) * dir.x + (dy / d) * dir.y;
            if (!open && dot < 0.18) continue;
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

    saberThrow(game, source, dmg, team, weak, aimAssist) {
        let dir = source.facing || { x: 1, y: 0 };
        if (aimAssist && team !== "foe") {
            const foe = nearestFoe(game, source, 200);
            if (foe) {
                dir = normalize(foe.x - source.x, foe.y - source.y);
                source.facing = dir;
                game.fx.push({ kind: "ring", x: foe.x, y: foe.y, r: 6, life: 0.2, color: PALETTE.gold, grow: 70 });
            }
        }
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
        const marked = hoodedAim(game, source, EMPEROR_CLEAR.aim);
        if (marked) {
            this.hurtEnemy(game, marked, dmg);
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
                const spray = s.big ? 28 : 12;
                game.fx.push({
                    kind: "spark",
                    x: s.x,
                    y: s.y,
                    vx: (Math.random() - 0.5) * spray,
                    vy: (Math.random() - 0.5) * spray,
                    life: s.big ? 0.16 : 0.1,
                    maxLife: s.big ? 0.16 : 0.1,
                    color: PALETTE.gold,
                });
                if (s.big) {
                    game.fx.push({
                        kind: "spark",
                        x: s.x,
                        y: s.y,
                        vx: -s.vx * 0.04,
                        vy: -s.vy * 0.04,
                        life: 0.12,
                        maxLife: 0.12,
                        color: PALETTE.foam,
                    });
                }
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
                if (s.forgive) {
                    const away = normalize(game.player.x - s.x, game.player.y - s.y);
                    game.player.kx += away.x * 72;
                    game.player.ky += away.y * 72;
                    if (game.player.invuln < KYLO_CLEAR.shoveInvuln) game.player.invuln = KYLO_CLEAR.shoveInvuln;
                } else {
                    const before = game.player.hp;
                    this.hurtPlayer(game, 1, s.x, s.y);
                    if (s.finishClip && game.player.hp < before && game.player.invuln < KYLO_CLEAR.clipInvuln) {
                        game.player.invuln = KYLO_CLEAR.clipInvuln;
                    }
                }
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
            if (f.kind === "spark" || f.kind === "confetti") {
                f.x += f.vx * dt;
                f.y += f.vy * dt;
            }
            if (f.kind === "confetti") f.vy += dt * 140;
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

function nearestFoe(game, source, maxDist) {
    let best = null;
    let bestD = maxDist;
    const list = game.enemies || [];
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e.alive) continue;
        const d = dist(source.x, source.y, e.x, e.y);
        if (d < bestD) {
            best = e;
            bestD = d;
        }
    }
    return best;
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
