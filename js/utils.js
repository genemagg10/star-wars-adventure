// Star Wars Adventure — small shared helpers.

function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.0001) return { x: 0, y: 0 };
    return { x: dx / len, y: dy / len };
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function tileToWorld(tx, ty) {
    return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

function worldToTile(wx, wy) {
    return { x: Math.floor(wx / TILE), y: Math.floor(wy / TILE) };
}

function saberById(id) {
    for (let i = 0; i < SABERS.length; i++) {
        if (SABERS[i].id === id) return SABERS[i];
    }
    return SABERS[0];
}

function lineBlocked(solidAt, x1, y1, x2, y2) {
    const span = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(span / 8));
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        if (solidAt(Math.floor(x / TILE), Math.floor(y / TILE))) return true;
    }
    return false;
}

function formatClearTime(ms) {
    const total = Math.max(0, Math.round((ms || 0) / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

function cameraAxis(pos, worldPx, viewPx) {
    if (worldPx <= viewPx) return (worldPx - viewPx) / 2;
    return clamp(pos - viewPx / 2, 0, worldPx - viewPx);
}
