// Star Station Adventure — constants.
// The playfield keeps a fixed height and widens with the window.

const CANVAS_H = 600;
const CANVAS_MIN_W = 800;
const CANVAS_MAX_W = 1400;
let CANVAS_W = CANVAS_MIN_W;

const TILE = 16;

const PALETTE = {
    void: "#0B1020",
    hull: "#1C2740",
    panel: "#2E3F5C",
    foam: "#E8F0FF",
    ink: "#0E1424",
    blue: "#4DA3FF",
    green: "#3DDB7A",
    purple: "#B07CFF",
    gold: "#FFC857",
    danger: "#FF7A45",
    lightning: "#C9B6FF",
    orange: "#FF9A3C",
};

function canvasWidthForAspect(aspect) {
    if (!aspect || !isFinite(aspect) || aspect <= 0) return CANVAS_MIN_W;
    const raw = Math.round((aspect * CANVAS_H) / 2) * 2;
    return Math.max(CANVAS_MIN_W, Math.min(CANVAS_MAX_W, raw));
}

const SABERS = [
    { id: "blue", name: "Blue", color: PALETTE.blue },
    { id: "green", name: "Green", color: PALETTE.green },
    { id: "purple", name: "Purple", color: PALETTE.purple },
    { id: "yellow", name: "Yellow", color: PALETTE.gold },
    { id: "white", name: "White", color: PALETTE.foam },
    { id: "orange", name: "Orange", color: PALETTE.orange },
];

const HEROES = {
    lucan: {
        name: "Lucan",
        blurb: "Longer reach. Hope Strike mends a heart when it lands.",
        maxHp: 6,
        speed: 156,
        melee: "hope",
        range: 54,
        damage: 2,
        cooldown: 0.36,
    },
    rae: {
        name: "Rae",
        blurb: "Quicker steps. Staff Spin hits every foe around you.",
        maxHp: 6,
        speed: 196,
        melee: "spin",
        range: 38,
        damage: 2,
        cooldown: 0.3,
    },
    chewoo: {
        name: "Chewoo",
        blurb: "More hearts. Bowcaster Blast reaches across the deck.",
        maxHp: 8,
        speed: 136,
        melee: "bowcaster",
        range: 220,
        damage: 4,
        cooldown: 0.52,
    },
};

// Gene lock: hotkeys stay on this order. The third boss grants no power.
// Rock Toss is slot 4 and is found in the Trash Compactor chest.
const POWERS = {
    push: { slot: "1", code: "Digit1", name: "Force Push" },
    throw: { slot: "2", code: "Digit2", name: "Saber Throw" },
    lightning: { slot: "3", code: "Digit3", name: "Lightning" },
    rock: { slot: "4", code: "Digit4", name: "Rock Toss" },
};

const POWER_SLOTS = ["push", "throw", "lightning", "rock"];

const SAVE_PREFIX = "starStationAdventure.";

const WIN_LINE = "Part Two coming soon!";

const ACHIEVEMENTS = {
    saved: "Station Saved",
    sticker: "Chewoo-bot Sticker",
};

const GUARD_STATS = {
    hp: 6,
    speed: 54,
    shot: 2.05,
    range: 150,
};

const BOSS_STATS = {
    chrome: { name: "Chrome Captain", hp: 26, speed: 68, gap: 1.05 },
    shadow: { name: "Shadow Seeker", hp: 30, speed: 78, gap: 1.2 },
    dark: { name: "Dark Lord", hp: 36, speed: 54, gap: 1.25 },
    fallen: { name: "Fallen Knight", hp: 28, speed: 88, gap: 0.95 },
    hooded: { name: "Hooded Master", hp: 42, speed: 64, gap: 1.05 },
};
