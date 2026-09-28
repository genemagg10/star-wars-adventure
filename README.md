# Star Station Adventure

By Jordan.

A short top-down adventure on the Battle Station. Clear five boss arenas, learn four powers, and keep the core from going dark.

**Play:** [https://genemagg10.github.io/star-wars-adventure/](https://genemagg10.github.io/star-wars-adventure/)

GitHub Pages serves this repo from the `main` branch, root folder. The play link goes live once that branch has the game.

## Play on your machine

From the repo root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. A local server is the reliable way to run it. The game is plain HTML, CSS, and classic scripts — no install and no build.

## Controls

| Input | Action |
| --- | --- |
| WASD or arrows | Move |
| Space | Melee |
| Q | Use the selected power |
| 1–4 | Select a power |
| E | Interact |
| Esc | Pause |

On a phone, turn sideways. A stick sits on the left. Attack, Power, and Interact sit on the right.

## How a run goes

1. Title, then pick Lucan, Rae, or Chewoo.
2. Pick a saber color: blue, green, purple, yellow, white, or orange.
3. Docking Ring — white troopers.
4. Chrome Hangar — defeat the Chrome Captain to learn **Force Push**. An optional chase lane is open here.
5. Shadow Conduit — defeat the Shadow Seeker to learn **Saber Throw**.
6. Throne Gallery — defeat the Dark Lord. **Little One** joins. No power from this fight.
7. Trash Compactor — open the salvage chest to learn **Rock Toss**. A side hatch hides a Chewoo-bot sticker.
8. Fallen Deck — defeat the Fallen Knight to learn **Lightning**.
9. Core Gate — the Hooded Master stays sealed until you hold all four powers. Win, and the card reads **Part Two coming soon!**

The one real chase lane is the hangar launch: steer a twin-engine fighter and shoot snub fighters for 30 seconds. The later lanes are sealed.

Power keys stay fixed:

1. Force Push
2. Saber Throw
3. Lightning
4. Rock Toss

Rock Toss is the mid-game salvage chest in the Trash Compactor, after the Dark Lord and before the Fallen Knight. That fills the gap where Little One joins and no power drops. If that chest cannot be reached, the Fallen Knight grants Rock Toss along with Lightning.

Little One has no heart of their own. They follow and, on a long cooldown, echo your last power weakly. The Chewoo-bot behind the trash hatch is a sticker achievement only.

Pause → Save stores progress in `localStorage` under `starStationAdventure.save.slot1`. Continue returns you to the current deck entrance with powers, Little One, and achievements kept. Foes on that deck respawn if the boss is still standing.

## Soft-alias map

Player-facing names are the ones in the game. This table is the only place the familiar names appear.

| In the game | Familiar name |
| --- | --- |
| Lucan | Luke |
| Rae | Rey |
| Chewoo | Chewbacca |
| Little One | Baby Yoda |
| Battle Station | Death Star (the feel of the setting) |
| White troopers / station guards | the station's white-armored guards |
| Twin-engine fighter | the hero's chase ship |
| Snub fighter | the opposing chase ship |
| Chrome Captain | first boss |
| Shadow Seeker | second boss |
| Dark Lord | third boss (companion, no power) |
| Fallen Knight | fourth boss (Kylo) |
| Hooded Master | final boss |

## Heroes

- **Lucan** — longer reach. Hope Strike mends a heart when it lands.
- **Rae** — faster. Staff Spin hits every foe around you.
- **Chewoo** — more hearts. Bowcaster Blast reaches across the deck.
