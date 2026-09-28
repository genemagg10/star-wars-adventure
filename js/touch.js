// Star Wars Adventure — landscape stick plus three actions.

const TouchControls = {
    vec: { x: 0, y: 0 },
    holding: { attack: false, power: false, interact: false },
    edges: { attack: false, power: false, interact: false },

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

        window.addEventListener("touchstart", () => {
            document.body.classList.add("touch");
        }, { passive: true });

        if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
            document.body.classList.add("has-coarse");
        }
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
