# Star Wars Adventure — by Jordan

A short top-down adventure on the Death Star. Clear five boss arenas, learn four Force powers, and keep the core from going dark.

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
| Space | Lightsaber |
| Q | Use the selected Force power |
| 1–4 | Select a Force power |
| E | Interact |
| Esc | Pause |

On a phone, turn sideways. A stick sits on the left. Attack, Power, and Interact sit on the right.

Lightsaber colors are blue, green, purple, yellow, white, and orange.

## How a run goes

1. Title, then pick Luke Skywalker, Rey, or Chewbacca.
2. Pick a lightsaber color.
3. Docking Ring — stormtroopers.
4. Phasma Hangar — defeat Captain Phasma to learn **Force Push**. An optional chase lane is open here.
5. Inquisitor Conduit — defeat the Inquisitor to learn **Saber Throw**.
6. Throne Gallery — defeat Darth Vader. **Grogu** (Baby Yoda) joins. No Force power from this fight.
7. Trash Compactor — open the salvage chest to learn **Rock Toss**. A side hatch hides a Chewbacca-bot sticker.
8. Kylo Deck — defeat Kylo Ren to learn **Lightning**.
9. Core Gate — the Emperor stays sealed until you hold all four Force powers. Win, and the card reads **Part Two coming soon!**

The one real chase lane is the hangar launch: steer an X-wing and shoot TIE fighters for 30 seconds. The later lanes are sealed.

Force power keys stay fixed:

1. Force Push — Captain Phasma
2. Saber Throw — the Inquisitor
3. Lightning — Kylo Ren
4. Rock Toss — the salvage chest between Darth Vader and Kylo Ren

Rock Toss is the mid-game salvage chest in the Trash Compactor, after Darth Vader and before Kylo Ren. That fills the gap where Grogu joins and no Force power drops. If that chest cannot be reached, Kylo Ren grants Rock Toss along with Lightning.

Grogu has no heart of their own. They follow and, on a long cooldown, echo your last Force power weakly. The Chewbacca-bot behind the trash hatch is a sticker achievement only.

Pause → Save stores progress in `localStorage` under `starStationAdventure.save.slot1`. Continue returns you to the current deck entrance with Force powers, Grogu, and achievements kept. Foes on that deck respawn if the boss is still standing.

## Heroes

- **Luke Skywalker** — longer reach. Hope Strike mends a heart when it lands.
- **Rey** — quicker steps. Staff Spin hits every foe around you.
- **Chewbacca** — more hearts. Bowcaster Blast reaches across the deck.
