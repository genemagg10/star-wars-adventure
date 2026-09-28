// Star Wars Adventure — linear decks aboard the Death Star.
// Rock Toss primary path: the Trash Compactor chest sits between Darth Vader
// and Kylo Ren. If that chest cannot be reached, Kylo Ren grants it.

function makeGrid(w, h) {
    const g = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            row.push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#" : ".");
        }
        g.push(row);
    }
    return g;
}

function putCell(g, x, y, ch) {
    if (y <= 0 || x <= 0 || y >= g.length - 1 || x >= g[0].length - 1) return;
    g[y][x] = ch;
}

function fillCell(g, x, y, w, h, ch) {
    for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) putCell(g, x + xx, y + yy, ch);
    }
}

function deckDock() {
    const g = makeGrid(54, 36);
    [[8, 8], [8, 24], [42, 8], [42, 24], [22, 16], [32, 16]].forEach((p) => fillCell(g, p[0], p[1], 2, 2, "+"));
    putCell(g, 27, 30, "P");
    putCell(g, 27, 26, "L");
    putCell(g, 27, 2, "E");
    putCell(g, 16, 18, "G");
    putCell(g, 38, 20, "G");
    placeToys(g, 14, 12, 40, 14, 24, 22, 6);
    return g;
}

function deckHangar() {
    const g = makeGrid(58, 38);
    for (let y = 6; y < 34; y += 8) {
        for (let x = 3; x < 55; x++) {
            if (g[y][x] === ".") g[y][x] = "=";
            if (g[y + 1] && g[y + 1][x] === ".") g[y + 1][x] = "=";
        }
    }
    fillCell(g, 8, 12, 4, 2, "#");
    fillCell(g, 46, 12, 4, 2, "#");
    fillCell(g, 8, 26, 4, 2, "#");
    fillCell(g, 46, 26, 4, 2, "#");
    putCell(g, 29, 33, "P");
    putCell(g, 29, 2, "E");
    putCell(g, 29, 15, "B");
    putCell(g, 18, 21, "G");
    putCell(g, 40, 21, "G");
    putCell(g, 29, 25, "G");
    placeToys(g, 12, 10, 48, 18, 0, 0, 0);
    return g;
}

function deckConduit() {
    const g = makeGrid(60, 36);
    for (let y = 5; y <= 29; y++) {
        if (y < 15 || y > 18) putCell(g, 18, y, "#");
        if (y < 10 || y > 13) putCell(g, 40, y, "#");
    }
    putCell(g, 30, 31, "P");
    putCell(g, 50, 3, "E");
    putCell(g, 50, 12, "B");
    putCell(g, 10, 16, "G");
    putCell(g, 28, 14, "G");
    putCell(g, 28, 24, "G");
    putCell(g, 48, 24, "G");
    placeToys(g, 8, 8, 26, 8, 22, 20, 6);
    return g;
}

function deckTrash() {
    const g = makeGrid(56, 36);
    for (let y = 1; y < 35; y++) g[y][9] = "#";
    for (let x = 1; x <= 8; x++) {
        g[5][x] = "#";
        g[18][x] = "#";
    }
    g[12][9] = "D";
    g[13][9] = "D";
    putCell(g, 4, 12, "S");
    putCell(g, 16, 28, "K");
    putCell(g, 30, 14, "C");
    for (let x = 12; x <= 50; x++) {
        if (x < 26 || x > 29) g[22][x] = "~";
    }
    putCell(g, 42, 30, "P");
    putCell(g, 42, 2, "E");
    putCell(g, 20, 12, "G");
    putCell(g, 44, 16, "G");
    placeToys(g, 22, 8, 36, 8, 34, 18, 5);
    return g;
}

function deckGallery() {
    const g = makeGrid(56, 38);
    fillCell(g, 14, 6, 28, 2, "#");
    for (let x = 26; x <= 30; x++) {
        g[6][x] = ".";
        g[7][x] = ".";
    }
    fillCell(g, 8, 16, 2, 2, "+");
    fillCell(g, 46, 16, 2, 2, "+");
    fillCell(g, 8, 28, 2, 2, "+");
    fillCell(g, 46, 28, 2, 2, "+");
    putCell(g, 28, 33, "P");
    putCell(g, 28, 3, "E");
    putCell(g, 28, 12, "B");
    putCell(g, 18, 22, "G");
    putCell(g, 38, 22, "G");
    placeToys(g, 12, 12, 44, 12, 22, 20, 8);
    return g;
}

function deckFallen() {
    const g = makeGrid(54, 36);
    fillCell(g, 10, 10, 5, 2, "#");
    fillCell(g, 38, 10, 5, 2, "#");
    fillCell(g, 10, 24, 5, 2, "#");
    fillCell(g, 38, 24, 5, 2, "#");
    putCell(g, 27, 31, "P");
    putCell(g, 27, 2, "E");
    putCell(g, 27, 16, "B");
    putCell(g, 18, 16, "G");
    putCell(g, 36, 16, "G");
    placeToys(g, 16, 8, 36, 8, 20, 20, 8);
    return g;
}

function deckCore() {
    const g = makeGrid(52, 36);
    [[10, 8], [10, 16], [10, 24], [38, 8], [38, 16], [38, 24], [20, 8], [30, 8], [20, 26], [30, 26]].forEach((p) => {
        fillCell(g, p[0], p[1], 2, 2, "+");
    });
    putCell(g, 26, 31, "P");
    putCell(g, 26, 15, "B");
    putCell(g, 18, 21, "G");
    putCell(g, 34, 21, "G");
    placeToys(g, 16, 12, 34, 14, 23, 18, 6);
    return g;
}

function placeToys(g, ox, oy, ix, iy, sx, sy, len) {
    putCell(g, ox, oy, "O");
    putCell(g, ix, iy, "I");
    for (let i = 0; i < len; i++) {
        if (g[sy] && g[sy][sx + i] === ".") g[sy][sx + i] = "=";
    }
}

const FLOOR_CYCLE = {
    dock: ["floor", "floor-b", "floor-c"],
    hangar: ["floor", "floor-y", "stripe"],
    conduit: ["floor-u", "floor", "floor-b"],
    trash: ["floor-c", "floor", "floor-b"],
    gallery: ["floor-y", "floor", "floor-b"],
    fallen: ["floor-c", "floor-b", "floor"],
    core: ["floor-u", "floor", "floor-b"],
};

const World = {
    sectors: [
        { id: "dock", name: "Docking Ring", bossId: null, needsChest: false, build: deckDock, clearGoal: "Clear the ring", exitGoal: "Reach the hangar", accent: PALETTE.blue },
        { id: "hangar", name: "Phasma Hangar", bossId: "chrome", needsChest: false, build: deckHangar, bossGoal: "Defeat Captain Phasma", exitGoal: "Leave the hangar", accent: PALETTE.gold },
        { id: "conduit", name: "Inquisitor Conduit", bossId: "shadow", needsChest: false, build: deckConduit, bossGoal: "Defeat the Inquisitor", exitGoal: "Leave the conduit", accent: PALETTE.purple },
        { id: "gallery", name: "Throne Gallery", bossId: "dark", needsChest: false, build: deckGallery, bossGoal: "Defeat Darth Vader", exitGoal: "Leave the gallery", accent: PALETTE.orange },
        { id: "trash", name: "Trash Compactor", bossId: null, needsChest: true, build: deckTrash, clearGoal: "Clear the compactor", chestGoal: "Open the salvage chest", exitGoal: "Leave the compactor", accent: PALETTE.green },
        { id: "fallen", name: "Kylo Deck", bossId: "fallen", needsChest: false, build: deckFallen, bossGoal: "Defeat Kylo Ren", exitGoal: "Leave the deck", accent: PALETTE.lightning },
        { id: "core", name: "Core Gate", bossId: "hooded", needsChest: false, build: deckCore, bossGoal: "Defeat the Emperor", clearGoal: "Hold the core", exitGoal: "Hold the core", accent: PALETTE.foam },
    ],

    bake(spec) {
        const grid = spec.build();
        const tiles = grid.map((row) => row.slice());
        const h = tiles.length;
        const w = tiles[0].length;
        const guards = [];
        let spawn = null;
        let exit = null;
        let boss = null;
        let chest = null;
        let panel = null;
        let sticker = null;
        let lesson = null;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const ch = tiles[y][x];
                const p = tileToWorld(x, y);
                if (ch === "P") { spawn = p; tiles[y][x] = "A"; }
                else if (ch === "G") { guards.push(p); tiles[y][x] = "."; }
                else if (ch === "B") { boss = p; tiles[y][x] = "."; }
                else if (ch === "E") {
                    exit = p;
                    const porch = [[0, 1], [0, 2], [-1, 1], [1, 1]];
                    for (let n = 0; n < porch.length; n++) {
                        const nx = x + porch[n][0];
                        const ny = y + porch[n][1];
                        if (tiles[ny] && tiles[ny][nx] === ".") tiles[ny][nx] = "=";
                    }
                }
                else if (ch === "C") chest = p;
                else if (ch === "K") panel = p;
                else if (ch === "L") lesson = p;
                else if (ch === "S") { sticker = p; tiles[y][x] = "."; }
            }
        }
        let chestReachable = false;
        if (spec.needsChest && chest && spawn) {
            const from = worldToTile(spawn.x, spawn.y);
            const to = worldToTile(chest.x, chest.y);
            chestReachable = bfs(tiles, from.x, from.y, to.x, to.y, (ch) => {
                return ch === "#" || ch === "+" || ch === "D";
            });
        }
        return {
            id: spec.id,
            name: spec.name,
            bossId: spec.bossId,
            bossGoal: spec.bossGoal || "",
            clearGoal: spec.clearGoal || "",
            chestGoal: spec.chestGoal || "",
            exitGoal: spec.exitGoal || "",
            needsChest: spec.needsChest,
            chestReachable: chestReachable,
            w: w,
            h: h,
            tiles: tiles,
            spawn: spawn,
            exit: exit,
            boss: boss,
            chest: chest,
            panel: panel,
            sticker: sticker,
            lesson: lesson,
            guards: guards,
            accent: spec.accent || PALETTE.blue,
        };
    },

    isSolid(sector, tx, ty, secretOpen) {
        if (!sector || ty < 0 || tx < 0 || ty >= sector.h || tx >= sector.w) return true;
        const ch = sector.tiles[ty][tx];
        if (ch === "#" || ch === "+") return true;
        if (ch === "D" && !secretOpen) return true;
        return false;
    },

    tileSprite(sector, ch, tx, ty, game) {
        if (ch === "#") return "wall";
        if (ch === "+") return "pillar";
        if (ch === "~") return Math.floor(game.time * 3) % 2 === 0 ? "hazard" : "hazard2";
        if (ch === "D") return game.secretOpen ? "door-open" : "door";
        if (ch === "E") return game.exitOpen() ? "exit-open" : "exit";
        if (ch === "C") return game.owns("rock") ? "floor" : "chest";
        if (ch === "=") return Math.floor(game.time * 4 + tx) % 2 === 0 ? "stripe" : "stripe-b";
        if (ch === "O") return Math.floor(game.time * 3 + tx + ty) % 2 === 0 ? "viewport" : "viewport-b";
        if (ch === "I") return "pipe";
        if (ch === "K") return "switch";
        if (ch === "L") return "switch";
        if (ch === "A") return "pad";
        const cycle = FLOOR_CYCLE[sector.id] || FLOOR_CYCLE.dock;
        const n = Math.abs((tx * 13 + ty * 7) % cycle.length);
        return cycle[n];
    },

    draw(ctx, sector, camera, game) {
        const x0 = Math.floor(camera.x / TILE) - 1;
        const y0 = Math.floor(camera.y / TILE) - 1;
        const x1 = x0 + Math.ceil(CANVAS_W / TILE) + 3;
        const y1 = y0 + Math.ceil(CANVAS_H / TILE) + 3;
        for (let ty = y0; ty <= y1; ty++) {
            if (ty < 0 || ty >= sector.h) continue;
            for (let tx = x0; tx <= x1; tx++) {
                if (tx < 0 || tx >= sector.w) continue;
                const key = this.tileSprite(sector, sector.tiles[ty][tx], tx, ty, game);
                const dx = tx * TILE + TILE / 2 - camera.x;
                const dy = ty * TILE + TILE / 2 - camera.y;
                Sprites.draw(ctx, key, dx, dy, false);
                if (key === "stripe" || key === "stripe-b") {
                    const pulse = 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(game.time * 4 + tx * 0.4));
                    ctx.save();
                    ctx.globalCompositeOperation = "lighter";
                    ctx.globalAlpha = pulse;
                    ctx.fillStyle = key === "stripe" ? PALETTE.blue : PALETTE.gold;
                    ctx.fillRect(Math.round(dx - TILE / 2), Math.round(dy - TILE / 2), TILE, 3);
                    ctx.restore();
                }
            }
        }
        if (sector.id === "hangar") this.drawParkedSnub(ctx, camera);
        if (sector.id === "trash") this.drawJunk(ctx, camera, game);
        const accent = sector.accent || PALETTE.blue;
        ctx.save();
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.07;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.strokeRect(3, 3, CANVAS_W - 6, CANVAS_H - 6);
        ctx.restore();
    },

    drawJunk(ctx, camera, game) {
        const bits = [
            { x: 18, y: 16, key: "junk", ph: 0 },
            { x: 24, y: 19, key: "junk-b", ph: 1.1 },
            { x: 33, y: 15, key: "junk", ph: 2.2 },
            { x: 40, y: 18, key: "junk-b", ph: 0.4 },
            { x: 27, y: 21, key: "junk", ph: 1.7 },
            { x: 36, y: 23, key: "junk-b", ph: 2.6 },
            { x: 46, y: 20, key: "junk", ph: 0.8 },
        ];
        for (let i = 0; i < bits.length; i++) {
            const bit = bits[i];
            const bob = Math.sin(game.time * 2.1 + bit.ph) * 5;
            const drift = Math.sin(game.time * 0.7 + bit.ph) * 3;
            Sprites.draw(
                ctx,
                bit.key,
                bit.x * TILE + TILE / 2 - camera.x + drift,
                bit.y * TILE + TILE / 2 - camera.y + bob,
                false
            );
        }
    },

    drawParkedSnub(ctx, camera) {
        const sx = 8 * TILE + TILE / 2 - camera.x;
        const sy = 9 * TILE + TILE / 2 - camera.y;
        ctx.save();
        ctx.translate(Math.round(sx), Math.round(sy));
        ctx.scale(2, 2);
        ctx.globalAlpha = 0.92;
        Sprites.draw(ctx, "ship-snub", 0, 0, false);
        ctx.restore();
    },

    // Returns human-readable layout problems. Empty means the deck is walkable.
    audit(spec) {
        const sector = this.bake(spec);
        const issues = [];
        if (!sector.spawn) issues.push(spec.id + " missing spawn");
        const solid = (ch, open) => ch === "#" || ch === "+" || (ch === "D" && !open);
        const reach = (ax, ay, bx, by, open) => bfs(sector.tiles, ax, ay, bx, by, (ch) => solid(ch, open));
        const spawnT = worldToTile(sector.spawn.x, sector.spawn.y);
        if (sector.exit) {
            const exitT = worldToTile(sector.exit.x, sector.exit.y);
            if (!reach(spawnT.x, spawnT.y, exitT.x, exitT.y, false)) issues.push(spec.id + " exit blocked");
        }
        if (sector.lesson) {
            const lessonT = worldToTile(sector.lesson.x, sector.lesson.y);
            if (!reach(spawnT.x, spawnT.y, lessonT.x, lessonT.y, false)) issues.push(spec.id + " lesson blocked");
        }
        if (sector.chest) {
            const chestT = worldToTile(sector.chest.x, sector.chest.y);
            if (!reach(spawnT.x, spawnT.y, chestT.x, chestT.y, false)) issues.push(spec.id + " chest blocked");
        }
        if (sector.boss) {
            const bossT = worldToTile(sector.boss.x, sector.boss.y);
            if (!reach(spawnT.x, spawnT.y, bossT.x, bossT.y, false)) issues.push(spec.id + " boss blocked");
        }
        if (sector.sticker) {
            const st = worldToTile(sector.sticker.x, sector.sticker.y);
            if (reach(spawnT.x, spawnT.y, st.x, st.y, false)) issues.push(spec.id + " secret open too soon");
            if (!reach(spawnT.x, spawnT.y, st.x, st.y, true)) issues.push(spec.id + " secret never opens");
        }
        for (let i = 0; i < sector.guards.length; i++) {
            const gt = worldToTile(sector.guards[i].x, sector.guards[i].y);
            if (!reach(spawnT.x, spawnT.y, gt.x, gt.y, false)) issues.push(spec.id + " guard " + i + " blocked");
        }
        return issues;
    },
};

function bfs(tiles, sx, sy, tx, ty, blocked) {
    const h = tiles.length;
    const w = tiles[0].length;
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return false;
    const seen = new Uint8Array(w * h);
    const qx = [sx];
    const qy = [sy];
    seen[sy * w + sx] = 1;
    for (let i = 0; i < qx.length; i++) {
        const x = qx[i];
        const y = qy[i];
        if (x === tx && y === ty) return true;
        const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let s = 0; s < steps.length; s++) {
            const nx = x + steps[s][0];
            const ny = y + steps[s][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const idx = ny * w + nx;
            if (seen[idx]) continue;
            if (blocked(tiles[ny][nx])) continue;
            seen[idx] = 1;
            qx.push(nx);
            qy.push(ny);
        }
    }
    return false;
}
