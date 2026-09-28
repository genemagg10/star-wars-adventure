// Star Station Adventure — pixel-row sprites.
// Each string is one row. "." is empty. Frames are baked once and blitted.

const SPRITE_INK = {
    k: PALETTE.ink,
    h: PALETTE.hull,
    p: PALETTE.panel,
    f: PALETTE.foam,
    b: PALETTE.blue,
    g: PALETTE.green,
    u: PALETTE.purple,
    y: PALETTE.gold,
    d: PALETTE.danger,
    l: PALETTE.lightning,
    v: PALETTE.void,
    o: PALETTE.orange,
};

function art(w, lines) {
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length !== w) {
            throw new Error("Sprite row " + i + " is " + line.length + " wide, expected " + w + " [" + line + "]");
        }
        rows.push(line);
    }
    return rows;
}

const ART = {
    wall: art(8, [
        "kkkkkkkk",
        "kppppppk",
        "kpphhppk",
        "kphhhphk",
        "khpphhhk",
        "kphhhpkk",
        "kppppppk",
        "kkkkkkkk",
    ]),
    floor: art(8, [
        "pppppppp",
        "phhhhhpp",
        "phhhhhpp",
        "pppppppp",
        "pppppppp",
        "phhhhhpp",
        "phhhhhpp",
        "pppppppp",
    ]),
    "floor-b": art(8, [
        "pppppppp",
        "phphphpp",
        "pppppppp",
        "phhhhhpp",
        "pppppppp",
        "phphphpp",
        "pppppppp",
        "phhhhhpp",
    ]),
    "floor-c": art(8, [
        "pppppppp",
        "phhhhhpp",
        "phhhhhpp",
        "pppppppp",
        "pphhhhpp",
        "pphhhhpp",
        "pppppppp",
        "phhhhhpp",
    ]),
    "floor-u": art(8, [
        "pppppppp",
        "phuhuupp",
        "phhhhhpp",
        "pppppppp",
        "pppppppp",
        "phhhhhpp",
        "ppuuhhpp",
        "pppppppp",
    ]),
    "floor-y": art(8, [
        "pppppppp",
        "phyhhhpy",
        "phhhhhpp",
        "pppppppp",
        "pppppppp",
        "phhhhhpp",
        "phyhhhpy",
        "pppppppp",
    ]),
    hazard: art(8, [
        "hhhhhhhh",
        "hddddhhh",
        "hhddddhh",
        "hhhddddh",
        "hhhhhhhh",
        "ddhhhhdd",
        "hhhhhhhh",
        "hhhhhhhh",
    ]),
    hazard2: art(8, [
        "hhhhhhhh",
        "hhddddhh",
        "hhhddddh",
        "hddddhhh",
        "hhhhhhhh",
        "hhddddhh",
        "hhhhhhhh",
        "hddhhddh",
    ]),
    pillar: art(8, [
        ".kkkkkk.",
        "kkppppkk",
        "kpuuuppk",
        "kpuuuupk",
        "kpuuuupk",
        "kppppppk",
        "kkppppkk",
        ".kkkkkk.",
    ]),
    door: art(8, [
        "kkkkkkkk",
        "kppppppk",
        "kp....pk",
        "kp.ff.pk",
        "kp.ff.pk",
        "kp....pk",
        "kppppppk",
        "kkkkkkkk",
    ]),
    "door-open": art(8, [
        "kkkkkkkk",
        "kp....pk",
        "k......k",
        "k......k",
        "k......k",
        "k......k",
        "kp....pk",
        "kkkkkkkk",
    ]),
    exit: art(8, [
        "kkkkkkkk",
        "kyyyyyyk",
        "ky.dd.yk",
        "ky.dd.yk",
        "ky....yk",
        "kyyyyyyk",
        "kppppppk",
        "kkkkkkkk",
    ]),
    "exit-open": art(8, [
        "kkkkkkkk",
        "kggggggk",
        "kg....gk",
        "kg.ff.gk",
        "kg.ff.gk",
        "kg....gk",
        "kggggggk",
        "kkkkkkkk",
    ]),
    chest: art(8, [
        ".yyyyyy.",
        "kyyyyyyk",
        "kffffffk",
        "kfyyyyfk",
        "kffffffk",
        "kyyyyyyk",
        ".kkkkkk.",
        "........",
    ]),
    switch: art(8, [
        "........",
        ".kkkkkk.",
        ".kppppk.",
        ".kpffpk.",
        ".kppppk.",
        ".kkkkkk.",
        "........",
        "........",
    ]),
    stripe: art(8, [
        "hhhhhhhh",
        "yyyyyyyy",
        "hhhhhhhh",
        "hhhhhhhh",
        "hhhhhhhh",
        "yyyyyyyy",
        "hhhhhhhh",
        "hhhhhhhh",
    ]),
    heart: art(8, [
        ".dd..dd.",
        "ddd..ddd",
        "dddddddd",
        ".dddddd.",
        "..dddd..",
        "...dd...",
        "........",
        "........",
    ]),
    "heart-empty": art(8, [
        ".pp..pp.",
        "ppp..ppp",
        "pppppppp",
        ".pppppp.",
        "..pppp..",
        "...pp...",
        "........",
        "........",
    ]),
    "lucan-down": art(16, [
        "................",
        "................",
        ".....yyyyyy.....",
        "....yykkkyy.....",
        "....yffffffy....",
        ".....ffbbff.....",
        "......bbbb......",
        ".....bbbbbb.....",
        ".....bbkybb.....",
        "......bbbb......",
        "......b..b......",
        "......b..b......",
        "......k..k......",
        "......k..k......",
        "................",
        "................",
    ]),
    "lucan-up": art(16, [
        "................",
        "................",
        ".....yyyyyy.....",
        "....yyyyyyy.....",
        "....yyyyyyy.....",
        ".....yyyyy......",
        "......bbbb......",
        ".....bbbbbb.....",
        ".....bbbbbb.....",
        "......bbbb......",
        "......b..b......",
        "......b..b......",
        "......k..k......",
        "......k..k......",
        "................",
        "................",
    ]),
    "lucan-side": art(16, [
        "................",
        "................",
        "......yyyy......",
        ".....yykyyy.....",
        ".....yffffk.....",
        "......fbbbk.....",
        "......bbbbk.....",
        ".....bbbbbb.....",
        ".....bbkybb.....",
        "......bbbb......",
        ".......bb.......",
        ".......bb.......",
        ".......kk.......",
        ".......kk.......",
        "................",
        "................",
    ]),
    "rae-down": art(16, [
        "................",
        "................",
        "......ffff......",
        ".....ffffff.....",
        ".....fkffkf.....",
        "......ffff......",
        "......gggg.y....",
        ".....gggggg.y...",
        ".....gggggg.y...",
        "......gggg.y....",
        "......g..g.y....",
        "......g..g......",
        "......k..k......",
        "......k..k......",
        "................",
        "................",
    ]),
    "rae-up": art(16, [
        "................",
        "................",
        "......ffff......",
        ".....ffffff.....",
        ".....ffffff.....",
        "......ffff......",
        "......gggg.y....",
        ".....gggggg.y...",
        ".....gggggg.y...",
        "......gggg.y....",
        "......g..g......",
        "......g..g......",
        "......k..k......",
        "......k..k......",
        "................",
        "................",
    ]),
    "rae-side": art(16, [
        "................",
        "................",
        "......ffff......",
        ".....ffffff.....",
        ".....fkfffk.....",
        "......ffffy.....",
        "......ggggy.....",
        ".....gggggy.....",
        ".....gggggy.....",
        "......gggg......",
        ".......gg.......",
        ".......gg.......",
        ".......kk.......",
        ".......kk.......",
        "................",
        "................",
    ]),
    "chewoo-down": art(16, [
        "................",
        "....yyyyyyyy....",
        "...yyyyyyyyyy...",
        "...yykkkyyyy....",
        "...yyyyyyyyy....",
        "....yydyyyyd....",
        "...yyyyyyyyyy...",
        "....yyyyyyyy....",
        "....yy.yy.yy....",
        "....yy.yy.yy....",
        "....kk.kk.kk....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]),
    "chewoo-up": art(16, [
        "................",
        "....yyyyyyyy....",
        "...yyyyyyyyyy...",
        "...yyyyyyyyy....",
        "...yyyyyyyyy....",
        "....yyyyyyyy....",
        "...yyyyyyyyyy...",
        "....yyyyyyyy....",
        "....yy.yy.yy....",
        "....yy.yy.yy....",
        "....kk.kk.kk....",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]),
    "chewoo-side": art(16, [
        "................",
        ".....yyyyyy.....",
        "....yyyyyyyy....",
        "....yykkkyyy....",
        "....yyyyyyy.....",
        ".....yydyyy.....",
        "....yyyyyyyy....",
        ".....yyyyyy.....",
        ".....yy.yy......",
        ".....yy.yy......",
        ".....kk.kk......",
        "................",
        "................",
        "................",
        "................",
        "................",
    ]),
    guard: art(10, [
        "...ffff...",
        "..ffffff..",
        "..fkffkf..",
        "...ffff...",
        "..ffffff..",
        ".ffffffff.",
        ".ffkffkff.",
        "..ffffff..",
        "..ff..ff..",
        "..ff..ff..",
        "..kk..kk..",
        "..kk..kk..",
    ]),
    "boss-chrome": art(10, [
        "...yyyy...",
        "..yyffyy..",
        ".yyffffyy.",
        ".yffkkffy.",
        "..ffyyyyff",
        ".pfffffffp",
        "ppffffffpp",
        "pkkffffkkp",
        ".ppffffpp.",
        "..kk..kk..",
        "..yy..yy..",
        "..pp..pp..",
    ]),
    "boss-shadow": art(10, [
        "...uuuu...",
        "..uukkuu..",
        ".uuuuuuuu.",
        ".ukuuuuku.",
        ".uuuuuuuu.",
        ".uhhhhhuu.",
        "uhhhkkhhhu",
        "uhhhuuhhhu",
        ".uhhhhhhu.",
        "..uu..uu..",
        "..kk..kk..",
        "..hh..hh..",
    ]),
    "boss-dark": art(10, [
        "...uuuu...",
        "..ukkkuu..",
        ".uukkkkuu.",
        ".ukuuuuku.",
        ".uuhhhhuu.",
        ".huuuuuhh.",
        "hhuyyyuhhh",
        "hhuuuuuhhh",
        ".hhkkkhhh.",
        "..hh..hh..",
        "..kk..kk..",
        "..yy..yy..",
    ]),
    "boss-fallen": art(10, [
        "...ffff...",
        "..ffddff..",
        ".ffkddkff.",
        ".ffffffff.",
        "..ffddff..",
        ".dffffffd.",
        "ddffkkffdd",
        ".dffkkffd.",
        "..ff..ff..",
        "..kk..kk..",
        "..dd..dd..",
        "..ff..ff..",
    ]),
    "boss-hooded": art(10, [
        "...uuuu...",
        "..ullluu..",
        ".uuuuuuuu.",
        ".ukkkkuku.",
        ".ullllllu.",
        ".uhhhhhuu.",
        "luhhhhhhul",
        ".uhhhhhuu.",
        "..uu..uu..",
        "..ll..ll..",
        "..kk..kk..",
        "..uu..uu..",
    ]),
    little: art(12, [
        "...kk..kk...",
        "..kff..ffk..",
        "..kffffffk..",
        "..kfyyyyfk..",
        "...ffffff...",
        "..ffggggff..",
        "....gggg....",
        "...gggggg...",
        "...g....g...",
        "...k....k...",
        "............",
        "............",
    ]),
    bot: art(16, [
        "................",
        ".....yyyyyy.....",
        "....ypppppy.....",
        "...ypppppppy....",
        "...ypkkkkppy....",
        "...yppffpppy....",
        "...ypfggfppy....",
        "...yppffpppy....",
        "....ypppppy.....",
        ".....yyyyyy.....",
        "......pppp......",
        ".....pppppp.....",
        ".....p....p.....",
        ".....k....k.....",
        "................",
        "................",
    ]),
    "ship-twin": art(20, [
        "........bb..........",
        "......bbbbbb........",
        "....bbbbbbbbbb......",
        "...bbbyyyyyyyybbb...",
        "..bbbbyyppppyybbbb..",
        ".bbbbbyyppppyybbbbb.",
        "bbbbbbyyyyyyyybbbbbb",
        ".bbbbbyyyyyyyybbbbb.",
        "..bbbbyyyyyyyybbbb..",
        "...bbbbkkkkkkbbbb...",
        "....bbkk....kkbb....",
        "....dd......dd......",
    ]),
    "ship-snub": art(12, [
        "....yyyy....",
        "..ffffffff..",
        ".fffpffpfff.",
        ".ffffffffff.",
        "..ffyyyyff..",
        "...ffyyff...",
        "....ffff....",
        ".....kk.....",
        ".....dd.....",
        "............",
    ]),
};

const SPRITE_SCALE = {
    wall: 2, floor: 2, "floor-b": 2, "floor-c": 2, "floor-u": 2, "floor-y": 2,
    hazard: 2, hazard2: 2, pillar: 2, door: 2, "door-open": 2,
    exit: 2, "exit-open": 2, chest: 2, switch: 2, stripe: 2,
    heart: 2, "heart-empty": 2,
    "lucan-down": 2, "lucan-up": 2, "lucan-side": 2,
    "rae-down": 2, "rae-up": 2, "rae-side": 2,
    "chewoo-down": 2, "chewoo-up": 2, "chewoo-side": 2,
    guard: 2,
    "boss-chrome": 4, "boss-shadow": 4, "boss-dark": 4, "boss-fallen": 4, "boss-hooded": 4,
    little: 2,
    bot: 2,
    "ship-twin": 2,
    "ship-snub": 2,
};

const Sprites = {
    cache: {},

    build() {
        const keys = Object.keys(ART);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.cache[key] = bakeSprite(ART[key], SPRITE_SCALE[key] || 2);
        }
    },

    draw(ctx, key, x, y, flip) {
        const canvas = this.cache[key];
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.imageSmoothingEnabled = false;
        if (flip) {
            ctx.save();
            ctx.translate(Math.round(x), Math.round(y));
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, Math.round(-w / 2), Math.round(-h / 2));
            ctx.restore();
        } else {
            ctx.drawImage(canvas, Math.round(x - w / 2), Math.round(y - h / 2));
        }
    },

    heroKey(id, facing) {
        if (Math.abs(facing.x) > Math.abs(facing.y)) return id + "-side";
        if (facing.y < 0) return id + "-up";
        return id + "-down";
    },

    heroFlip(facing) {
        return Math.abs(facing.x) > Math.abs(facing.y) && facing.x < 0;
    },

    drawBlade(ctx, x, y, facing, length, color, wide) {
        const ang = Math.atan2(facing.y, facing.x);
        const x2 = x + Math.cos(ang) * length;
        const y2 = y + Math.sin(ang) * length;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = wide || 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * 8, y + Math.sin(ang) * 8);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.strokeStyle = PALETTE.foam;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    },
};

function bakeSprite(rows, scale) {
    const h = rows.length;
    const w = rows[0].length;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const g = canvas.getContext("2d");
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const ch = rows[y][x];
            if (ch === "." || !SPRITE_INK[ch]) continue;
            g.fillStyle = SPRITE_INK[ch];
            g.fillRect(x * scale, y * scale, scale, scale);
        }
    }
    return canvas;
}
