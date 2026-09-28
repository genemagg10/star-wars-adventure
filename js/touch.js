// Star Wars Adventure — landscape stick, power chips, and a pause face.
// Interact lights up beside a door, chest, hatch, or exit.

const TouchControls = {
    vec: { x: 0, y: 0 },
    holding: { attack: false, power: false, interact: false },
    edges: { attack: false, power: false, interact: false },
    chipSig: "",

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
        bind("btn-power", "power");
        bind("btn-interact", "interact");

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

    buildChips() {
        const box = document.getElementById("power-chips");
        if (!box) return;
        const short = { push: "Push", throw: "Throw", lightning: "Bolt", rock: "Rock" };
        for (let i = 0; i < POWER_SLOTS.length; i++) {
            const id = POWER_SLOTS[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "power-chip";
            btn.dataset.power = id;
            btn.innerHTML = "<b></b><span></span>";
            btn.querySelector("b").textContent = POWERS[id].slot;
            btn.querySelector("span").textContent = short[id];
            btn.setAttribute("aria-label", POWERS[id].slot + " " + POWERS[id].name);
            btn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                SoundSystem.unlock();
                if (!Game || Game.mode !== "play" || Game.frozen) return;
                if (!Game.owns(id)) return;
                Game.activePower = id;
                Game.toast(POWERS[id].name);
                SoundSystem.ui();
                this.sync(Game);
            });
            box.appendChild(btn);
        }
    },

    sync(game) {
        const live = !!game && (game.mode === "play" || game.mode === "chase") && !game.paused && !game.frozen && !(UI && UI.cardOpen);
        document.body.classList.toggle("hud-lock", !live);
        if (!game) return;

        const interact = document.getElementById("btn-interact");
        const power = document.getElementById("btn-power");
        const attack = document.getElementById("btn-attack");
        const near = game.mode === "play" && game.hint ? game.hint : null;
        if (interact) {
            const show = game.mode === "play";
            interact.hidden = !show;
            interact.classList.toggle("is-ready", !!near);
            interact.classList.toggle("is-idle", show && !near);
            const label = near ? near.label : "Interact";
            if (interact.textContent !== label) interact.textContent = label;
            interact.setAttribute("aria-label", near ? near.label : "Nothing nearby");
        }
        if (attack) {
            const label = game.mode === "chase" ? "Fire" : "Attack";
            if (attack.textContent !== label) attack.textContent = label;
        }
        if (power) {
            const short = { push: "Push", throw: "Throw", lightning: "Bolt", rock: "Rock" };
            let label = "Power";
            if (game.mode === "chase") label = game.owns("push") ? "Push" : "Power";
            else if (game.activePower && game.owns(game.activePower)) label = short[game.activePower] || "Power";
            if (power.textContent !== label) power.textContent = label;
            power.setAttribute("aria-label", label === "Power" ? "Use Force power" : "Use " + label);
        }

        const box = document.getElementById("power-chips");
        if (!box) return;
        const chips = box.querySelectorAll(".power-chip");
        let any = false;
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i];
            const id = chip.dataset.power;
            const owned = game.mode === "play" && game.owns(id);
            chip.hidden = !owned;
            chip.classList.toggle("is-on", owned && game.activePower === id);
            if (owned) any = true;
        }
        box.dataset.empty = any ? "0" : "1";
    },

    takeEdges() {
        const out = {
            attack: this.edges.attack,
            power: this.edges.power,
            interact: this.edges.interact,
        };
        this.edges.attack = false;
        this.edges.power = false;
        this.edges.interact = false;
        return out;
    },
};
