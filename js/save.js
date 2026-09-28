// Star Wars Adventure — one progress slot.
// The key prefix is ours. It must never collide with another game's saves.

const SaveSystem = {
    VERSION: 1,
    KEY: SAVE_PREFIX + "save.slot1",

    available() {
        try {
            const probe = SAVE_PREFIX + "probe";
            localStorage.setItem(probe, "1");
            localStorage.removeItem(probe);
            return true;
        } catch (err) {
            return false;
        }
    },

    read() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.version !== this.VERSION) return null;
            return data;
        } catch (err) {
            return null;
        }
    },

    hasSave() {
        return !!this.read();
    },

    write(snapshot) {
        if (!this.available()) return false;
        const data = {
            version: this.VERSION,
            savedAt: Date.now(),
            heroId: snapshot.heroId,
            saber: snapshot.saber,
            sectorIndex: snapshot.sectorIndex,
            powers: snapshot.powers.slice(),
            activePower: snapshot.activePower,
            companionJoined: !!snapshot.companionJoined,
            sticker: !!snapshot.sticker,
            achievements: snapshot.achievements.slice(),
            bossesDown: snapshot.bossesDown.slice(),
            resolved: Object.assign({}, snapshot.resolved || {}),
            won: !!snapshot.won,
        };
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
            return true;
        } catch (err) {
            return false;
        }
    },

    clear() {
        try {
            localStorage.removeItem(this.KEY);
        } catch (err) {
            // Ignore private-mode storage failures.
        }
    },
};
