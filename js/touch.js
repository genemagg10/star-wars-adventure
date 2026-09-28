// Star Wars Adventure — landscape stick, power chips, and a pause face.
// Interact lights up beside a door, chest, hatch, or exit.

const TouchControls = {
    vec: { x: 0, y: 0 },
    holding: { attack: false, power: false, interact: false, special: false },
    edges: { attack: false, power: false, interact: false, special: false },
    chipSig: "",
    faces: {},
    powerTimer: 0,
    powerLong: false,
    powerPointer: null,

    init() {
        const stick = document.getElementById("stick");
        const nub = document.getElementById("nub");
        if (!stick || !nub) return;
        const max = 46;
        let active = null;

        const place = (clientX, clientY) => {
            const rect = stick.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;
            const mag = Math.hypot(dx, dy) || 1;
            const cl = Math.min(max, mag);
            const nx = (dx / mag) * cl;
            const ny = (dy / mag) * cl;
            this.vec.x = nx / max;
            this.vec.y = ny / max;
            nub.style.transform = "translate(" + nx + "px," + ny + "px)";
        };

        const endStick = (e) => {
            if (e.pointerId !== active) return;
            active = null;
            this.vec.x = 0;
            this.vec.y = 0;
            nub.style.transform = "translate(0px,0px)";
        };

        stick.addEventListener("pointerdown", (e) => {
            active = e.pointerId;
            stick.setPointerCapture(e.pointerId);
            place(e.clientX, e.clientY);
            SoundSystem.unlock();
            e.preventDefault();
        });
        stick.addEventListener("pointermove", (e) => {
            if (e.pointerId !== active) return;
            place(e.clientX, e.clientY);
            e.preventDefault();
        });
        stick.addEventListener("pointerup", endStick);
        stick.addEventListener("pointercancel", endStick);

        const bind = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                btn.setPointerCapture(e.pointerId);
                SoundSystem.unlock();
                this.holding[key] = true;
                this.edges[key] = true;
            });
            const up = () => {
                this.holding[key] = false;
            };
            btn.addEventListener("pointerup", up);
            btn.addEventListener("pointercancel", up);
        };
        bind("btn-attack", "attack");
        bind("btn-special", "special");
        bind("btn-interact", "interact");
        this.bindPower();

        const pause = document.getElementById("btn-pause-touch");
        if (pause) {
            pause.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                SoundSystem.unlock();
                if (Game && Game.pause) Game.pause();
            });
        }

        this.buildChips();

        window.addEventListener("touchstart", () => {
            document.body.classList.add("touch");
        }, { passive: true });

        if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
            document.body.classList.add("has-coarse");
        }
    },

    bindPower() {
        const btn = document.getElementById("btn-power");
        if (!btn) return;
        const holdMs = 420;
        const clear = () => {
            if (this.powerTimer) {
                clearTimeout(this.powerTimer);
                this.powerTimer = 0;
            }
        };
        btn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            btn.setPointerCapture(e.pointerId);
            SoundSystem.unlock();
            this.holding.power = true;
            this.powerLong = false;
            this.powerPointer = e.pointerId;
            clear();
            this.powerTimer = setTimeout(() => {
                this.powerTimer = 0;
                this.powerLong = true;
                this.holding.power = false;
                if (!Game || Game.frozen || Game.mode !== "play") return;
                SoundSystem.unlock();
                Game.cyclePower();
                this.sync(Game);
            }, holdMs);
        });
        btn.addEventListener("pointerup", (e) => {
            if (this.powerPointer != null && e.pointerId !== this.powerPointer) return;
            clear();
            this.holding.power = false;
            if (!this.powerLong) this.edges.power = true;
            this.powerLong = false;
            this.powerPointer = null;
        });
        btn.addEventListener("pointercancel", () => {
            clear();
            this.holding.power = false;
            this.powerLong = false;
            this.powerPointer = null;
        });
    },

    buildChips() {
        const box = document.getElementById("power-chips");
        if (!box) return;
        const short = { push: "◎", throw: "↻", lightning: "↯", rock: "●" };
        for (let i = 0; i < POWER_SLOTS.length; i++) {
            const id = POWER_SLOTS[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "power-chip force-slot";
            btn.dataset.power = id;
            btn.dataset.digit = POWERS[id].code;
            btn.innerHTML = "<b></b><span></span>";
            btn.querySelector("b").textContent = POWERS[id].slot;
            btn.querySelector("span").textContent = short[id];
            btn.setAttribute("aria-label", POWERS[id].slot + " " + POWERS[id].name);
            btn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                SoundSystem.unlock();
                if (!Game || Game.mode !== "play" || Game.frozen) return;
                if (!Game.owns(id)) {
                    Game.toast(POWERS[id].name + " is still locked");
                    return;
                }
                Game.activePower = id;
                Game.toast(POWERS[id].name);
                SoundSystem.ui();
                this.sync(Game);
            });
            box.appendChild(btn);
        }
    },

    setFace(id, icon, label, idle) {
        let face = this.faces[id];
        if (!face) {
            const el = document.getElementById(id);
            if (!el) return;
            face = { el: el, icon: null, label: null, idle: null };
            this.faces[id] = face;
        }
        if (face.icon !== icon) {
            face.icon = icon;
            face.el.textContent = icon;
        }
        if (face.label !== label) {
            face.label = label;
            face.el.setAttribute("aria-label", label);
        }
        if (face.idle !== idle) {
            face.idle = idle;
            face.el.classList.toggle("is-idle", !!idle);
            face.el.classList.toggle("is-ready", !idle);
        }
    },

    sync(game) {
        const live = !!game && (game.mode === "play" || game.mode === "chase") && !game.paused && !game.frozen && !(UI && UI.cardOpen);
        document.body.classList.toggle("hud-lock", !live);
        if (!game) return;

        const glyphs = { push: "◎", throw: "↻", lightning: "↯", rock: "●" };
        const act = game.interactContext ? game.interactContext() : null;
        const interact = document.getElementById("btn-interact");
        if (interact) interact.hidden = game.mode !== "play";
        const specialBtn = document.getElementById("btn-special");
        if (game.mode === "chase") {
            this.setFace("btn-attack", "▲", "Fire", false);
            const canPush = game.owns("push");
            this.setFace("btn-power", canPush ? "◎" : "◇", canPush ? "Force Push" : "No power yet", !canPush);
            if (specialBtn) specialBtn.hidden = true;
        } else {
            if (specialBtn) specialBtn.hidden = false;
            this.setFace("btn-attack", "╱", "Lightsaber", false);
            const hero = game.player && HEROES[game.player.heroId];
            const cooling = !!(game.player && game.player.specialCd > 0);
            const name = hero ? hero.specialName : "Special";
            this.setFace("btn-special", hero ? hero.glyph : "✦", cooling ? name + ", cooling" : name, cooling);
            const id = game.activePower;
            const owned = id && game.owns(id);
            this.setFace("btn-power", owned ? glyphs[id] : "◇", owned ? POWERS[id].name : "No power yet", !owned);
            this.setFace("btn-interact", act ? act.icon : "·", act ? act.short : "Nothing nearby", !act);
        }

        const box = document.getElementById("power-chips");
        if (!box) return;
        const chips = box.querySelectorAll(".power-chip");
        const showStrip = game.mode === "play";
        box.dataset.empty = showStrip ? "0" : "1";
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i];
            const id = chip.dataset.power;
            const owned = game.owns(id);
            chip.hidden = false;
            chip.classList.toggle("is-locked", !owned);
            chip.classList.toggle("is-on", showStrip && owned && game.activePower === id);
            const state = owned ? "unlocked" : "locked";
            chip.setAttribute("aria-label", POWERS[id].slot + " " + POWERS[id].name + ", " + state);
        }
    },

    takeEdges() {
        const out = {
            attack: this.edges.attack,
            power: this.edges.power,
            interact: this.edges.interact,
            special: this.edges.special,
        };
        this.edges.attack = false;
        this.edges.power = false;
        this.edges.interact = false;
        this.edges.special = false;
        return out;
    },
};
