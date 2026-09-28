// Star Wars Adventure — original pixel-row sprites. No scraped assets.
// Each string is one row. "." is empty. Frames are baked once and blitted.
// Draw boxes: heroes and stormtroopers 32×32, Grogu 24×24, bosses 40×48.
// Scales stay integers so the pixels stay crisp.

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
    c: PALETTE.fur,
    m: PALETTE.furDeep,
    w: PALETTE.white,
    a: PALETTE.vader,
    e: PALETTE.cloak,
    n: PALETTE.metal,
    s: PALETTE.skin,
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
        "kpbbbppk",
        "kppppppk",
        "kphhhphk",
        "kppppppk",
        "kpnnnnpk",
        "kkkkkkkk",
    ]),
    floor: art(8, [
        "hhhhhhhh",
        "hpphhhpp",
        "hhhhhhhh",
        "hnnnnnnh",
        "hhhhhhhh",
        "hpphhhpp",
        "hhhhhhhh",
        "hnnnnnnh",
    ]),
    "floor-b": art(8, [
        "hhhhhhhh",
        "hnppppnh",
        "hppppnph",
        "hhhhhhhh",
        "hnppppnh",
        "hppppnph",
        "hhhhhhhh",
        "hbbbbhhh",
    ]),
    "floor-c": art(8, [
        "hhhhhhhh",
        "hphhhpph",
        "hhnnnnhh",
        "hhhhhhhh",
        "hpppphhh",
        "hhhhhhhh",
        "hphhhpph",
        "hhhhhhhh",
    ]),
    "floor-u": art(8, [
        "hhhhhhhh",
        "hpuuuphh",
        "hhhhhhhh",
        "huuuuuuh",
        "hhhhhhhh",
        "hhpuuuph",
        "hhhhhhhh",
        "hbbbbhhh",
    ]),
    "floor-y": art(8, [
        "hhhhhhhh",
        "hyhhhhyh",
        "hhhhhhhh",
        "hnnnnnnh",
        "hhhhhhhh",
        "hhyhhhhy",
        "hhhhhhhh",
        "hyyyyhhh",
    ]),
    viewport: art(8, [
        "..kkkk..",
        ".kvvvvk.",
        "kvvfvvvk",
        "kvvvvvvk",
        "kvvvvfvk",
        "kvfvvvvk",
        ".kvvvvk.",
        "..kkkk..",
    ]),
    "viewport-b": art(8, [
        "..kkkk..",
        ".kvfvvk.",
        "kvvvvvvk",
        "kvvvvfvk",
        "kvfvvvvk",
        "kvvvvvvk",
        ".kvyvvk.",
        "..bbbb..",
    ]),
    pad: art(8, [
        "yhhhhhhy",
        "yhhhhhhy",
        "hh....hh",
        "hh.ff.hh",
        "hh.ff.hh",
        "hh....hh",
        "yhhhhhhy",
        "yhhhhhhy",
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
        "bbbbbbbb",
        "yyyyyyyy",
        "bbbbbbbb",
        "hnnnnnnh",
        "yyyyyyyy",
        "bbbbbbbb",
        "yyyyyyyy",
        "bbbbbbbb",
    ]),
    "stripe-b": art(8, [
        "yyyyyyyy",
        "bbbbbbbb",
        "yfyyyyfy",
        "hnnnnnnh",
        "bfbbbbfb",
        "yyyyyyyy",
        "bbbbbbbb",
        "yyyyyyyy",
    ]),
    pipe: art(8, [
        ".kkkkkk.",
        "knnnnnnk",
        "kbnnnnbk",
        "knbbbbnk",
        "knbbbbnk",
        "kbnnnnbk",
        "knnnnnnk",
        ".kkkkkk.",
    ]),
    heart: art(8, [
        ".gg..gg.",
        "ggg..ggg",
        "gggggggg",
        ".gggggg.",
        "..gggg..",
        "...gg...",
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
        "....yyyyyyyy....",
        "...yykkkkkyy....",
        "...ysffffffsy...",
        "...ysfpffpfsy...",
        "....sffffffs....",
        "....oooooooo....",
        "...ooobbbbooo...",
        "...oooooooooo...",
        "....ooobbooo....",
        ".....oo..oo.....",
        ".....oo..oo.....",
        ".....kk..kk.....",
        ".....kk..kk.....",
        "................",
        "................",
    ]),
    "lucan-up": art(16, [
        "................",
        "....yyyyyyyy....",
        "...yyyyyyyyy....",
        "...yyyyyyyyy....",
        "....yyyyyyyy....",
        "....oooooooo....",
        "...oooooooooo...",
        "...ooobbbbooo...",
        "....oooooooo....",
        ".....oo..oo.....",
        ".....oo..oo.....",
        ".....kk..kk.....",
        ".....kk..kk.....",
        "................",
        "................",
        "................",
    ]),
    "lucan-side": art(16, [
        "................",
        ".....yyyyyy.....",
        "....yykkkky.....",
        "....ysffffk.....",
        ".....sfpffk.....",
        ".....sfffk......",
        "....ooooo.......",
        "...ooobbbo......",
        "...ooooooo......",
        "....ooooo.......",
        ".....oo.........",
        ".....oo.........",
        ".....kk.........",
        ".....kk.........",
        "................",
        "................",
    ]),
    "rae-down": art(16, [
        "................",
        ".....ffffff.....",
        "....ffffffff....",
        "....fkffffkf....",
        ".....sffffs.....",
        "......ffff......",
        ".....gggggg.....",
        "....ggfggggg....",
        "....gggggggg....",
        ".....yggggy.....",
        "......gg..gg....",
        "......gg..gg....",
        "......kk..kk....",
        "......kk..kk....",
        "................",
        "................",
    ]),
    "rae-up": art(16, [
        "................",
        ".....ffffff.....",
        "....ffffffff....",
        "....ffffffff....",
        ".....ffffff.....",
        "......ffff......",
        ".....gggggg.....",
        "....gggggggg....",
        "....gggggggg....",
        ".....yggggy.....",
        "......gg..gg....",
        "......gg..gg....",
        "......kk..kk....",
        "......kk..kk....",
        "................",
        "................",
    ]),
    "rae-side": art(16, [
        "................",
        "......ffff......",
        ".....ffffff.....",
        "....fkffffk.....",
        ".....sffffk.....",
        "......fffk......",
        ".....ggggg......",
        "....ggfggg......",
        "....gggggg......",
        ".....yggg.......",
        "......gg........",
        "......gg........",
        "......kk........",
        "......kk........",
        "................",
        "................",
    ]),
    "chewoo-down": art(16, [
        "cc............cc",
        ".c............c.",
        ".cc..........cc.",
        ".cccccccccccccc.",
        "ccmmccccccccmmcc",
        "cckkccccccckkccc",
        ".cccccccccccccc.",
        ".cccyccccycccc..",
        ".cccccccccccccc.",
        "..cccyyyyccccc..",
        "..cccccccccccc..",
        "..cc.cccc.cc....",
        "..cc.cccc.cc....",
        "..kk.kkkk.kk....",
        "................",
        "................",
        "................",
        "................",
    ]),
    "chewoo-up": art(16, [
        "cc............cc",
        ".c............c.",
        ".cc..........cc.",
        ".cccccccccccccc.",
        "cccccccccccccccc",
        "cccccccccccccccc",
        ".cccccccccccccc.",
        ".ccccccccccccc..",
        ".cccccccccccccc.",
        "..cccyyyyccccc..",
        "..cccccccccccc..",
        "..cc.cccc.cc....",
        "..cc.cccc.cc....",
        "..kk.kkkk.kk....",
        "................",
        "................",
        "................",
        "................",
    ]),
    "chewoo-side": art(16, [
        "....cc..........",
        "...c............",
        "................",
        "...cccccccccc...",
        "..cccmmcccccc...",
        "..ccckkccccccc..",
        "..cccccccccccc..",
        "...cccyccccccc..",
        "..cccccccccccc..",
        "..cccyyyycccc...",
        "...cccccccccc...",
        "....cc...cc.....",
        "....cc...cc.....",
        "....kk...kk.....",
        "................",
        "................",
        "................",
        "................",
    ]),
    guard: art(16, [
        ".wwwwwwwwwwwwww.",
        "wwwwwwwwwwwwwwww",
        "wwkkkkwwwwkkkkww",
        "wwkwwkwwwwkwwkww",
        "wwwwwwwwwwwwwwww",
        ".wwwwwwwwwwwwww.",
        "wwwwwwwwwwwwwwww",
        "wwwwkkwwwwkkwwww",
        "wwwwwwwwwwwwwwww",
        "wwwwwwwwwwwwwwww",
        ".wwwwwwwwwwwwww.",
        "..wwwwwwwwwwww..",
        "...wwww..wwww...",
        "...wwww..wwww...",
        "....kk....kk....",
        "...kkkk..kkkk...",
    ]),
    "boss-chrome": art(10, [
        "..wwwwww..",
        ".wwkkkkww.",
        "wwkwwwwkww",
        ".wwwwwwww.",
        "..yyyyyy..",
        ".wwyyyyww.",
        "wwwwwwwwww",
        "wkwyyyywkw",
        ".wwwwwwww.",
        "..ww..ww..",
        "..kk..kk..",
        "..ww..ww..",
    ]),
    "boss-shadow": art(10, [
        "...uuuu...",
        "..uukkuu..",
        ".uuuuuuuu.",
        ".ukuuuuku.",
        ".uuuuuuuu.",
        ".uhhhhhuu.",
        "uhhhkkhhhu",
        ".uhhkkhhu.",
        "..uu..uu..",
        "..kk..kk..",
        "..hh..hh..",
        "..uu..uu..",
    ]),
    "boss-dark": art(10, [
        "...aaaa...",
        "..aaaaaa..",
        ".aakkkkaa.",
        ".aakyykaa.",
        "..aaaaaa..",
        ".yaaaaaay.",
        "yaayyyaaay",
        ".yaaaaay..",
        "..aaaaaa..",
        "...aa.aa..",
        "...aa.aa..",
        "..aaa.aaa.",
    ]),
    "boss-fallen": art(10, [
        "...ffff...",
        "..ffkkff..",
        ".ffkddkff.",
        ".ffffffff.",
        "..ffddff..",
        ".dffffffd.",
        "ddffyyffdd",
        ".dffyyffd.",
        "..ff..ff..",
        "..kk..kk..",
        "..dd..dd..",
        "..ff..ff..",
    ]),
    "boss-hooded": art(10, [
        "...eeee...",
        "..eeeeee..",
        ".eekkkkee.",
        ".eevvvvvee",
        "..eeeeee..",
        "..ellllee.",
        ".eellllee.",
        "..eeeeee..",
        "...ee.ee..",
        "...ll.ll..",
        "...kk.kk..",
        "...ee.ee..",
    ]),
    little: art(12, [
        ".kk......kk.",
        "kffk....kffk",
        ".kffffffffk.",
        ".kfyyffyyfk.",
        "..ffffffff..",
        "..ffggggff..",
        "...gggggg...",
        "...gggggg...",
        "....g..g....",
        "....k..k....",
        "............",
        "............",
    ]),
    "grogu-face": art(12, [
        ".kk......kk.",
        "kffk....kffk",
        ".kffffffffk.",
        ".kfyyffyyfk.",
        "..kffffffk..",
        "...ffffff...",
        "....ffff....",
        "............",
        "............",
        "............",
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
        "............",
        "............",
    ]),
    junk: art(8, [
        "..yyyy..",
        ".yppppy.",
        ".pnnnnp.",
        ".pnffnp.",
        ".pnnnnp.",
        ".yppppy.",
        "..dddd..",
        "........",
    ]),
    "junk-b": art(8, [
        "...oo...",
        "..oppo..",
        ".opnnpo.",
        ".pnnnnp.",
        "..pnnnp.",
        "...pp...",
        "....d...",
        "........",
    ]),
    debris: art(8, [
        "..dddd..",
        ".ddnnnd.",
        "dnnddnnd",
        "dnnnnnnd",
        "dnnyynnd",
        ".ddnnnd.",
        "..dddd..",
        "........",
    ]),
};

const SPRITE_SCALE = {
    wall: 2, floor: 2, "floor-b": 2, "floor-c": 2, "floor-u": 2, "floor-y": 2,
    viewport: 2, "viewport-b": 2, pad: 2,
    hazard: 2, hazard2: 2, pillar: 2, door: 2, "door-open": 2,
    exit: 2, "exit-open": 2, chest: 2, switch: 2, stripe: 2, "stripe-b": 2, pipe: 2,
    heart: 2, "heart-empty": 2,
    "lucan-down": 2, "lucan-up": 2, "lucan-side": 2,
    "rae-down": 2, "rae-up": 2, "rae-side": 2,
    "chewoo-down": 2, "chewoo-up": 2, "chewoo-side": 2,
    guard: 2,
    "boss-chrome": 4, "boss-shadow": 4, "boss-dark": 4, "boss-fallen": 4, "boss-hooded": 4,
    little: 2,
    "grogu-face": 2,
    bot: 2,
    "ship-twin": 2,
    "ship-snub": 2,
    junk: 2,
    "junk-b": 2,
    debris: 2,
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
        const x1 = x + Math.cos(ang) * 8;
        const y1 = y + Math.sin(ang) * 8;
        const x2 = x + Math.cos(ang) * length;
        const y2 = y + Math.sin(ang) * length;
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = (wide || 3) + 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = wide || 3;
        ctx.stroke();
        ctx.strokeStyle = PALETTE.foam;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    },

    drawSwing(ctx, x, y, facing, range, color, swing, dur) {
        const ang = Math.atan2(facing.y, facing.x);
        const spanTime = dur || 0.22;
        const along = 1 - Math.max(0, Math.min(1, swing / spanTime));
        const span = 1.7;
        const a0 = ang - span * 0.62 + along * span;
        const a1 = a0 + span * 0.55;
        const radius = Math.max(18, range * 0.86);
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(x, y, radius, a0, a1);
        ctx.stroke();
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = PALETTE.foam;
        ctx.lineWidth = 2;
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
