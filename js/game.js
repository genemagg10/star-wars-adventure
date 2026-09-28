// Star Wars Adventure — title, decks, three chase lanes, and the Emperor.
// One chase mode. CHASE_LANES supplies duration, density, props, and the win.

const CHASE_LANES = {
    hangar: {
        id: "hangar",
        kicker: "Hangar Run",
        objective: "Break through the TIEs",
        toast: "X-wing. Shoot the TIE fighters.",
        duration: 28,
        spawnEvery: 0.55,
        cap: 8,
        pairChance: 0.55,
        pattern: "swarm",
        props: "bay",
        margin: 36,
        win: "survive",
        resolve: "chrome",
        accent: PALETTE.gold,
        foeHp: 2,
        shotGap: 1.2,
        winTitle: "Hangar clear",
        winBody: "The X-wing breaks through the TIE fighters.",
        loseBody: "The TIE fighters caught the X-wing.",
    },
    bay: {
        id: "bay",
        kicker: "Vader's Bay",
        objective: "Slip the shuttles",
        toast: "Darth Vader's bay. Weave the columns.",
        duration: 24,
        spawnEvery: 0.85,
        cap: 5,
        pairChance: 0,
        pattern: "columns",
        props: "gantry",
        margin: 48,
        win: "survive",
        resolve: "dark",
        accent: PALETTE.orange,
        foeHp: 3,
        shotGap: 0.95,
        winTitle: "Bay clear",
        winBody: "The shuttles fall behind. Grogu stays with you.",
        loseBody: "A shuttle caught the X-wing.",
    },
    trench: {
        id: "trench",
        kicker: "Trench Run",
        objective: "Thread the trench",
        toast: "Trench run. Stay off the towers.",
        duration: 26,
        spawnEvery: 0.7,
        cap: 7,
        pairChance: 0.4,
        pattern: "trench",
        props: "trench",
        margin: 108,
        win: "survive",
        resolve: null,
        accent: PALETTE.blue,
        foeHp: 2,
        shotGap: 1.05,
        winTitle: "Trench clear",
        winBody: "The surface towers fall silent. The Emperor is waiting.",
        loseBody: "The towers caught the X-wing.",
    },
};

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
    flash: 0,
    hitStop: 0,
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
        SoundSystem.loadMute();
        UI.paintMute();
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
        this.cssW = rect.width;
        this.cssH = rect.height;
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
        this.shake = Math.max(0, this.shake - dt);
        this.flash = Math.max(0, this.flash - dt);
        if (this.hitStop > 0) {
            this.hitStop -= dt;
            this.readInput();
            TouchControls.sync(this);
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }
        const input = this.readInput();
        if (this.mode === "play") this.updatePlay(dt, input);
        else if (this.mode === "chase") this.updateChase(dt, input);
        TouchControls.sync(this);
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

    cyclePower() {
        const owned = [];
        for (let i = 0; i < POWER_SLOTS.length; i++) {
            if (this.owns(POWER_SLOTS[i])) owned.push(POWER_SLOTS[i]);
        }
        if (!owned.length) {
            this.toast("No power yet");
            return;
        }
        let idx = owned.indexOf(this.activePower);
        idx = idx < 0 ? 0 : (idx + 1) % owned.length;
        this.activePower = owned[idx];
        this.toast(POWERS[this.activePower].name);
        SoundSystem.ui();
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
        this.toast("Move, swing the lightsaber, interact");
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
        const rewardWaiting = bossDown && spec.bossId && !this.resolved[spec.bossId];
        if (!missing.length && !rewardWaiting) {
            this.toast(spec.name);
            this.toastT = 2.1;
        }
        if (missing.length) {
            const names = missing.map((id) => POWERS[id].name).join(", ");
            this.openCard({
                kicker: "Core Gate",
                title: "Four powers first",
                body: "The Emperor waits until you hold Force Push, Saber Throw, Lightning, and Rock Toss. Still missing: " + names + ".",
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
        } else if (spec.id === "core" && !bossDown && !this.resolved.trench) {
            this.openCard({
                kicker: "Trench Run",
                title: "The trench is open",
                loud: true,
                body: "Surface towers line the trench to the Emperor. Fly it in the X-wing, or walk in and face him.",
                buttons: [
                    { label: "Fly the trench", onClick: () => this.startChase("trench") },
                    { label: "Face the Emperor", onClick: () => this.closeCard() },
                ],
            });
        }
        // Entrance snapshot only. Continue does not restore secretOpen or a mid-fight position.
        this.save();
    },

    refreshObjective() {
        const s = this.sector;
        if (!s) return;
        if (s.bossId === "hooded" && this.missingPowers().length) {
            this.objective = "Earn four Force powers";
            return;
        }
        const bossAlive = this.enemies.some((e) => e.alive && e.kind === "boss");
        if (bossAlive) {
            this.objective = s.bossGoal || "Defeat the boss";
            return;
        }
        if (this.chestBlocksExit()) {
            this.objective = s.chestGoal || "Open the salvage chest";
            return;
        }
        if (this.enemies.some((e) => e.alive)) {
            this.objective = s.clearGoal || "Clear the deck";
            return;
        }
        if (s.exit) this.objective = s.exitGoal || "Reach the north lock";
        else this.objective = s.clearGoal || "Hold the deck";
    },

    chestBlocksExit() {
        const s = this.sector;
        return !!(s && s.needsChest && s.chestReachable && !this.owns("rock"));
    },

    exitOpen() {
        const s = this.sector;
        if (!s || !s.exit) return false;
        if (this.chestBlocksExit()) return false;
        if (this.enemies.some((e) => e.alive)) return false;
        return true;
    },

    updateHint() {
        const p = this.player;
        const s = this.sector;
        this.hint = null;
        if (!p || !s) return;
        const near = (pt, r) => pt && dist(p.x, p.y, pt.x, pt.y) < r;
        if (near(s.chest, 44) && !this.owns("rock")) this.hint = { x: s.chest.x, y: s.chest.y, label: "Chest" };
        else if (near(s.panel, 44) && !this.secretOpen) this.hint = { x: s.panel.x, y: s.panel.y, label: "Hatch" };
        else if (near(s.sticker, 44) && this.secretOpen && !this.sticker) this.hint = { x: s.sticker.x, y: s.sticker.y, label: "Sticker" };
        else if (near(s.exit, 44)) this.hint = { x: s.exit.x, y: s.exit.y, label: this.exitOpen() ? "Leave" : "Shut" };
    },

    tryInteract() {
        if (this.frozen || !this.player || !this.sector) return;
        const p = this.player;
        const s = this.sector;
        const near = (pt, r) => pt && dist(p.x, p.y, pt.x, pt.y) < r;
        if (near(s.chest, 44) && !this.owns("rock")) {
            this.grantPower("rock");
            this.save();
            SoundSystem.unlock();
            SoundSystem.learned();
            this.openCard({
                kicker: "Salvage chest",
                title: "Rock Toss",
                loud: true,
                body: "The chest between Darth Vader and Kylo Ren clicks open. Press 4, tap gem 4, or hold Power to switch. Then toss it.",
                powerDrop: true,
                buttons: [{ label: "Take it", onClick: () => this.closeCard() }],
            });
            return;
        }
        if (near(s.panel, 44) && !this.secretOpen) {
            this.secretOpen = true;
            this.toast("A side hatch opens");
            SoundSystem.ui();
            return;
        }
        if (near(s.sticker, 44) && this.secretOpen && !this.sticker) {
            this.sticker = true;
            this.grantAchievement("sticker");
            this.save();
            SoundSystem.pickup();
            this.openCard({
                kicker: "Achievement",
                title: ACHIEVEMENTS.sticker,
                body: "The hatch hid a quiet Chewbacca-bot. You take the sticker. It does not wake.",
                buttons: [{ label: "Leave it be", onClick: () => this.closeCard() }],
            });
            return;
        }
        if (near(s.exit, 44)) {
            if (this.exitOpen()) {
                SoundSystem.ui();
                this.advance();
            } else {
                this.toast("The way is shut");
            }
            return;
        }
        this.toast("Nothing nearby");
    },

    grantPower(id) {
        const fresh = !this.owns(id);
        if (fresh) this.powers.push(id);
        this.activePower = id;
        this.lastPower = id;
        if (fresh && this.player) {
            const color = id === "lightning" ? PALETTE.lightning
                : id === "rock" ? PALETTE.gold
                : id === "throw" ? PALETTE.purple
                : PALETTE.blue;
            this.flash = 0.2;
            Combat.burst(this, this.player.x, this.player.y, color);
            Combat.burst(this, this.player.x, this.player.y, PALETTE.foam);
            this.fx.push({ kind: "ring", x: this.player.x, y: this.player.y, r: 8, life: 0.4, color: color, grow: 200 });
            this.fx.push({ kind: "ring", x: this.player.x, y: this.player.y, r: 4, life: 0.28, color: PALETTE.gold, grow: 120 });
        }
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
            body: "The stormtroopers got through. This deck is still waiting.",
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
            SoundSystem.unlock();
            SoundSystem.learned();
            this.openCard({
                kicker: "Power",
                title: "Force Push",
                loud: true,
                body: "Captain Phasma's core is yours. Press 1, tap gem 1, or hold Power to switch. Then use Force Push.",
                powerDrop: true,
                buttons: [
                    { label: "Chase the lane", onClick: () => this.startChase("hangar") },
                    { label: "Stay on the Death Star", onClick: () => this.afterReward("chrome") },
                ],
            });
            return;
        }
        if (id === "shadow") {
            this.grantPower("throw");
            this.save();
            SoundSystem.unlock();
            SoundSystem.learned();
            this.openCard({
                kicker: "Power",
                title: "Saber Throw",
                loud: true,
                body: "Press 2, tap gem 2, or hold Power to switch, then let the lightsaber fly.",
                powerDrop: true,
                buttons: [{ label: "Continue", onClick: () => this.afterReward("shadow") }],
            });
            return;
        }
        if (id === "dark") {
            this.companionJoined = true;
            if (this.player) {
                this.companion = Entities.makeCompanion(this.player.x - 14, this.player.y + 18);
                this.companion.echoT = 0.8;
                Combat.burst(this, this.player.x - 14, this.player.y + 18, PALETTE.gold);
            }
            this.companionCd = 2;
            this.save();
            SoundSystem.unlock();
            SoundSystem.bond();
            this.openCard({
                kicker: "Companion",
                title: "Grogu",
                loud: true,
                body: "Grogu, Baby Yoda, joins you. They have no heart of their own. A gold echo follows your last Force power after a long wait. Darth Vader's bay is open if you want the X-wing.",
                buttons: [
                    { label: "Fly the bay", onClick: () => this.startChase("bay") },
                    { label: "Stay on the Death Star", onClick: () => this.afterReward("dark") },
                ],
            });
            return;
        }
        if (id === "fallen") {
            const missedRock = !this.owns("rock");
            this.grantPower("lightning");
            if (missedRock) this.grantPower("rock");
            this.save();
            SoundSystem.unlock();
            SoundSystem.learned();
            const body = missedRock
                ? "Press 3, tap gem 3, or hold Power to switch, for Lightning. The salvage chest could not be opened, so Rock Toss is yours as well. Press 4, then use it."
                : "Press 3, tap gem 3, or hold Power to switch, for Lightning. Lavender light answers.";
            this.openCard({
                kicker: "Power",
                title: "Lightning",
                loud: true,
                powerDrop: true,
                body: body,
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
        // Reward snapshot, then the next deck entrance. Not a mid-fight position.
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
        SoundSystem.unlock();
        SoundSystem.win();
        this.flash = 0.24;
        if (this.player) {
            const color = saberById(this.saber).color;
            Combat.burst(this, this.player.x, this.player.y, color);
            Combat.burst(this, this.player.x, this.player.y, PALETTE.gold);
            this.fx.push({ kind: "ring", x: this.player.x, y: this.player.y, r: 10, life: 0.45, color: PALETTE.gold, grow: 220 });
            if (this.companion) {
                Combat.burst(this, this.companion.x, this.companion.y, PALETTE.gold);
            }
        }
        const hero = HEROES[this.heroId];
        const saber = saberById(this.saber);
        this.openCard({
            kicker: "Achievement",
            title: "Death Star Saved",
            body: (hero ? hero.name : "You") + " holds the core. " + (saber ? saber.name : "The") + " lightsaber stays lit.",
            line: WIN_LINE,
            loud: true,
            celebrate: {
                hero: hero ? hero.name : "Hero",
                heroId: this.heroId,
                saber: saber ? saber.name : "Blue",
                saberColor: saber ? saber.color : PALETTE.blue,
                grogu: this.companionJoined,
            },
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

    startChase(laneId) {
        const lane = CHASE_LANES[laneId] || CHASE_LANES.hangar;
        this.paused = false;
        UI.hidePause();
        this.closeCard();
        this.downed = false;
        this.mode = "chase";
        this.flash = 0;
        this.chase = {
            lane: lane,
            t: 0,
            duration: lane.duration,
            objective: lane.objective,
            hp: 6,
            maxHp: 6,
            invuln: 0,
            x: CANVAS_W / 2,
            y: CANVAS_H * 0.72,
            facing: { x: 0, y: -1 },
            cd: 0,
            pushCd: 0,
            enemies: [],
            shots: [],
            sparks: [],
            spawn: 0.2,
            spawnN: 0,
            over: false,
            beat: null,
            beatT: 0,
            card: false,
        };
        document.body.classList.add("playing");
        this.toast(lane.toast);
        this.toastT = 3.2;
        this.save();
    },

    updateChase(dt, input) {
        if (this.toastT > 0) this.toastT -= dt;
        if (!this.chase) return;
        const c = this.chase;
        this.stepChaseSparks(c, dt);
        if (c.over) {
            if (this.frozen && !c.card) return;
            if (c.beat === "win" && c.beatT > 0 && Math.random() < 0.55) {
                this.chaseSpark(c, c.x + (Math.random() - 0.5) * 50, c.y + (Math.random() - 0.5) * 28, PALETTE.gold);
            }
            c.beatT -= dt;
            if (c.beatT <= 0 && !c.card) {
                c.card = true;
                this.openChaseCard(c);
            }
            return;
        }
        if (this.frozen) return;
        c.t += dt;
        c.invuln = Math.max(0, c.invuln - dt);
        c.cd = Math.max(0, c.cd - dt);
        c.pushCd = Math.max(0, c.pushCd - dt);
        const spd = 250;
        const edge = c.lane.margin || 36;
        c.x = clamp(c.x + input.move.x * spd * dt, edge, CANVAS_W - edge);
        c.y = clamp(c.y + input.move.y * spd * dt, 70, CANVAS_H - 36);
        if (input.move.x || input.move.y) c.facing = { x: input.move.x, y: input.move.y };
        if (input.attack && c.cd <= 0) {
            c.cd = 0.16;
            const dir = c.facing.x || c.facing.y ? c.facing : { x: 0, y: -1 };
            const n = normalize(dir.x, dir.y);
            c.shots.push({ x: c.x + n.x * 16, y: c.y + n.y * 16, vx: n.x * 420, vy: n.y * 420, team: "player", life: 1.05 });
            SoundSystem.shot();
        }
        if (input.power && this.owns("push") && c.pushCd <= 0) {
            c.pushCd = 1.3;
            SoundSystem.force("push", false);
            for (let i = c.shots.length - 1; i >= 0; i--) {
                const s = c.shots[i];
                if (s.team === "foe" && dist(s.x, s.y, c.x, c.y) < 92) {
                    this.chaseSpark(c, s.x, s.y, PALETTE.blue);
                    c.shots.splice(i, 1);
                }
            }
            this.chaseSpark(c, c.x, c.y - 16, PALETTE.foam);
        }
        const lane = c.lane;
        c.spawn -= dt;
        if (c.spawn <= 0 && c.t < c.duration - 2.5 && c.enemies.length < lane.cap) {
            c.spawn = lane.spawnEvery;
            this.spawnChaseFoe(c, false);
            if (Math.random() < lane.pairChance && c.enemies.length < lane.cap) this.spawnChaseFoe(c, true);
        }
        for (let i = c.enemies.length - 1; i >= 0; i--) {
            const e = c.enemies[i];
            e.x += e.vx * dt;
            e.y += e.vy * dt;
            e.cd -= dt;
            if (e.kind !== "debris" && e.cd <= 0 && e.y > 10 && e.y < CANVAS_H) {
                e.cd = e.shotGap || lane.shotGap;
                const aim = normalize(c.x - e.x, c.y - e.y);
                c.shots.push({ x: e.x, y: e.y + 8, vx: aim.x * 170, vy: aim.y * 170, team: "foe", life: 2 });
                SoundSystem.bolt();
            }
            if (dist(e.x, e.y, c.x, c.y) < 20) this.chaseHurt(c);
            if (e.y > CANVAS_H + 36 || e.hp <= 0) c.enemies.splice(i, 1);
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
                        this.chaseSpark(c, e.x, e.y, PALETTE.gold);
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
        if (c.hp <= 0) this.beginChaseBeat(c, "lose");
        else if (lane.win === "survive" && c.t >= c.duration) this.beginChaseBeat(c, "win");
    },

    spawnChaseFoe(c, pair) {
        const lane = c.lane;
        const foe = {
            kind: "tie",
            x: 56 + Math.random() * (CANVAS_W - 112),
            y: -18 - (pair ? 36 : 0),
            hp: lane.foeHp,
            vx: (Math.random() - 0.5) * 70,
            vy: 120 + Math.random() * 80,
            cd: 0.35 + Math.random() * 0.55,
            shotGap: lane.shotGap,
        };
        if (lane.pattern === "columns") {
            const col = Math.random() < 0.5 ? 0.28 : 0.72;
            foe.kind = "shuttle";
            foe.x = CANVAS_W * col + (Math.random() - 0.5) * 20;
            foe.vx = (Math.random() - 0.5) * 18;
            foe.vy = 68 + Math.random() * 28;
        } else if (lane.pattern === "trench") {
            if (pair) {
                foe.kind = "debris";
                foe.x = CANVAS_W * (0.38 + Math.random() * 0.24);
                foe.vx = (Math.random() - 0.5) * 36;
                foe.vy = 170 + Math.random() * 40;
                foe.hp = 1;
                foe.cd = 99;
                foe.shotGap = 99;
            } else {
                const left = c.spawnN % 2 === 0;
                foe.kind = "turret";
                foe.x = left ? lane.margin - 16 : CANVAS_W - (lane.margin - 16);
                foe.vx = 0;
                foe.vy = 86;
            }
        }
        c.spawnN += 1;
        c.enemies.push(foe);
    },

    beginChaseBeat(c, beat) {
        if (c.over) return;
        c.over = true;
        c.beat = beat;
        c.beatT = beat === "win" ? 0.62 : 0.42;
        if (beat === "win") {
            SoundSystem.fanfare();
            for (let i = 0; i < 4; i++) this.chaseSpark(c, c.x, c.y, i % 2 ? PALETTE.gold : PALETTE.foam);
        } else {
            this.flash = 0.18;
            SoundSystem.hurt();
        }
    },

    openChaseCard(c) {
        const lane = c.lane;
        if (c.beat === "win") {
            this.openCard({
                kicker: lane.kicker,
                title: lane.winTitle,
                loud: true,
                body: lane.winBody,
                buttons: [{ label: "Continue", onClick: () => this.finishChase(c) }],
            });
            return;
        }
        this.openCard({
            title: "Lane breach",
            body: lane.loseBody,
            buttons: [
                { label: "Retry the lane", onClick: () => this.startChase(lane.id) },
                { label: lane.resolve ? "Skip the lane" : "Face the Emperor", onClick: () => this.finishChase(c) },
            ],
        });
    },

    finishChase(c) {
        const lane = c.lane;
        const won = c.beat === "win";
        this.chase = null;
        this.mode = "play";
        if (lane.resolve) {
            this.afterReward(lane.resolve);
            return;
        }
        this.closeCard();
        this.paused = false;
        this.frozen = false;
        document.body.classList.add("playing");
        if (won) {
            this.resolved.trench = true;
            this.save();
            this.toast("The Emperor is waiting.");
        }
    },

    chaseSpark(c, x, y, color) {
        for (let i = 0; i < 5; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 110;
            c.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                life: 0.18 + Math.random() * 0.12,
                color: color,
            });
        }
    },

    stepChaseSparks(c, dt) {
        if (!c.sparks) c.sparks = [];
        for (let i = c.sparks.length - 1; i >= 0; i--) {
            const s = c.sparks[i];
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.life -= dt;
            if (s.life <= 0) c.sparks.splice(i, 1);
        }
    },

    chaseHurt(c) {
        if (c.invuln > 0 || c.over || c.hp <= 0) return;
        c.hp -= 1;
        c.invuln = 0.7;
        this.shake = 0.12;
        this.flash = 0.12;
        SoundSystem.hurt();
        if (c.hp > 0 && c.hp <= 2) SoundSystem.lowHp();
        this.chaseSpark(c, c.x, c.y, PALETTE.danger);
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
            const mag = 6 * Math.min(1, this.shake / 0.12);
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
        }
        if (this.mode === "chase") this.drawChase();
        else if (this.sector && this.player) {
            World.draw(ctx, this.sector, this.camera, this);
            Entities.draw(ctx, this);
        }
        ctx.restore();
        if (this.flash > 0 && (this.mode === "play" || this.mode === "chase")) {
            ctx.fillStyle = "rgba(255, 122, 69, 0.08)";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
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
        this.drawChaseProps(ctx, c);
        for (let i = 0; i < c.enemies.length; i++) this.drawChaseFoe(ctx, c, c.enemies[i]);
        for (let i = 0; i < c.shots.length; i++) {
            const s = c.shots[i];
            ctx.fillStyle = s.team === "player" ? PALETTE.blue : PALETTE.foam;
            ctx.fillRect(s.x - 2, s.y - 3, 4, 8);
        }
        for (let i = 0; i < c.sparks.length; i++) {
            const s = c.sparks[i];
            ctx.globalAlpha = Math.max(0, Math.min(1, s.life * 4));
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x - 1, s.y - 1, 3, 3);
            ctx.globalAlpha = 1;
        }
        if (!(c.invuln > 0 && Math.floor(this.time * 16) % 2 === 0)) {
            blitShip(ctx, "ship-twin", c.x, c.y, c.facing.x || c.facing.y ? c.facing : { x: 0, y: -1 });
        }
    },

    drawChaseProps(ctx, c) {
        const props = c.lane.props;
        const accent = c.lane.accent;
        const speed = props === "trench" ? 300 : 220;
        if (props === "gantry") {
            ctx.fillStyle = PALETTE.hull;
            for (let i = 0; i < 8; i++) {
                const y = ((i * 90 + c.t * speed) % (CANVAS_H + 90)) - 40;
                ctx.fillRect(CANVAS_W * 0.22, y, 14, 48);
                ctx.fillRect(CANVAS_W * 0.78 - 14, y, 14, 48);
            }
            ctx.fillStyle = accent;
            for (let i = 0; i < 8; i++) {
                const y = ((i * 90 + c.t * speed) % (CANVAS_H + 90)) - 28;
                ctx.fillRect(CANVAS_W * 0.22 + 4, y, 6, 6);
                ctx.fillRect(CANVAS_W * 0.78 - 10, y, 6, 6);
            }
            return;
        }
        if (props === "trench") {
            const wall = Math.max(64, (c.lane.margin || 108) - 28);
            ctx.fillStyle = PALETTE.panel;
            ctx.fillRect(0, 0, wall, CANVAS_H);
            ctx.fillRect(CANVAS_W - wall, 0, wall, CANVAS_H);
            ctx.fillStyle = PALETTE.hull;
            for (let i = 0; i < 10; i++) {
                const y = ((i * 70 + c.t * speed) % (CANVAS_H + 70)) - 24;
                ctx.fillRect(wall - 16, y, 16, 28);
                ctx.fillRect(CANVAS_W - wall, y, 16, 28);
            }
            ctx.fillStyle = accent;
            for (let i = 0; i < 10; i++) {
                const y = ((i * 70 + c.t * speed) % (CANVAS_H + 70)) - 8;
                ctx.fillRect(8, y, 10, 4);
                ctx.fillRect(CANVAS_W - 18, y, 10, 4);
            }
            return;
        }
        ctx.fillStyle = PALETTE.hull;
        for (let i = 0; i < 12; i++) {
            const y = ((i * 64 + c.t * speed) % (CANVAS_H + 64)) - 28;
            ctx.fillRect(22, y, 10, 26);
            ctx.fillRect(CANVAS_W - 32, y, 10, 26);
        }
        ctx.fillStyle = accent;
        for (let i = 0; i < 8; i++) {
            const y = ((i * 84 + c.t * (speed + 40)) % (CANVAS_H + 84)) - 36;
            ctx.fillRect(CANVAS_W / 2 - 2, y, 4, 14);
        }
    },

    drawChaseFoe(ctx, c, e) {
        const face = { x: e.vx, y: Math.max(0.2, e.vy) };
        if (e.kind === "turret") {
            ctx.fillStyle = PALETTE.panel;
            ctx.fillRect(e.x - 8, e.y - 12, 16, 22);
            ctx.fillStyle = c.lane.accent;
            ctx.fillRect(e.x - 3, e.y - 4, 6, 6);
            return;
        }
        if (e.kind === "debris") {
            blitShip(ctx, "debris", e.x, e.y, face);
            return;
        }
        if (e.kind === "shuttle") {
            ctx.fillStyle = PALETTE.orange;
            ctx.fillRect(e.x - 10, e.y - 6, 20, 8);
            blitShip(ctx, "ship-snub", e.x, e.y + 6, face);
            return;
        }
        blitShip(ctx, "ship-snub", e.x, e.y, face);
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
