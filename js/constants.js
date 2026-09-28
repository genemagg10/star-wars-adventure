// Star Wars Adventure — constants.
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
    fur: "#C47A3A",
    furDeep: "#8A4E22",
    white: "#F4F6FA",
    vader: "#1A1A22",
    cloak: "#2A1840",
    metal: "#8FA4C4",
    skin: "#F3D2B0",
    // Wave D material reads. Existing keys above stay put.
    chrome: "#C5D0E0",
    armor: "#A8B0C0",
    jacket: "#D4894A",
    jacketDeep: "#A36532",
    hair: "#F2D48A",
    hairDeep: "#C9A15A",
    // Rose chrome for enemy blades only. Never a player saber, never a danger telegraph.
    foeBlade: "#D46A78",
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
        name: "Luke Skywalker",
        blurb: "Longer reach. Space swings. F is Hope Strike, and a hit mends a heart.",
        maxHp: 6,
        speed: 156,
        special: "hope",
        specialName: "Hope Strike",
        glyph: "✦",
        range: 52,
        specialRange: 74,
        damage: 2,
        specialDamage: 3,
        cooldown: 0.34,
        specialCooldown: 3.2,
    },
    rae: {
        name: "Rey",
        blurb: "Quicker steps. Space swings. F is Staff Spin.",
        maxHp: 6,
        speed: 196,
        special: "spin",
        specialName: "Staff Spin",
        glyph: "✳",
        range: 40,
        specialRange: 68,
        damage: 2,
        specialDamage: 2,
        cooldown: 0.28,
        specialCooldown: 2.7,
    },
    chewoo: {
        name: "Chewbacca",
        blurb: "More hearts. Space swings. F is Bowcaster Blast.",
        maxHp: 8,
        speed: 136,
        special: "bowcaster",
        specialName: "Bowcaster Blast",
        glyph: "≫",
        range: 42,
        specialRange: 240,
        damage: 2,
        specialDamage: 4,
        cooldown: 0.4,
        specialCooldown: 3.4,
    },
};

// Gene lock: hotkeys stay on this order. The third boss grants no power.
// Rock Toss is slot 4. Primary find is the chest between Darth Vader and Kylo Ren.
// Fallback, only if that chest cannot be reached: Kylo Ren also grants it.
const POWERS = {
    push: { slot: "1", code: "Digit1", name: "Force Push" },
    throw: { slot: "2", code: "Digit2", name: "Saber Throw" },
    lightning: { slot: "3", code: "Digit3", name: "Lightning" },
    rock: { slot: "4", code: "Digit4", name: "Rock Toss" },
};

const POWER_SLOTS = ["push", "throw", "lightning", "rock"];
const POWER_COOLDOWN = 1.15;

const SAVE_PREFIX = "starStationAdventure.";

const WIN_LINE = "Part Two coming soon!";

// Two lines each. Shown once, on the way into that deck. Tap or Space skips.
const DECK_CRAWLS = {
    hangar: [
        "The north lock sighs open.",
        "Captain Phasma holds the hangar.",
    ],
    conduit: [
        "A spinning blade cuts the dark.",
        "The Inquisitor waits in the conduit.",
    ],
    gallery: [
        "Orange light fills the throne.",
        "Darth Vader stands his ground.",
    ],
    trash: [
        "The compactor walls creep closer.",
        "Something small sleeps behind a hatch.",
    ],
    fallen: [
        "A cracked saber hums in the hall.",
        "Kylo Ren blocks the next deck.",
    ],
    core: [
        "The core burns white ahead.",
        "The Emperor is the last gate.",
    ],
};

// First contact only. Broad lane, slow walk, slow rush.
const PHASMA_OPEN = {
    approach: 0.58,
    delay: 2.05,
    telegraph: 1.85,
    laneWidth: 36,
    dash: 82,
    dashTime: 0.48,
};

// After the opening rush. The white lane stays the same width and telegraph.
// The finish is the part that was still too tight: she steps back and the
// next lane waits through a long hold, a hit stretches that hold, and a late
// walk back into the rush does not take a heart. Camping the paint still does.
const PHASMA_CLEAR = {
    approach: 0.7,
    telegraph: 1.55,
    laneWidth: 34,
    dash: 88,
    dashTime: 0.4,
    grace: 2.15,
    standoff: 50,
    alpha: 0.5,
    hold: 3.6,
    hug: 2.8,
    hitStretch: 0.9,
    lateEntry: 0.4,
    rushInvuln: 2.2,
};

// First blink. A wider, slower ring so the step-out reads. Missing it
// shoves you clear and does not take a heart. The punish is the hold after.
const INQUISITOR_OPEN = {
    delay: 1.1,
    approach: 0.3,
    telegraph: 2.0,
    ring: 42,
    earlyGrace: 0.85,
    lateEntry: 0.95,
    grace: 0.65,
    reach: 170,
};

// Finish window. She stays in saber reach, and the hold runs long enough
// to spend the hit points still on the plate. A saber or Force hit stretches
// that hold past where it started. Stepping off a later ring and walking
// back in shoves, with a short invulnerability, and does not take a heart.
// Standing in the circle the whole time still takes one.
const INQUISITOR_CLEAR = {
    approach: 0.42,
    telegraph: 1.55,
    ring: 34,
    earlyGrace: 0.45,
    lateEntry: 0.9,
    leave: 0.22,
    grace: 0.85,
    pocket: 40,
    leash: 96,
    patience: 4.2,
    hold: 11,
    hitStretch: 2.4,
    stretchCap: 16,
    chase: 210,
    blinkInvuln: 3.4,
    shoveInvuln: 1.8,
    reach: 210,
};

// First gold cross. The lunge and the bolt stay as they are. The teach is
// the mark on the floor, then one hit if you are still in it.
const KYLO_OPEN = {
    delay: 0.7,
    telegraph: 0.78,
    len: 86,
    dash: 130,
    dashTime: 0.16,
    bolt: 150,
    boltLife: 0.7,
};

// Finish window. After that cross he steps into saber reach and the hold
// runs long enough to spend the hit points still on the plate. A saber or
// Force hit stretches the hold, and it connects even if they stopped and
// the stick still points at the dodge. Stepping off a later cross and
// walking back in shoves, with a short breather, and does not take a heart.
// Standing in the cross the whole time still takes one, then a longer
// breather so the deck troopers cannot turn that heart into a spiral.
const KYLO_CLEAR = {
    telegraph: 1.15,
    len: 86,
    dash: 108,
    dashTime: 0.16,
    bolt: 126,
    boltLife: 0.62,
    grace: 0.55,
    pocket: 40,
    leash: 108,
    patience: 3.8,
    hold: 10,
    hitStretch: 1.7,
    stretchCap: 15,
    chase: 168,
    leave: 0.2,
    lateEntry: 0.34,
    earlyGrace: 0.22,
    lane: 16,
    shoveInvuln: 1.8,
    clipInvuln: 2.5,
    reach: 200,
    aim: 210,
};

// First orange tether. Same tug as before: it hurts only if you are still
// inside his reach. The early walk-in chip is this beat.
const VADER_OPEN = {
    delay: 0.7,
    approach: 0.58,
    telegraph: 1.05,
    hurt: 36,
    pull: 110,
    reach: 168,
};

// Finish window. After that tug he stands in saber reach, just outside the
// orange ring, and the hold runs long enough to spend the hit points still
// on the plate (the stall was around 28 of 36). A saber or Force hit stretches
// the hold, and it connects even if they stopped and the stick still points
// at the dodge. Stepping out of a later ring shoves, with a short breather,
// and does not take a heart. Standing in the ring the whole time still takes
// one, then a longer breather so the gallery troopers cannot turn that heart
// into a spiral.
const VADER_CLEAR = {
    telegraph: 1.2,
    hurt: 36,
    grace: 0.55,
    pocket: 44,
    leash: 120,
    patience: 4.0,
    hold: 12,
    hitStretch: 2.0,
    stretchCap: 18,
    chase: 160,
    leave: 0.18,
    lateEntry: 0.4,
    earlyGrace: 0.2,
    shoveInvuln: 1.8,
    clipInvuln: 2.6,
    reach: 210,
    aim: 220,
};

const ACHIEVEMENTS = {
    saved: "Death Star Saved",
    sticker: "Chewbacca-bot Sticker",
};

const GUARD_STATS = {
    hp: 6,
    speed: 54,
    shot: 2.05,
    range: 150,
};

// Docking Ring only, until the north lock is taken and Phasma Hangar is entered.
// One stormtrooper. Shots stay off until Force Push, then this trooper is the practice target.
const DOCK_TEACH = {
    hp: 4,
    speed: 36,
    shot: 3.4,
    range: 96,
    sight: 72,
    dmg: 1,
    boltSpeed: 90,
    avoid: 128,
};

const BOSS_STATS = {
    chrome: { name: "Captain Phasma", hp: 12, speed: 44, gap: 2.15 },
    shadow: { name: "Inquisitor", hp: 12, speed: 78, gap: 1.2 },
    dark: { name: "Darth Vader", hp: 36, speed: 48, gap: 1.7 },
    fallen: { name: "Kylo Ren", hp: 28, speed: 60, gap: 1.5 },
    hooded: { name: "Emperor", hp: 42, speed: 64, gap: 1.05 },
};
