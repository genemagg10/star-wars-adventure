// Star Wars Adventure — procedural Web Audio.
// The context stays suspended until the first gesture.

const SoundSystem = {
    ctx: null,
    master: null,
    muted: false,
    MUTE_KEY: SAVE_PREFIX + "mute",

    loadMute() {
        try {
            this.muted = localStorage.getItem(this.MUTE_KEY) === "1";
        } catch (err) {
            this.muted = false;
        }
        this.applyMute();
    },

    setMuted(on) {
        this.muted = !!on;
        try {
            localStorage.setItem(this.MUTE_KEY, this.muted ? "1" : "0");
        } catch (err) {
            // Private mode can block the preference. The toggle still applies this visit.
        }
        this.applyMute();
    },

    applyMute() {
        if (!this.master) return;
        this.master.gain.value = this.muted ? 0 : 0.18;
    },

    unlock() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!this.ctx) {
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.18;
            this.master.connect(this.ctx.destination);
        }
        this.applyMute();
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    },

    tone(freq, dur, type, vol, slide) {
        if (!this.ctx) return;
        this.toneAt(this.ctx.currentTime, freq, dur, type, vol, slide);
    },

    toneAt(when, freq, dur, type, vol, slide) {
        if (this.muted || !this.ctx || !this.master) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type || "square";
            osc.frequency.setValueAtTime(Math.max(40, freq), when);
            if (slide) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), when + dur);
            }
            gain.gain.setValueAtTime(vol, when);
            gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(when);
            osc.stop(when + dur + 0.02);
        } catch (err) {
            // A blocked or closed context should never halt the loop.
        }
    },

    ui() { this.tone(660, 0.06, "square", 0.2, 880); },

    swing() {
        this.tone(720, 0.05, "sawtooth", 0.12, 180);
        this.tone(360, 0.09, "triangle", 0.1, 120);
    },

    spin() {
        this.tone(420, 0.08, "triangle", 0.16, 760);
        this.tone(640, 0.1, "sawtooth", 0.08, 220);
    },

    shot() { this.tone(220, 0.07, "square", 0.18, 90); },

    hurt() { this.tone(180, 0.12, "sawtooth", 0.22, 70); },

    force(id, quiet) {
        const v = quiet ? 0.55 : 1;
        if (id === "push") this.push(v);
        else if (id === "throw") this.throwSaber(v);
        else if (id === "lightning") this.lightning(v);
        else if (id === "rock") this.rock(v);
        else this.tone(320, 0.12, "triangle", 0.16 * v, 640);
    },

    push(v) {
        const vol = v == null ? 1 : v;
        this.tone(160, 0.16, "sine", 0.22 * vol, 70);
        this.tone(420, 0.1, "triangle", 0.12 * vol, 180);
    },

    throwSaber(v) {
        const vol = v == null ? 1 : v;
        this.tone(620, 0.06, "square", 0.1 * vol, 1240);
        this.tone(480, 0.14, "sawtooth", 0.1 * vol, 200);
    },

    lightning(v) {
        if (!this.ctx) return;
        const vol = v == null ? 1 : v;
        const t = this.ctx.currentTime;
        const bits = [1680, 740, 1420, 460, 1900];
        for (let i = 0; i < bits.length; i++) {
            this.toneAt(t + i * 0.028, bits[i], 0.04, "square", 0.07 * vol, Math.max(80, bits[i] * 0.35));
        }
    },

    rock(v) {
        const vol = v == null ? 1 : v;
        this.tone(120, 0.14, "triangle", 0.26 * vol, 48);
        this.tone(70, 0.18, "sine", 0.16 * vol, 40);
    },

    lowHp() {
        this.tone(466, 0.09, "square", 0.14, 330);
        this.tone(311, 0.16, "square", 0.12, 196);
    },

    bolt() { this.tone(880, 0.1, "square", 0.14, 240); },

    pickup() {
        this.tone(520, 0.08, "square", 0.2, 780);
        this.tone(780, 0.12, "square", 0.16);
    },

    unlock() {
        this.tone(523, 0.1, "triangle", 0.24);
        this.tone(659, 0.12, "triangle", 0.22);
        this.tone(784, 0.16, "triangle", 0.22);
        this.tone(1046, 0.26, "sine", 0.18);
    },

    bond() {
        this.tone(392, 0.18, "sine", 0.16, 523);
        this.tone(494, 0.26, "triangle", 0.12, 660);
    },

    fanfare() {
        this.tone(392, 0.12, "triangle", 0.22, 523);
        this.tone(659, 0.18, "triangle", 0.18);
    },

    win() {
        this.tone(523, 0.12, "triangle", 0.22);
        this.tone(659, 0.14, "triangle", 0.2);
        this.tone(784, 0.18, "triangle", 0.2);
        this.tone(1046, 0.34, "sine", 0.16);
    },

    boom() { this.tone(90, 0.18, "sawtooth", 0.26, 40); },
};
