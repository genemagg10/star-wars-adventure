// Star Wars Adventure — heroes, stormtroopers, bosses, and Grogu.

let NEXT_ENT_ID = 1;

function decayKick(ent, dt) {
    const k = Math.max(0, 1 - dt * 6);
    ent.kx *= k;
    ent.ky *= k;
}

function slide(ent, dx, dy, game) {
    if (!game.circleBlocked(ent.x + dx, ent.y, ent.r)) ent.x += dx;
    if (!game.circleBlocked(ent.x, ent.y + dy, ent.r)) ent.y += dy;
}

function planHooded(e) {
    if (e.mirror) {
        e.nextPower = e.mirror;
        e.mirror = null;
        return;
    }
    if (e.turn % 2 === 0) e.nextPower = "lightning";
    else e.nextPower = e.stolen || "lightning";
    e.turn += 1;
}

// One readable verb each. The shape on the floor is the warning.
// Phasma: a lane, then a straight rush.
// Inquisitor: a circle on you, then a blink into it.
// Vader: an orange tether, then a pull.
// Kylo: a gold cross, then a short lunge and a bolt.
// Emperor: a jagged storm, then lightning.
function startTelegraph(e, game) {
    const player = game.player;
    const dir = normalize(player.x - e.x, player.y - e.y);
    if (dir.x || dir.y) e.facing = dir;
    e.state = "telegraph";
    const face = { x: e.facing.x, y: e.facing.y };
    if (e.bossId === "chrome") {
        e.timer = 0.62;
        e.telegraph = { kind: "lane", dir: face, len: 148, width: 26, color: PALETTE.foam };
        SoundSystem.swing();
    } else if (e.bossId === "shadow") {
        e.timer = 0.72;
        e.blink = { x: player.x, y: player.y };
        e.telegraph = { kind: "ring", x: player.x, y: player.y, r: 30, color: PALETTE.purple };
        SoundSystem.spin();
    } else if (e.bossId === "dark") {
        e.timer = 0.78;
        e.telegraph = { kind: "tether", x2: player.x, y2: player.y, color: PALETTE.orange };
        SoundSystem.force("push", true);
    } else if (e.bossId === "fallen") {
        e.timer = 0.46;
        e.telegraph = { kind: "cross", dir: face, len: 86, color: PALETTE.gold };
        SoundSystem.shot();
    } else {
        e.timer = 0.82;
        planHooded(e);
        e.telegraph = {
            kind: "storm",
            pts: jaggedLine(e.x, e.y, e.x + face.x * 176, e.y + face.y * 176),
            color: PALETTE.lightning,
        };
        SoundSystem.bolt();
    }
}

function commitBossAttack(e, game) {
    const player = game.player;
    const face = e.facing || { x: 1, y: 0 };
    if (e.bossId === "chrome") {
        e.dash = { x: face.x * 300, y: face.y * 300, t: 0.28 };
    } else if (e.bossId === "shadow") {
        if (e.blink && !game.circleBlocked(e.blink.x, e.blink.y, e.r)) {
            e.x = e.blink.x;
            e.y = e.blink.y;
        }
        game.fx.push({ kind: "ring", x: e.x, y: e.y, r: 8, life: 0.28, color: PALETTE.purple, grow: 140 });
        if (dist(e.x, e.y, player.x, player.y) < 30) Combat.hurtPlayer(game, 1, e.x, e.y);
    } else if (e.bossId === "dark") {
        const pull = normalize(e.x - player.x, e.y - player.y);
        player.kx += pull.x * 240;
        player.ky += pull.y * 240;
        if (dist(e.x, e.y, player.x, player.y) < 64) Combat.hurtPlayer(game, 1, e.x, e.y);
        const guards = game.enemies.filter((x) => x.alive && x.kind === "guard").length;
        if (e.summons < 2 && guards < 2) {
            const sx = e.x + 28;
            const sy = e.y + 20;
            if (!game.circleBlocked(sx, sy, 7)) {
                game.enemies.push(Entities.makeGuard(sx, sy));
                e.summons += 1;
            }
        }
        game.fx.push({ kind: "ring", x: e.x, y: e.y, r: 10, life: 0.28, color: PALETTE.orange, grow: 80 });
    } else if (e.bossId === "fallen") {
        e.dash = { x: face.x * 220, y: face.y * 220, t: 0.14 };
        game.shots.push({
            kind: "bolt",
            team: "foe",
            x: e.x + face.x * 16,
            y: e.y + face.y * 16,
            vx: face.x * 240,
            vy: face.y * 240,
            r: 4,
            dmg: 1,
            life: 0.7,
            color: PALETTE.gold,
            hit: {},
        });
    } else if (e.bossId === "hooded") {
        const power = e.nextPower || "lightning";
        Combat.cast(game, e, power, { team: "foe", dmg: 1 });
        game.fx.push({ kind: "ring", x: e.x, y: e.y, r: 16, life: 0.24, color: PALETTE.lightning, grow: 90 });
    }
    e.telegraph = null;
}

function updateBoss(e, game, dt) {
    decayKick(e, dt);
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    const player = game.player;
    if (e.state === "approach") {
        const dir = normalize(player.x - e.x, player.y - e.y);
        if (dir.x || dir.y) e.facing = dir;
        let mx = dir.x;
        let my = dir.y;
        let speed = e.speed;
        if (e.bossId === "shadow") {
            const orbit = normalize(dir.x * 0.35 - dir.y, dir.y * 0.35 + dir.x);
            mx = orbit.x;
            my = orbit.y;
        } else if (e.bossId === "hooded") {
            speed *= 0.35;
        } else if (e.bossId === "dark") {
            speed *= 0.72;
        }
        slide(e, (mx * speed + e.kx) * dt, (my * speed + e.ky) * dt, game);
        e.timer -= dt;
        const reach = e.bossId === "hooded" ? 320 : e.bossId === "shadow" ? 250 : e.bossId === "chrome" ? 200 : e.bossId === "dark" ? 168 : 148;
        if (e.timer <= 0 && dist(e.x, e.y, player.x, player.y) < reach) startTelegraph(e, game);
    } else if (e.state === "telegraph") {
        if (e.telegraph && e.telegraph.kind === "tether") {
            e.telegraph.x2 = player.x;
            e.telegraph.y2 = player.y;
        }
        if (e.telegraph && e.telegraph.kind === "storm") {
            const face = e.facing || { x: 1, y: 0 };
            e.telegraph.pts = jaggedLine(e.x, e.y, e.x + face.x * 176, e.y + face.y * 176);
        }
        e.timer -= dt;
        if (e.timer <= 0) {
            e.state = "recover";
            e.timer = 0.42;
            commitBossAttack(e, game);
        }
    } else {
        if (e.dash) {
            slide(e, e.dash.x * dt, e.dash.y * dt, game);
            e.dash.t -= dt;
            if (dist(e.x, e.y, player.x, player.y) < e.r + player.r) {
                Combat.hurtPlayer(game, 1, e.x, e.y);
            }
            if (e.dash.t <= 0) e.dash = null;
        } else {
            slide(e, e.kx * dt, e.ky * dt, game);
        }
        e.timer -= dt;
        if (e.timer <= 0 && !e.dash) {
            e.state = "approach";
            e.timer = e.gap;
        }
    }
}

function updateGuard(e, game, dt) {
    decayKick(e, dt);
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    const p = game.player;
    const dir = normalize(p.x - e.x, p.y - e.y);
    const d = dist(e.x, e.y, p.x, p.y);
    if (dir.x || dir.y) e.facing = dir;
    e.timer -= dt;
    if (d > 22) slide(e, (dir.x * e.speed + e.kx) * dt, (dir.y * e.speed + e.ky) * dt, game);
    if (e.timer <= 0 && d < GUARD_STATS.range && !lineBlocked(game.solidAt, e.x, e.y, p.x, p.y)) {
        e.timer = GUARD_STATS.shot;
        const aim = Math.atan2(dir.y, dir.x) + (Math.random() - 0.5) * 0.4;
        const spd = 118;
        game.shots.push({
            kind: "bolt",
            team: "foe",
            x: e.x + dir.x * 12,
            y: e.y + dir.y * 12,
            vx: Math.cos(aim) * spd,
            vy: Math.sin(aim) * spd,
            r: 3,
            dmg: 1,
            life: 1.5,
            color: PALETTE.foam,
            hit: {},
        });
        SoundSystem.bolt();
    }
}

const Entities = {
    makePlayer(heroId, x, y) {
        const hero = HEROES[heroId];
        return {
            heroId: heroId,
            x: x,
            y: y,
            r: 6,
            hp: hero.maxHp,
            maxHp: hero.maxHp,
            facing: { x: 0, y: 1 },
            attackCd: 0,
            powerCd: 0,
            hopeCd: 0,
            invuln: 0.7,
            swing: 0,
            kx: 0,
            ky: 0,
            moving: false,
        };
    },

    makeGuard(x, y) {
        return {
            id: NEXT_ENT_ID++,
            kind: "guard",
            name: "Stormtrooper",
            x: x,
            y: y,
            r: 7,
            hp: GUARD_STATS.hp,
            maxHp: GUARD_STATS.hp,
            speed: GUARD_STATS.speed,
            facing: { x: 0, y: 1 },
            timer: Math.random() * 1.1,
            alive: true,
            kx: 0,
            ky: 0,
            hitFlash: 0,
        };
    },

    makeBoss(bossId, x, y, powers) {
        const stats = BOSS_STATS[bossId];
        const owned = (powers || []).filter((id) => POWERS[id]);
        return {
            id: NEXT_ENT_ID++,
            kind: "boss",
            bossId: bossId,
            name: stats.name,
            x: x,
            y: y,
            r: 13,
            hp: stats.hp,
            maxHp: stats.hp,
            speed: stats.speed,
            gap: stats.gap,
            facing: { x: 0, y: 1 },
            state: "approach",
            timer: 0.7,
            telegraph: null,
            dash: null,
            blink: null,
            turn: 0,
            stolen: owned.length ? owned[owned.length - 1] : "lightning",
            mirror: null,
            nextPower: "lightning",
            summons: 0,
            alive: true,
            kx: 0,
            ky: 0,
            hitFlash: 0,
        };
    },

    makeCompanion(x, y) {
        return { x: x, y: y, r: 5, facing: { x: 0, y: 1 } };
    },

    updateAll(game, dt, input) {
        this.updatePlayer(game, dt, input);
        if (game.player.hp <= 0) {
            Combat.updateFx(game, dt);
            return;
        }
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            if (e.kind === "boss") updateBoss(e, game, dt);
            else updateGuard(e, game, dt);
        }
        this.separate(game);
        if (game.companionJoined) {
            if (!game.companion) game.companion = this.makeCompanion(game.player.x, game.player.y + 16);
            this.updateCompanion(game, dt);
            this.updateEcho(game, dt);
        }
        Combat.updateShots(game, dt);
        Combat.updateFx(game, dt);
        game.enemies = game.enemies.filter((e) => e.alive);
        this.hazard(game, dt);
        game.refreshObjective();
        game.updateHint();
    },

    updatePlayer(game, dt, input) {
        const p = game.player;
        p.attackCd = Math.max(0, p.attackCd - dt);
        p.powerCd = Math.max(0, p.powerCd - dt);
        p.hopeCd = Math.max(0, p.hopeCd - dt);
        p.invuln = Math.max(0, p.invuln - dt);
        p.swing = Math.max(0, p.swing - dt);
        decayKick(p, dt);
        const hero = HEROES[p.heroId];
        const m = input.move;
        p.moving = !!(m.x || m.y);
        if (p.moving) p.facing = { x: m.x, y: m.y };
        slide(p, (m.x * hero.speed + p.kx) * dt, (m.y * hero.speed + p.ky) * dt, game);
        if (input.attack) Combat.melee(game);
        if (input.power) Combat.usePower(game);
        if (input.interact) game.tryInteract();
    },

    separate(game) {
        const list = game.enemies;
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                const a = list[i];
                const b = list[j];
                if (!a.alive || !b.alive) continue;
                const d = dist(a.x, a.y, b.x, b.y);
                const need = a.r + b.r;
                if (d > 0 && d < need) {
                    const n = normalize(a.x - b.x, a.y - b.y);
                    const push = (need - d) * 0.5;
                    a.x += n.x * push;
                    a.y += n.y * push;
                    b.x -= n.x * push;
                    b.y -= n.y * push;
                }
            }
        }
    },

    updateCompanion(game, dt) {
        const c = game.companion;
        const p = game.player;
        const goalX = p.x - p.facing.x * 22;
        const goalY = p.y - p.facing.y * 16 + 10;
        const d = dist(c.x, c.y, goalX, goalY);
        if (d > 96) {
            c.x = goalX;
            c.y = goalY;
        } else if (d > 3) {
            const dir = normalize(goalX - c.x, goalY - c.y);
            c.facing = dir;
            slide(c, dir.x * 120 * dt, dir.y * 120 * dt, game);
        }
        c.bob = (c.bob || 0) + dt;
        c.echoT = Math.max(0, (c.echoT || 0) - dt);
    },

    updateEcho(game, dt) {
        if (!game.lastPower) return;
        game.companionCd -= dt;
        if (game.companionCd > 0) return;
        let best = null;
        let bestD = 170;
        for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (!e.alive) continue;
            const d = dist(game.companion.x, game.companion.y, e.x, e.y);
            if (d < bestD) {
                best = e;
                bestD = d;
            }
        }
        if (!best) return;
        const c = game.companion;
        c.facing = normalize(best.x - c.x, best.y - c.y);
        c.echoT = 0.55;
        game.companionCd = 8;
        Combat.cast(game, c, game.lastPower, { weak: true, team: "player" });
        game.fx.push({ kind: "ring", x: c.x, y: c.y, r: 6, life: 0.4, color: PALETTE.gold });
        Combat.burst(game, c.x, c.y, PALETTE.gold);
    },

    hazard(game, dt) {
        const p = game.player;
        const t = worldToTile(p.x, p.y);
        const ch = game.sector && game.sector.tiles[t.y] ? game.sector.tiles[t.y][t.x] : ".";
        if (ch === "~") {
            game.hazardT -= dt;
            if (game.hazardT <= 0) {
                game.hazardT = 0.85;
                Combat.hurtPlayer(game, 1, p.x, p.y + 10);
            }
        } else {
            game.hazardT = 0.35;
        }
    },

    draw(ctx, game) {
        const cam = game.camera;
        const sector = game.sector;
        for (let i = 0; i < game.enemies.length; i++) drawTelegraph(ctx, game.enemies[i], cam);
        if (sector && sector.sticker && !game.sticker) {
            Sprites.draw(ctx, "bot", sector.sticker.x - cam.x, sector.sticker.y - cam.y, false);
        }
        const drawables = [];
        if (game.player && game.player.hp > 0) drawables.push({ y: game.player.y, kind: "player" });
        if (game.companionJoined && game.companion) drawables.push({ y: game.companion.y, kind: "companion" });
        for (let i = 0; i < game.enemies.length; i++) {
            if (game.enemies[i].alive) drawables.push({ y: game.enemies[i].y, kind: "enemy", ent: game.enemies[i] });
        }
        drawables.sort((a, b) => a.y - b.y);
        for (let i = 0; i < drawables.length; i++) {
            const item = drawables[i];
            if (item.kind === "player") drawPlayer(ctx, game);
            else if (item.kind === "companion") drawCompanion(ctx, game);
            else drawEnemy(ctx, game, item.ent);
        }
        drawShots(ctx, game);
        drawFx(ctx, game);
        if (game.hint) {
            const touch = document.body.classList.contains("touch") || document.body.classList.contains("has-coarse");
            ctx.fillStyle = PALETTE.gold;
            ctx.font = "12px ui-monospace, monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText((touch ? "" : "E  ") + game.hint.label, game.hint.x - cam.x, game.hint.y - cam.y - 16);
        }
    },
};

function drawTelegraph(ctx, e, cam) {
    const t = e.telegraph;
    if (!t) return;
    ctx.save();
    ctx.strokeStyle = t.color;
    ctx.fillStyle = t.color;
    ctx.lineWidth = 2;
    const x = e.x - cam.x;
    const y = e.y - cam.y;
    if (t.kind === "ring") {
        const left = Math.max(0, Math.min(1, (e.timer || 0) / 0.72));
        const r = t.r * (0.62 + 0.38 * (1 - left));
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(t.x - cam.x, t.y - cam.y, r, 0, Math.PI * 2);
        ctx.stroke();
    } else if (t.kind === "lane" && t.dir) {
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(t.dir.y, t.dir.x));
        ctx.globalAlpha = 0.35;
        ctx.fillRect(8, -t.width / 2, t.len, t.width);
        ctx.globalAlpha = 1;
        ctx.strokeRect(8, -t.width / 2, t.len, t.width);
    } else if (t.kind === "tether") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(t.x2 - cam.x, t.y2 - cam.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(t.x2 - cam.x, t.y2 - cam.y, 8, 0, Math.PI * 2);
        ctx.stroke();
    } else if (t.kind === "cross" && t.dir) {
        const ang = Math.atan2(t.dir.y, t.dir.x);
        ctx.beginPath();
        for (let s = -1; s <= 1; s += 2) {
            const a = ang + s * 0.7;
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(a) * t.len, y + Math.sin(a) * t.len);
        }
        ctx.stroke();
    } else if (t.kind === "storm" && t.pts && t.pts.length) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(t.pts[0].x - cam.x, t.pts[0].y - cam.y);
        for (let p = 1; p < t.pts.length; p++) ctx.lineTo(t.pts[p].x - cam.x, t.pts[p].y - cam.y);
        ctx.stroke();
    }
    ctx.restore();
}

function shadow(ctx, x, y) {
    ctx.fillStyle = "rgba(14, 20, 36, 0.55)";
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer(ctx, game) {
    const p = game.player;
    const cam = game.camera;
    if (p.invuln > 0 && Math.floor(game.time * 16) % 2 === 0) return;
    const bobRate = p.heroId === "rae" ? 12 : 8;
    const bob = p.moving ? (Math.floor(game.time * bobRate) % 2) : 0;
    const sx = p.x - cam.x;
    const sy = p.y - cam.y + bob;
    shadow(ctx, sx, sy);
    const hero = HEROES[p.heroId];
    const color = saberById(game.saber).color;
    if (hero.melee === "spin" && p.swing > 0) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, hero.range * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = PALETTE.foam;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    } else if (p.swing > 0) {
        Sprites.drawSwing(ctx, sx, sy, p.facing, hero.range, color, p.swing);
        Sprites.drawBlade(ctx, sx, sy, p.facing, hero.range, color, 4);
    } else {
        Sprites.drawBlade(ctx, sx, sy, p.facing, 16, color, 3);
    }
    Sprites.draw(ctx, Sprites.heroKey(p.heroId, p.facing), sx, sy, Sprites.heroFlip(p.facing));
}

function drawCompanion(ctx, game) {
    const c = game.companion;
    const cam = game.camera;
    const sx = c.x - cam.x;
    const sy = c.y - cam.y + Math.sin((c.bob || 0) * 6) * 1;
    const glow = c.echoT > 0 ? 0.85 : 0.4;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = c.echoT > 0 ? 3 : 2;
    ctx.beginPath();
    ctx.arc(sx, sy, c.echoT > 0 ? 14 + (0.55 - c.echoT) * 10 : 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    shadow(ctx, sx, sy);
    Sprites.draw(ctx, "little", sx, sy, c.facing.x < 0);
}

function drawEnemy(ctx, game, e) {
    const cam = game.camera;
    const sx = e.x - cam.x;
    const sy = e.y - cam.y;
    shadow(ctx, sx, sy);
    const key = e.kind === "boss" ? "boss-" + e.bossId : "guard";
    const flip = e.facing.x < 0;
    Sprites.draw(ctx, key, sx, sy, flip);
    if (e.hitFlash > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.85;
        Sprites.draw(ctx, key, sx, sy, flip);
        ctx.restore();
    }
    if (e.kind === "boss") {
        const w = 36;
        const pct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = PALETTE.ink;
        ctx.fillRect(sx - w / 2, sy - 32, w, 4);
        ctx.fillStyle = PALETTE.danger;
        ctx.fillRect(sx - w / 2, sy - 32, w * pct, 4);
    }
}

function drawShots(ctx, game) {
    const cam = game.camera;
    for (let i = 0; i < game.shots.length; i++) {
        const s = game.shots[i];
        const x = s.x - cam.x;
        const y = s.y - cam.y - (s.kind === "rock" ? Math.sin(s.hop * 10) * 8 : 0);
        ctx.fillStyle = s.color;
        if (s.kind === "saber") {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((s.spin || 0));
            ctx.fillStyle = s.color;
            ctx.globalAlpha = 0.35;
            ctx.fillRect(-4, -10, 8, 20);
            ctx.globalAlpha = 1;
            ctx.fillRect(-2, -8, 4, 16);
            ctx.fillStyle = PALETTE.foam;
            ctx.fillRect(-1, -6, 2, 12);
            ctx.restore();
        } else if (s.kind === "bow") {
            ctx.fillStyle = PALETTE.gold;
            ctx.fillRect(x - 3, y - 3, 6, 6);
        } else if (s.kind === "rock") {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((s.hop || 0) * 9);
            ctx.fillStyle = PALETTE.panel;
            ctx.fillRect(-5, -4, 10, 8);
            ctx.fillStyle = PALETTE.ink;
            ctx.fillRect(-2, -2, 3, 3);
            ctx.fillStyle = PALETTE.gold;
            ctx.fillRect(1, -3, 2, 2);
            ctx.restore();
        } else {
            ctx.fillStyle = PALETTE.foam;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }
}

function drawFx(ctx, game) {
    const cam = game.camera;
    for (let i = 0; i < game.fx.length; i++) {
        const f = game.fx[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 3));
        ctx.strokeStyle = f.color;
        ctx.fillStyle = f.color;
        if (f.kind === "spark") ctx.fillRect(f.x - cam.x, f.y - cam.y, 2, 2);
        else if (f.kind === "bolt" && f.pts && f.pts.length) {
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(f.pts[0].x - cam.x, f.pts[0].y - cam.y);
            for (let p = 1; p < f.pts.length; p++) ctx.lineTo(f.pts[p].x - cam.x, f.pts[p].y - cam.y);
            ctx.stroke();
            ctx.strokeStyle = PALETTE.foam;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (f.kind === "ring") {
            ctx.lineWidth = f.grow ? 3 : 2;
            ctx.beginPath();
            ctx.arc(f.x - cam.x, f.y - cam.y, f.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}
