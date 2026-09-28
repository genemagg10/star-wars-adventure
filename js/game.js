// Star Station Adventure — title, decks, chase lane, and the Hooded Master.

const Game = {
    mode: "menu",
    time: 0,
    last: 0,
    frozen: false,
    paused: false,
    down: {},
    pressed: {},
    camera: { x: 0, y: 0 },
    shake: 0,
    heroId: null,
    pendingHero: null,
    saber: "blue",
    powers: [],
    activePower: null,
    lastPower: null,
    companionJoined: false,
    companion: null,
    companionCd: 8,
    sticker: false,
    achievements: [],
    bossesDown: [],
    resolved: {},
    won: false,
    sectorIndex: 0,
    sector: null,
    player: null,
    enemies: [],
    shots: [],
    fx: [],
    hint: null,
    objective: "",
    bannerT: 0,
    toastText: "",
    toastT: 0,
    secretOpen: false,
    hazardT: 0.4,
    pending: null,
    downed: false,
    chase: null,
    stars: null,

    init() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.bindInput();
        TouchControls.init();
        UI.init();
        Sprites.build();
        UI.paintPortraits();
        this.resize();
        const frame = document.getElementById("frame");
        if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(() => this.resize()).observe(frame);
        }
        window.addEventListener("resize", () => this.resize());
        UI.showTitle();
        requestAnimationFrame((t) => this.loop(t));
    },

    resize() {
        const frame = document.getElementById("frame");
        const rect = frame.getBoundingClientRect();
        const aspect = rect.width / Math.max(1, rect.height);
        const w = canvasWidthForAspect(aspect);
        CANVAS_W = w;
        if (this.canvas.width !== w || this.canvas.height !== CANVAS_H) {
            this.canvas.width = w;
            this.canvas.height = CANVAS_H;
            this.ctx.imageSmoothingEnabled = false;
        }
    },

    bindInput() {
        const block = { Space: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1 };
        window.addEventListener("keydown", (e) => {
            if (block[e.code]) e.preventDefault();
            SoundSystem.unlock();
            if (e.repeat) return;
            this.down[e.code] = true;
            this.pressed[e.code] = true;
            if (UI.cardOpen && (e.code === "Enter" || e.code === "KeyE")) {
                this.pressed[e.code] = false;
                UI.activatePrimary();
                return;
            }
            if (e.code === "Escape") this.onEsc();
        });
        window.addEventListener("keyup", (e) => {
            this.down[e.code] = false;
        });
        window.addEventListener("pointerdown", () => SoundSystem.unlock());
    },

    onEsc() {
        if (UI.cardOpen) return;
        if (this.mode !== "play" && this.mode !== "chase") return;
        if (this.paused) this.resume();
        else this.pause();
    },

    loop(ts) {
        if (!this.last) this.last = ts;
        const dt = Math.min(0.05, (ts - this.last) / 1000);
        this.last = ts;
        this.time += dt;
        const input = this.readInput();
        if (this.mode === "play") this.updatePlay(dt, input);
        else if (this.mode === "chase") this.updateChase(dt, input);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    },

    readInput() {
        const edges = TouchControls.takeEdges();
        const pressed = this.pressed;
        this.pressed = {};
        if (!this.frozen && (this.mode === "play" || this.mode === "chase")) {
            for (let i = 0; i < POWER_SLOTS.length; i++) {
                const id = POWER_SLOTS[i];
                const hit = pressed[POWERS[id].code] || pressed["Numpad" + POWERS[id].slot];
                if (!hit || this.mode !== "play") continue;
                if (this.owns(id)) {
                    this.activePower = id;
                    this.toast(POWERS[id].name);
                } else {
                    this.toast(POWERS[id].name + " is still locked");
                }
            }
        }
        let x = 0;
        let y = 0;
        if (this.down.KeyA || this.down.ArrowLeft) x -= 1;
        if (this.down.KeyD || this.down.ArrowRight) x += 1;
        if (this.down.KeyW || this.down.ArrowUp) y -= 1;
        if (this.down.KeyS || this.down.ArrowDown) y += 1;
        let move = { x: 0, y: 0 };
        if (x || y) move = normalize(x, y);
        else if (Math.hypot(TouchControls.vec.x, TouchControls.vec.y) > 0.18) {
            move = { x: TouchControls.vec.x, y: TouchControls.vec.y };
        }
        return {
            move: move,
            attack: !!this.down.Space || TouchControls.holding.attack,
            power: !!pressed.KeyQ || edges.power,
            interact: !!pressed.KeyE || edges.interact,
        };
    },

    updatePlay(dt, input) {
        if (this.toastT > 0) this.toastT -= dt;
        if (this.bannerT > 0) this.bannerT -= dt;
        this.shake = Math.max(0, this.shake - dt);
        if (this.frozen || !this.player) return;
        Entities.updateAll(this, dt, input);
        if (this.pending && !this.frozen) {
            this.pending.t -= dt;
            if (this.pending.t <= 0) {
                const id = this.pending.id;
                this.pending = null;
                this.openReward(id);
            }
        }
        this.focusCamera();
    },

    owns(id) {
        return this.powers.indexOf(id) >= 0;
    },

    missingPowers() {
        const miss = [];
        for (let i = 0; i < POWER_SLOTS.length; i++) {
            if (!this.owns(POWER_SLOTS[i])) miss.push(POWER_SLOTS[i]);
        }
        return miss;
    },

    solidAt(tx, ty) {
        return World.isSolid(this.sector, tx, ty, this.secretOpen);
    },

    circleBlocked(x, y, r) {
        const minX = Math.floor((x - r) / TILE);
        const maxX = Math.floor((x + r) / TILE);
        const minY = Math.floor((y - r) / TILE);
        const maxY = Math.floor((y + r) / TILE);
        for (let ty = minY; ty <= maxY; ty++) {
            for (let tx = minX; tx <= maxX; tx++) {
                if (this.solidAt(tx, ty)) return true;
            }
        }
        return false;
    },

    focusCamera() {
        if (!this.player || !this.sector) return;
        this.camera.x = cameraAxis(this.player.x, this.sector.w * TILE, CANVAS_W);
        this.camera.y = cameraAxis(this.player.y, this.sector.h * TILE, CANVAS_H);
    },

    toast(text) {
        this.toastText = text;
        this.toastT = 1.8;
    },

    pickHero(id) {
        this.pendingHero = id;
        UI.showColor();
    },

    pickColor(id) {
        this.startNew(this.pendingHero || "lucan", id);
    },

    startNew(heroId, saber) {
        this.heroId = heroId;
        this.saber = saber || "blue";
        this.powers = [];
        this.activePower = null;
        this.lastPower = null;
        this.companionJoined = false;
        this.companion = null;
        this.companionCd = 8;
        this.sticker = false;
        this.achievements = [];
        this.bossesDown = [];
        this.resolved = {};
        this.won = false;
        this.paused = false;
        this.frozen = false;
        UI.hideAll();
        this.enterSector(0);
        this.toast("WASD move · Space attack · E interact");
        this.toastT = 4.2;
        this.save();
    },

    continueGame() {
        const data = SaveSystem.read();
        if (!data) return;
        this.heroId = data.heroId || "lucan";
        this.saber = data.saber || "blue";
        this.powers = (data.powers || []).slice();
        this.activePower = data.activePower || null;
        this.lastPower = this.activePower;
        this.companionJoined = !!data.companionJoined;
        this.companionCd = 4;
        this.sticker = !!data.sticker;
        this.achievements = (data.achievements || []).slice();
        this.bossesDown = (data.bossesDown || []).slice();
        this.resolved = Object.assign({}, data.resolved || {});
        this.won = !!data.won;
        this.paused = false;
        UI.hideAll();
        if (this.won) {
            this.mode = "menu";
            document.body.classList.remove("playing");
            this.openWin();
            return;
        }
        const idx = clamp(data.sectorIndex || 0, 0, World.sectors.length - 1);
        this.enterSector(idx);
    },

    enterSector(index) {
        this.sectorIndex = index;
        const spec = World.sectors[index];
        this.sector = World.bake(spec);
        this.secretOpen = false;
        this.hazardT = 0.4;
        this.pending = null;
        this.downed = false;
        this.shots = [];
        this.fx = [];
        this.hint = null;
        this.bannerT = 2.3;
        this.player = Entities.makePlayer(this.heroId, this.sector.spawn.x, this.sector.spawn.y);
        this.enemies = [];
        const bossDown = !!(spec.bossId && this.bossesDown.indexOf(spec.bossId) >= 0);
        const missing = spec.bossId === "hooded" ? this.missingPowers() : [];
        if (!bossDown && missing.length === 0) {
            for (let i = 0; i < this.sector.guards.length; i++) {
                const g = this.sector.guards[i];
                this.enemies.push(Entities.makeGuard(g.x, g.y));
            }
            if (this.sector.boss) {
                this.enemies.push(Entities.makeBoss(spec.bossId, this.sector.boss.x, this.sector.boss.y, this.powers));
            }
        }
        this.companion = this.companionJoined
            ? Entities.makeCompanion(this.player.x - 12, this.player.y + 16)
            : null;
        this.mode = "play";
        document.body.classList.add("playing");
        this.refreshObjective();
        this.focusCamera();
        if (missing.length) {
            const names = missing.map((id) => POWERS[id].name).join(", ");
            this.openCard({
                kicker: "Core Gate",
                title: "The way is sealed",
                body: "The Hooded Master waits until you hold Force Push, Saber Throw, Lightning, and Rock Toss. Still missing: " + names + ".",
                buttons: [{
                    label: "Fall back",
                    onClick: () => {
                        this.closeCard();
                        this.enterSector(Math.max(0, index - 1));
                    },
                }],
            });
        } else if (bossDown && spec.bossId && !this.resolved[spec.bossId]) {
            this.openReward(spec.bossId);
        }
    },

    refreshObjective() {
        const s = this.sector;
        if (!s) return;
        if (s.bossId === "hooded" && this.missingPowers().length) {
            this.objective = "The core is sealed";
            return;
        }
        const bossAlive = this.enemies.some((e) => e.alive && e.kind === "boss");
        if (bossAlive) {
            const boss = this.enemies.filter((e) => e.kind === "boss")[0];
            this.objective = "Defeat the " + (boss ? boss.name : "boss");
            return;
        }
        if (s.needsChest && !this.owns("rock")) {
            this.objective = "Open the salvage chest";
            return;
        }
        if (this.enemies.some((e) => e.alive)) {
            this.objective = "Drop the white troopers";
            return;
        }
        if (s.exit) this.objective = "Reach the north lock";
        else this.objective = "Hold the deck";
    },

    exitOpen() {
        const s = this.sector;
        if (!s || !s.exit) return false;
        if (s.needsChest && !this.owns("rock")) return false;
        if (this.enemies.some((e) => e.alive)) return false;
        return true;
    },

    updateHint() {
        const p = this.player;
        const s = this.sector;
        this.hint = null;
        if (!p || !s) return;
        const near = (pt, r) => pt && dist(p.x, p.y, pt.x, pt.y) < r;
        if (near(s.chest, 42) && !this.owns("rock")) this.hint = { x: s.chest.x, y: s.chest.y, label: "Chest" };
        else if (near(s.panel, 42) && !this.secretOpen) this.hint = { x: s.panel.x, y: s.panel.y, label: "Hatch" };
        else if (near(s.sticker, 44) && this.secretOpen && !this.sticker) this.hint = { x: s.sticker.x, y: s.sticker.y, label: "Sticker" };
        else if (near(s.exit, 44)) this.hint = { x: s.exit.x, y: s.exit.y, label: this.exitOpen() ? "Leave" : "Shut" };
    },

    tryInteract() {
        if (this.frozen || !this.player || !this.sector) return;
        const p = this.player;
        const s = this.sector;
        const near = (pt, r) => pt && dist(p.x, p.y, pt.x, pt.y) < r;
        if (near(s.chest, 36) && !this.owns("rock")) {
            this.grantPower("rock");
            this.save();
            SoundSystem.pickup();
            this.openCard({
                kicker: "Salvage chest",
                title: "Rock Toss",
                body: "The chest in the Trash Compactor clicks open. Press 4 to ready Rock Toss, then Q to throw it.",
                buttons: [{ label: "Take it", onClick: () => this.closeCard() }],
            });
            return;
        }
        if (near(s.panel, 36) && !this.secretOpen) {
            this.secretOpen = true;
            this.toast("A side hatch opens");
            SoundSystem.ui();
            return;
        }
        if (near(s.sticker, 40) && this.secretOpen && !this.sticker) {
            this.sticker = true;
            this.grantAchievement("sticker");
            this.save();
            SoundSystem.pickup();
            this.openCard({
                kicker: "Achievement",
                title: ACHIEVEMENTS.sticker,
                body: "The hatch hid a quiet Chewoo-bot. You take the sticker. It does not wake.",
                buttons: [{ label: "Leave it be", onClick: () => this.closeCard() }],
            });
            return;
        }
        if (near(s.exit, 36)) {
            if (this.exitOpen()) {
                SoundSystem.ui();
                this.advance();
            } else {
                this.toast("The way is shut");
            }
        }
    },

    grantPower(id) {
        if (!this.owns(id)) this.powers.push(id);
        this.activePower = id;
        this.lastPower = id;
    },

    grantAchievement(id) {
        for (let i = 0; i < this.achievements.length; i++) {
            if (this.achievements[i].id === id) return;
        }
        this.achievements.push({ id: id, name: ACHIEVEMENTS[id] });
    },

    notePowerUsed(id) {
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (e.alive && e.bossId === "hooded") e.mirror = id;
        }
    },

    onBossDown(id) {
        if (this.bossesDown.indexOf(id) < 0) this.bossesDown.push(id);
        this.save();
        this.pending = { t: 0.55, id: id };
    },

    onPlayerDown() {
        if (this.downed) return;
        this.downed = true;
        this.pending = null;
        this.openCard({
            title: "Hull breach",
            body: "The white troopers got through. This deck is still waiting.",
            buttons: [{
                label: "Try this sector again",
                onClick: () => {
                    this.closeCard();
                    this.enterSector(this.sectorIndex);
                },
            }],
        });
    },

    openReward(id) {
        if (id === "chrome") {
            this.grantPower("push");
            this.save();
            SoundSystem.fanfare();
            this.openCard({
                kicker: "Power",
                title: "Force Push",
                body: "The Chrome Captain's core is yours. Press 1 to ready Force Push, then Q to use it.",
                buttons: [
                    { label: "Chase the lane", onClick: () => this.startChase() },
                    { label: "Stay on the station", onClick: () => this.afterReward("chrome") },
                ],
            });
            return;
        }
        if (id === "shadow") {
            this.grantPower("throw");
            this.save();
            SoundSystem.fanfare();
            this.openCard({
                kicker: "Power",
                title: "Saber Throw",
                body: "Press 2 to ready Saber Throw, then Q to let it fly. This chase lane is sealed. The snub fighters never launch.",
                buttons: [{ label: "Continue", onClick: () => this.afterReward("shadow") }],
            });
            return;
        }
        if (id === "dark") {
            this.companionJoined = true;
            if (this.player) this.companion = Entities.makeCompanion(this.player.x - 14, this.player.y + 18);
            this.companionCd = 2;
            this.save();
            SoundSystem.fanfare();
            this.openCard({
                kicker: "Companion",
                title: "Little One",
                body: "Little One joins you. They have no heart of their own. They echo your last power, softly, after a long wait. This chase lane is sealed. The snub fighters never launch.",
                buttons: [{ label: "Continue", onClick: () => this.afterReward("dark") }],
            });
            return;
        }
        if (id === "fallen") {
            this.grantPower("lightning");
            this.save();
            SoundSystem.fanfare();
            this.openCard({
                kicker: "Power",
                title: "Lightning",
                body: "Press 3 to ready Lightning, then Q. Lavender light answers. This chase lane is sealed. The snub fighters never launch.",
                buttons: [{ label: "Continue", onClick: () => this.afterReward("fallen") }],
            });
            return;
        }
        if (id === "hooded") this.openWin();
    },

    afterReward(id) {
        this.resolved[id] = true;
        this.paused = false;
        UI.hidePause();
        this.closeCard();
        this.save();
        this.advance();
    },

    advance() {
        if (this.sectorIndex >= World.sectors.length - 1) return;
        this.enterSector(this.sectorIndex + 1);
        this.save();
    },

    openWin() {
        this.won = true;
        this.grantAchievement("saved");
        this.resolved.hooded = true;
        this.save();
        const notes = [ACHIEVEMENTS.saved];
        if (this.sticker) notes.push(ACHIEVEMENTS.sticker);
        SoundSystem.win();
        this.openCard({
            kicker: "Achievement",
            title: "Station Saved",
            body: "The Hooded Master falls. The Battle Station's core holds.",
            line: WIN_LINE,
            notes: notes,
            buttons: [
                { label: "Back to title", onClick: () => this.quitToTitle() },
                { label: "Play again", onClick: () => this.playAgain() },
            ],
        });
    },

    playAgain() {
        this.closeCard();
        this.paused = false;
        this.frozen = false;
        this.mode = "menu";
        document.body.classList.remove("playing");
        UI.showHero();
    },

    startChase() {
        this.resolved.chrome = true;
        this.paused = false;
        UI.hidePause();
        this.closeCard();
        this.downed = false;
        this.mode = "chase";
        this.chase = {
            t: 0,
            duration: 30,
            hp: 6,
            maxHp: 6,
            invuln: 0,
            x: CANVAS_W / 2,
            y: CANVAS_H * 0.68,
            facing: { x: 0, y: -1 },
            cd: 0,
            enemies: [],
            shots: [],
            spawn: 0.3,
            over: false,
        };
        document.body.classList.add("playing");
        this.toast("Twin-engine fighter. Shoot the snub fighters.");
        this.toastT = 3.2;
        this.save();
    },

    updateChase(dt, input) {
        if (this.toastT > 0) this.toastT -= dt;
        if (this.frozen || !this.chase || this.chase.over) return;
        const c = this.chase;
        c.t += dt;
        c.invuln = Math.max(0, c.invuln - dt);
        c.cd = Math.max(0, c.cd - dt);
        const spd = 230;
        c.x = clamp(c.x + input.move.x * spd * dt, 36, CANVAS_W - 36);
        c.y = clamp(c.y + input.move.y * spd * dt, 70, CANVAS_H - 36);
        if (input.move.x || input.move.y) c.facing = { x: input.move.x, y: input.move.y };
        if (input.attack && c.cd <= 0) {
            c.cd = 0.2;
            const dir = c.facing.x || c.facing.y ? c.facing : { x: 0, y: -1 };
            const n = normalize(dir.x, dir.y);
            c.shots.push({ x: c.x + n.x * 16, y: c.y + n.y * 16, vx: n.x * 380, vy: n.y * 380, team: "player", life: 1.1 });
            SoundSystem.shot();
        }
        c.spawn -= dt;
        if (c.spawn <= 0 && c.t < c.duration - 3 && c.enemies.length < 6) {
            c.spawn = 1.15;
            c.enemies.push({
                x: 50 + Math.random() * (CANVAS_W - 100),
                y: -16,
                hp: 2,
                vx: (Math.random() - 0.5) * 40,
                vy: 80 + Math.random() * 40,
                cd: 0.6 + Math.random(),
            });
        }
        for (let i = c.enemies.length - 1; i >= 0; i--) {
            const e = c.enemies[i];
            e.x += e.vx * dt;
            e.y += e.vy * dt;
            e.cd -= dt;
            if (e.cd <= 0 && e.y > 10 && e.y < CANVAS_H) {
                e.cd = 1.45;
                const aim = normalize(c.x - e.x, c.y - e.y);
                c.shots.push({ x: e.x, y: e.y + 8, vx: aim.x * 150, vy: aim.y * 150, team: "foe", life: 2 });
                SoundSystem.bolt();
            }
            if (dist(e.x, e.y, c.x, c.y) < 22) this.chaseHurt(c);
            if (e.y > CANVAS_H + 30 || e.hp <= 0) c.enemies.splice(i, 1);
        }
        for (let i = c.shots.length - 1; i >= 0; i--) {
            const s = c.shots[i];
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.life -= dt;
            let gone = s.life <= 0 || s.y < -30 || s.y > CANVAS_H + 30 || s.x < -20 || s.x > CANVAS_W + 20;
            if (!gone && s.team === "player") {
                for (let n = 0; n < c.enemies.length; n++) {
                    const e = c.enemies[n];
                    if (dist(s.x, s.y, e.x, e.y) < 16) {
                        e.hp -= 1;
                        gone = true;
                        SoundSystem.boom();
                        break;
                    }
                }
            } else if (!gone && s.team === "foe" && dist(s.x, s.y, c.x, c.y) < 14) {
                this.chaseHurt(c);
                gone = true;
            }
            if (gone) c.shots.splice(i, 1);
        }
        if (c.hp <= 0) {
            c.over = true;
            this.openCard({
                title: "Lane breach",
                body: "The snub fighters caught the twin-engine fighter.",
                buttons: [
                    { label: "Retry the lane", onClick: () => this.startChase() },
                    { label: "Skip the lane", onClick: () => this.afterReward("chrome") },
                ],
            });
            return;
        }
        if (c.t >= c.duration) {
            c.over = true;
            SoundSystem.fanfare();
            this.openCard({
                kicker: "Chase Lane",
                title: "Lane clear",
                body: "The twin-engine fighter breaks through the snub fighters.",
                buttons: [{ label: "Continue", onClick: () => this.afterReward("chrome") }],
            });
        }
    },

    chaseHurt(c) {
        if (c.invuln > 0 || c.over || c.hp <= 0) return;
        c.hp -= 1;
        c.invuln = 0.85;
        this.shake = 0.12;
        SoundSystem.hurt();
    },

    openCard(opts) {
        this.frozen = true;
        UI.showCard(opts);
    },

    closeCard() {
        this.frozen = false;
        UI.hideCard();
    },

    pause() {
        if (UI.cardOpen) return;
        if (this.mode !== "play" && this.mode !== "chase") return;
        this.paused = true;
        this.frozen = true;
        UI.showPause();
    },

    resume() {
        this.paused = false;
        this.frozen = false;
        UI.hidePause();
        if (this.mode === "play" || this.mode === "chase") document.body.classList.add("playing");
    },

    quitToTitle() {
        this.closeCard();
        this.paused = false;
        UI.hidePause();
        this.frozen = false;
        this.mode = "menu";
        document.body.classList.remove("playing");
        this.save();
        UI.showTitle();
    },

    snapshot() {
        return {
            heroId: this.heroId,
            saber: this.saber,
            sectorIndex: this.sectorIndex,
            powers: this.powers,
            activePower: this.activePower,
            companionJoined: this.companionJoined,
            sticker: this.sticker,
            achievements: this.achievements,
            bossesDown: this.bossesDown,
            resolved: this.resolved,
            won: this.won,
        };
    },

    save() {
        if (!this.heroId) return false;
        return SaveSystem.write(this.snapshot());
    },

    draw() {
        const ctx = this.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = PALETTE.void;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        if (this.mode === "menu") {
            this.drawStars();
            return;
        }
        ctx.save();
        if (this.shake > 0) {
            const mag = this.shake * 10;
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
        }
        if (this.mode === "chase") this.drawChase();
        else if (this.sector && this.player) {
            World.draw(ctx, this.sector, this.camera, this);
            Entities.draw(ctx, this);
        }
        ctx.restore();
        if ((this.mode === "play" || this.mode === "chase") && (this.player || this.chase)) {
            UI.drawHud(ctx, this);
        }
    },

    drawStars() {
        const ctx = this.ctx;
        if (!this.stars) {
            this.stars = [];
            for (let i = 0; i < 70; i++) {
                this.stars.push({ x: Math.random(), y: Math.random(), s: 1 + (i % 3 === 0 ? 1 : 0) });
            }
        }
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            const y = (s.y + this.time * 0.015) % 1;
            ctx.fillStyle = s.s > 1 ? PALETTE.foam : PALETTE.panel;
            ctx.fillRect((s.x * CANVAS_W) | 0, (y * CANVAS_H) | 0, s.s, s.s);
        }
    },

    drawChase() {
        const ctx = this.ctx;
        const c = this.chase;
        ctx.fillStyle = PALETTE.hull;
        for (let i = 0; i < 10; i++) {
            const y = ((i * 70 + c.t * 180) % (CANVAS_H + 70)) - 30;
            ctx.fillRect(28, y, 6, 22);
            ctx.fillRect(CANVAS_W - 34, y, 6, 22);
        }
        ctx.fillStyle = PALETTE.gold;
        for (let i = 0; i < 7; i++) {
            const y = ((i * 96 + c.t * 240) % (CANVAS_H + 96)) - 40;
            ctx.fillRect(CANVAS_W / 2 - 2, y, 4, 16);
        }
        for (let i = 0; i < c.enemies.length; i++) {
            const e = c.enemies[i];
            blitShip(ctx, "ship-snub", e.x, e.y, { x: e.vx, y: Math.max(0.2, e.vy) });
        }
        for (let i = 0; i < c.shots.length; i++) {
            const s = c.shots[i];
            ctx.fillStyle = s.team === "player" ? PALETTE.blue : PALETTE.foam;
            ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
        }
        blitShip(ctx, "ship-twin", c.x, c.y, c.facing.x || c.facing.y ? c.facing : { x: 0, y: -1 });
    },
};

function blitShip(ctx, key, x, y, facing) {
    const canvas = Sprites.cache[key];
    if (!canvas) return;
    const ang = Math.atan2(facing.y, facing.x) + Math.PI / 2;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(ang);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, Math.round(-canvas.width / 2), Math.round(-canvas.height / 2));
    ctx.restore();
}

window.Game = Game;
window.addEventListener("DOMContentLoaded", () => Game.init());
