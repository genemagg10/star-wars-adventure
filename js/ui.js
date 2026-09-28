// Star Wars Adventure — menus and the quiet HUD.

const UI = {
    cardOpen: false,
    primary: null,
    controlsBack: "screen-title",

    init() {
        const begin = document.getElementById("btn-begin");
        const cont = document.getElementById("btn-continue");
        const controls = document.getElementById("btn-controls");
        const heroBack = document.getElementById("hero-back");
        const colorBack = document.getElementById("color-back");
        const controlsBack = document.getElementById("controls-back");
        const resume = document.getElementById("btn-resume");
        const save = document.getElementById("btn-save");
        const pauseControls = document.getElementById("btn-pause-controls");
        const quit = document.getElementById("btn-quit");

        begin.addEventListener("click", () => {
            SoundSystem.unlock();
            SoundSystem.ui();
            this.showHero();
        });
        cont.addEventListener("click", () => {
            SoundSystem.unlock();
            SoundSystem.ui();
            Game.continueGame();
        });
        controls.addEventListener("click", () => {
            SoundSystem.ui();
            this.controlsBack = "screen-title";
            this.show("screen-controls");
        });
        heroBack.addEventListener("click", () => {
            SoundSystem.ui();
            this.showTitle();
        });
        colorBack.addEventListener("click", () => {
            SoundSystem.ui();
            this.showHero();
        });
        controlsBack.addEventListener("click", () => {
            SoundSystem.ui();
            this.show(this.controlsBack);
        });
        resume.addEventListener("click", () => Game.resume());
        save.addEventListener("click", () => {
            SoundSystem.ui();
            const ok = Game.save();
            const note = document.getElementById("pause-note");
            note.textContent = ok ? "Progress saved on this deck." : "This browser blocked saving.";
        });
        pauseControls.addEventListener("click", () => {
            SoundSystem.ui();
            this.controlsBack = "screen-pause";
            this.show("screen-controls");
        });
        quit.addEventListener("click", () => {
            SoundSystem.ui();
            Game.quitToTitle();
        });

        this.bindMute();
        this.buildHeroes();
        this.buildColors();
    },

    bindMute() {
        const buttons = document.querySelectorAll(".js-mute");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", () => {
                SoundSystem.unlock();
                const next = !SoundSystem.muted;
                SoundSystem.setMuted(next);
                if (!next) SoundSystem.ui();
                this.paintMute();
            });
        }
    },

    paintMute() {
        const buttons = document.querySelectorAll(".js-mute");
        const label = SoundSystem.muted ? "Muted" : "Sound on";
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].textContent = label;
            buttons[i].setAttribute("aria-pressed", SoundSystem.muted ? "true" : "false");
        }
    },

    buildHeroes() {
        const box = document.getElementById("hero-choices");
        const ids = ["lucan", "rae", "chewoo"];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const hero = HEROES[id];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "choice";
            btn.innerHTML = '<canvas width="64" height="64" data-hero="' + id + '"></canvas><strong></strong><span></span>';
            btn.querySelector("strong").textContent = hero.name;
            btn.querySelector("span").textContent = hero.blurb;
            btn.addEventListener("click", () => {
                SoundSystem.unlock();
                SoundSystem.ui();
                Game.pickHero(id);
            });
            box.appendChild(btn);
        }
    },

    buildColors() {
        const box = document.getElementById("color-choices");
        for (let i = 0; i < SABERS.length; i++) {
            const saber = SABERS[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "swatch";
            btn.innerHTML = '<i></i><span></span>';
            btn.querySelector("i").style.background = saber.color;
            btn.querySelector("span").textContent = saber.name;
            btn.addEventListener("click", () => {
                SoundSystem.unlock();
                SoundSystem.ui();
                Game.pickColor(saber.id);
            });
            box.appendChild(btn);
        }
    },

    paintPortraits() {
        const canvases = document.querySelectorAll("canvas[data-hero]");
        for (let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i];
            const g = canvas.getContext("2d");
            g.imageSmoothingEnabled = false;
            g.clearRect(0, 0, 64, 64);
            const sprite = Sprites.cache[canvas.getAttribute("data-hero") + "-down"];
            if (sprite) g.drawImage(sprite, 0, 0, 64, 64);
        }
    },

    show(id) {
        const screens = document.querySelectorAll(".screen");
        for (let i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
        const el = document.getElementById(id);
        if (el) el.classList.remove("hidden");
    },

    hideAll() {
        const screens = document.querySelectorAll(".screen");
        for (let i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
        this.cardOpen = false;
    },

    showTitle() {
        const cont = document.getElementById("btn-continue");
        if (SaveSystem.hasSave()) cont.hidden = false;
        else cont.hidden = true;
        this.paintMute();
        this.show("screen-title");
    },

    showHero() {
        this.show("screen-hero");
    },

    showColor() {
        const name = HEROES[Game.pendingHero] ? HEROES[Game.pendingHero].name : "Hero";
        document.getElementById("color-who").textContent = name + " — choose a lightsaber color.";
        this.show("screen-color");
    },

    showPause() {
        document.getElementById("pause-note").textContent = "";
        this.paintMute();
        this.show("screen-pause");
    },

    hidePause() {
        document.getElementById("screen-pause").classList.add("hidden");
    },

    showCard(opts) {
        document.getElementById("card-kicker").textContent = opts.kicker || "";
        document.getElementById("card-title").textContent = opts.title || "";
        document.getElementById("card-body").textContent = opts.body || "";
        const panel = document.querySelector("#screen-card .panel");
        if (panel) {
            panel.classList.toggle("loud", !!opts.loud);
            panel.classList.toggle("power-drop", !!opts.powerDrop);
        }
        this.paintCelebrate(opts);
        const line = document.getElementById("card-line");
        if (opts.line) {
            line.textContent = opts.line;
            line.classList.remove("hidden");
        } else {
            line.textContent = "";
            line.classList.add("hidden");
        }
        const notes = document.getElementById("card-notes");
        notes.innerHTML = "";
        const list = opts.notes || [];
        for (let i = 0; i < list.length; i++) {
            const li = document.createElement("li");
            li.textContent = list[i];
            notes.appendChild(li);
        }
        const actions = document.getElementById("card-actions");
        actions.innerHTML = "";
        this.primary = null;
        const buttons = opts.buttons || [];
        for (let i = 0; i < buttons.length; i++) {
            const spec = buttons[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = spec.label;
            btn.addEventListener("click", () => {
                SoundSystem.unlock();
                SoundSystem.ui();
                spec.onClick();
            });
            actions.appendChild(btn);
            if (!this.primary) this.primary = btn;
        }
        this.cardOpen = true;
        this.show("screen-card");
    },

    paintCelebrate(opts) {
        const box = document.getElementById("card-celebrate");
        if (!box) return;
        const cele = opts && opts.celebrate;
        if (!cele) {
            box.classList.add("hidden");
            return;
        }
        box.classList.remove("hidden");
        document.getElementById("card-who").textContent = cele.hero;
        const saber = document.getElementById("card-saber");
        saber.textContent = cele.saber + " lightsaber";
        saber.style.color = cele.saberColor || PALETTE.gold;
        const heroCanvas = document.getElementById("card-hero");
        const g = heroCanvas.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, 64, 64);
        const sprite = Sprites.cache[cele.heroId + "-down"];
        if (sprite) g.drawImage(sprite, 0, 0, 64, 64);
        const grogu = document.getElementById("card-grogu");
        grogu.classList.toggle("hidden", !cele.grogu);
        grogu.classList.toggle("hop", !!cele.grogu);
        if (cele.grogu) {
            const gg = grogu.getContext("2d");
            gg.imageSmoothingEnabled = false;
            gg.clearRect(0, 0, 48, 48);
            const face = Sprites.cache["little"] || Sprites.cache["grogu-face"];
            if (face) gg.drawImage(face, 0, 0, 48, 48);
        }
        const sparks = document.getElementById("card-sparks");
        sparks.innerHTML = "";
        for (let i = 0; i < 14; i++) {
            const bit = document.createElement("i");
            bit.style.left = (8 + Math.random() * 84) + "%";
            bit.style.animationDelay = (Math.random() * 0.28) + "s";
            bit.style.background = i % 3 === 0 ? (cele.saberColor || PALETTE.gold) : PALETTE.gold;
            sparks.appendChild(bit);
        }
    },

    hideCard() {
        this.cardOpen = false;
        this.primary = null;
        document.getElementById("screen-card").classList.add("hidden");
    },

    activatePrimary() {
        if (this.primary) this.primary.click();
    },

    drawHud(ctx, game) {
        const chase = game.mode === "chase";
        const hearts = chase ? game.chase.hp : game.player.hp;
        const max = chase ? game.chase.maxHp : game.player.maxHp;
        const touch = document.body.classList.contains("touch") || document.body.classList.contains("has-coarse");
        let heartX = 20;
        if (touch) {
            const cssW = game.cssW || CANVAS_W;
            heartX = Math.max(108, ((96 / Math.max(1, cssW)) * CANVAS_W) + 10);
        }
        for (let i = 0; i < max; i++) {
            const hx = heartX + i * 20;
            if (i < hearts) {
                ctx.fillStyle = "rgba(61, 219, 122, 0.28)";
                ctx.fillRect(hx - 9, 14, 18, 18);
            }
            Sprites.draw(ctx, i < hearts ? "heart" : "heart-empty", hx, 24, false);
        }

        let text = "Death Star";
        if (chase) {
            const left = Math.max(0, Math.ceil(game.chase.duration - game.chase.t));
            const goal = game.chase.objective || "Fly the lane";
            text = goal + " · " + left + "s";
        } else if (game.objective) {
            text = game.objective;
        }
        ctx.font = "14px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const pad = 28;
        const w = Math.min(420, Math.ceil(ctx.measureText(text).width + pad));
        const x = Math.round(CANVAS_W / 2 - w / 2);
        const accent = chase && game.chase && game.chase.lane
            ? game.chase.lane.accent
            : (game.sector && game.sector.accent) || PALETTE.panel;
        ctx.fillStyle = PALETTE.hull;
        ctx.fillRect(x, 12, w, 26);
        ctx.strokeStyle = accent;
        ctx.strokeRect(x + 0.5, 12.5, w - 1, 25);
        ctx.fillStyle = PALETTE.foam;
        ctx.fillText(text, CANVAS_W / 2, 26);

        this.drawPowerGems(ctx, game);

        if (game.toastT > 0 && game.toastText) {
            ctx.fillStyle = PALETTE.gold;
            ctx.fillText(game.toastText, CANVAS_W / 2, 74);
        }

        const gem = saberById(game.saber).color;
        const gx = CANVAS_W - 28;
        diamond(ctx, gx, 26, 9, PALETTE.ink);
        diamond(ctx, gx, 26, 6, gem);
        if (!chase && game.companionJoined) {
            Sprites.draw(ctx, "grogu-face", CANVAS_W - 58, 26, false);
        }
    },

    drawPowerGems(ctx, game) {
        const colors = {
            push: PALETTE.blue,
            throw: PALETTE.purple,
            lightning: PALETTE.lightning,
            rock: PALETTE.gold,
        };
        const gap = 22;
        const y = 50;
        const start = CANVAS_W / 2 - ((POWER_SLOTS.length - 1) * gap) / 2;
        for (let i = 0; i < POWER_SLOTS.length; i++) {
            const id = POWER_SLOTS[i];
            const x = start + i * gap;
            const owned = game.owns(id);
            const active = owned && game.activePower === id;
            const r = active ? 8 : 5;
            diamond(ctx, x, y, r + 2, PALETTE.ink);
            diamond(ctx, x, y, r, owned ? colors[id] : PALETTE.panel);
            if (!owned) diamond(ctx, x, y, 2, PALETTE.hull);
            let cd = 0;
            let max = POWER_COOLDOWN;
            if (game.mode === "chase" && id === "push" && game.chase) {
                cd = game.chase.pushCd || 0;
                max = 1.3;
            } else if (active && game.player) {
                cd = game.player.powerCd || 0;
            }
            if (!owned || cd <= 0 || max <= 0) continue;
            const ready = 1 - Math.min(1, cd / max);
            ctx.strokeStyle = PALETTE.foam;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ready);
            ctx.stroke();
        }
    },
};

function diamond(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
}
