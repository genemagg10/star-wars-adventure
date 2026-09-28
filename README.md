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

## Touch

Turn the phone sideways. A stick sits on the left. Attack and Power sit on the right.

- A strip of **four gems** stays on screen while you walk a deck. Only powers you own light up. Dark gems are locked.
- Tap a lit gem **1–4** to select that power. Hold **Power** to cycle to the next unlocked power. A short tap on **Power** uses the lit one. The newest power still selects itself when you learn it.
- The same four gems sit on the canvas under the objective. The lit gem grows, and a ring fills in while that power cools down.
- **Interact** stays dim until you stand beside a door, chest, hatch, or exit. It then names that thing (Chest, Hatch, Leave).
- **Pause** is on the screen. Phone play does not need Esc.
- **Mute** is on the title screen and in the pause menu. The choice is stored beside the save as `starStationAdventure.mute`. The phone stays quiet until the first tap. Begin already unlocks sound; Mute is how you turn it back off.
- In the Hangar Run, Attack fires the X-wing. Power, once you have Force Push, shoves nearby TIE shots away.

Lightsaber colors are blue, green, purple, yellow, white, and orange. Hearts are green. The objective chip is one line. The saber gem sits at the right, and Grogu's face joins it after Darth Vader.

## How a run goes

1. Title, then pick Luke Skywalker, Rey, or Chewbacca.
2. Pick a lightsaber color.
3. Docking Ring — stormtroopers.
4. Phasma Hangar — defeat Captain Phasma to learn **Force Push**. The Hangar Run is the one playable chase: steer an X-wing, shoot TIE fighters, and break through.
5. Inquisitor Conduit — defeat the Inquisitor to learn **Saber Throw**. The later chase card stays sealed. The TIE fighters do not launch.
6. Throne Gallery — defeat Darth Vader. **Grogu** (Baby Yoda) joins. No Force power from this fight.
7. Trash Compactor — open the salvage chest to learn **Rock Toss**. A side hatch hides a Chewbacca-bot sticker.
8. Kylo Deck — defeat Kylo Ren to learn **Lightning**.
9. Core Gate — the Emperor stays sealed until you hold all four Force powers. Win, and the card reads **Part Two coming soon!**

Only the Phasma Hangar chase is playable. You can skip it and stay on the Death Star. It ends when the timer clears or the X-wing is shot down. Later “lane sealed” cards stay sealed.

Force power keys stay fixed:

1. Force Push — Captain Phasma
2. Saber Throw — the Inquisitor
3. Lightning — Kylo Ren
4. Rock Toss — the salvage chest between Darth Vader and Kylo Ren

Rock Toss is the mid-game salvage chest in the Trash Compactor, after Darth Vader and before Kylo Ren. That fills the gap where Grogu joins and no Force power drops. If that chest cannot be reached, Kylo Ren grants Rock Toss along with Lightning.

Grogu has no heart of their own. They follow and, on a long cooldown, echo your last Force power weakly. The Chewbacca-bot behind the trash hatch is a sticker achievement only.

The game writes `localStorage` under `starStationAdventure.save.slot1` when you enter a deck and again after a reward, and Pause → Save does the same. Continue returns you to that deck entrance with Force powers, Grogu, and achievements kept. Foes on that deck respawn if the boss is still standing. The hatch and your exact spot in a fight are not stored. Mute is a separate key, `starStationAdventure.mute`, beside the save.

## Heroes

- **Luke Skywalker** — longer reach. Hope Strike mends a heart when it lands.
- **Rey** — quicker steps. Staff Spin hits every foe around you.
- **Chewbacca** — more hearts. Bowcaster Blast reaches across the deck.
