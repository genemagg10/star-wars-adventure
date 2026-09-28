// Star Wars Adventure — procedural Web Audio.
// The context stays suspended until the first gesture.

const SoundSystem = {
    ctx: null,
    master: null,

    unlock() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!this.ctx) {
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.18;
            this.master.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    },

    tone(freq, dur, type, vol, slide) {
        if (!this.ctx || !this.master) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type || "square";
            osc.frequency.setValueAtTime(Math.max(40, freq), t);
            if (slide) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
            }
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(t);
            osc.stop(t + dur + 0.02);
        } catch (err) {
            // A blocked or closed context should never halt the loop.
        }
    },

    ui() { this.tone(660, 0.06, "square", 0.2, 880); },
    swing() { this.tone(540, 0.09, "sawtooth", 0.16, 160); },
    spin() { this.tone(420, 0.12, "triangle", 0.2, 720); },
    shot() { this.tone(220, 0.07, "square", 0.18, 90); },
    hurt() { this.tone(180, 0.14, "sawtooth", 0.24, 70); },
    power() { this.tone(320, 0.16, "triangle", 0.22, 640); },
    bolt() { this.tone(880, 0.1, "square", 0.14, 240); },
    pickup() { this.tone(520, 0.08, "square", 0.2, 780); this.tone(780, 0.12, "square", 0.16); },
    fanfare() { this.tone(392, 0.12, "triangle", 0.22, 523); this.tone(659, 0.18, "triangle", 0.18); },
    win() {
        this.tone(523, 0.14, "triangle", 0.22);
        this.tone(659, 0.16, "triangle", 0.2);
        this.tone(784, 0.28, "triangle", 0.22);
    },
    boom() { this.tone(90, 0.2, "sawtooth", 0.28, 40); },
};
