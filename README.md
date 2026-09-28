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
| WASD or arrows | Move. A quick tap takes a step. Letting go of a walk stops you. |
| Space | Lightsaber swing |
| F or Shift | Hero special (Hope Strike, Staff Spin, or Bowcaster Blast) |
| Q | Use the selected Force power |
| 1–4 | Select a Force power |
| E | Interact |
| Esc | Pause |

## Touch

Turn the phone sideways. A stick sits on the left. Attack, Special, and Power sit on the right.

- Attack, Special, Power, and Interact wear symbols. Special is the gold face: Hope Strike, Staff Spin, or Bowcaster Blast. It dims while that toy is cooling down. Power dims until you own a Force power. Interact dims until something is in reach, then it shows the Force terminal, the salvage chest, the side hatch, the north lock, or a chase pad.
- On a phone, Saber Throw aims at the nearest foe.
- Hold WASD to walk. A quick tap takes a step of its own, then stops. A flick of the stick does the same. Letting go of a long walk stops you.
- A saber-colored chevron sits on the hero and points the way the swing will go. It grows while the blade is out.
- A strip of **four slots** stays on screen while you walk a deck: Push, Throw, Lightning, Rock, the same as keys 1–4. Locked slots stay dim. The lit slot is the one a short tap on Power will use. Hold Power to cycle.
- Tap a lit gem **1–4** to select that power. Hold **Power** to cycle to the next unlocked power. A short tap on **Power** uses the lit one. The newest power still selects itself when you learn it.
- The same four gems sit on the canvas under the objective. The lit gem grows, and a ring fills in while that power cools down.
- **Interact** stays dim until you stand beside a door, chest, hatch, or exit. It then names that thing (Chest, Hatch, Leave).
- **Pause** is on the screen. Phone play does not need Esc.
- **Mute** is on the title screen and in the pause menu. The choice is stored beside the save as `starStationAdventure.mute`. The phone stays quiet until the first tap. Begin already unlocks sound; Mute is how you turn it back off.
- In a chase, Attack fires the X-wing and the special face hides. Power, once you have Force Push, shoves nearby shots away. That is the Hangar Run, Darth Vader's bay, and the trench before the Emperor.
- If the X-wing goes down, the retry card opens at once. Press Space to fly the lane again. The same Space retry covers a downed deck, and the card says to jump back in. Pause cannot sit on that card and hide it.
- On the Docking Ring, before Force Push, the Interact face pulses and reads Learn Force Push. The blue terminal glows the same words.

Lightsaber colors are blue, green, purple, yellow, white, and orange. Hearts are green. The objective chip is one line. The saber gem sits at the right, and Grogu's face joins it after Darth Vader.

## How a run goes

1. Title, then pick Luke Skywalker, Rey, or Chewbacca.
2. Pick a lightsaber color.
3. Docking Ring — a blue terminal just north of the landing teaches **Force Push**. It glows, and the Interact face reads **Learn Force Push**. Walk up to it, or press Interact. One slower stormtrooper stays off that terminal until you take the north lock into the Phasma Hangar, including after Force Push and after a retry. That stormtrooper does not shoot until Force Push is learned. Then you can shove them and cut them down. The north lock stays shut until Force Push is learned. If you press Interact at that lock first, it points you back to the blue terminal. The north lock plays a two-line crawl. Tap or Space skips it.
4. Phasma Hangar — one stormtrooper stands with Captain Phasma. A gold plate at the top reads her name and hit points, and a thicker bar sits over her. Her first walk is slower, her first lane stays up longer, and her first rush is easier to step off. After that she fights as before. If you already learned Force Push, her card confirms it. The Hangar Run is a real chase: steer an X-wing, shoot TIE fighters, and break through. You can skip it. If the lane fails, press Space to retry. If a fight downs you, the card says to press Space and jump back in. Moving on plays the next crawl.
5. Inquisitor Conduit — defeat the Inquisitor to learn **Saber Throw**. A crawl plays on the way in.
6. Throne Gallery — defeat Darth Vader. **Grogu** (Baby Yoda) joins. No Force power from this fight. Vader paints an orange tether, then a short tug. The tug only hurts if you are still in his reach, and he leaves a long gap afterward. Vader's bay is a second chase: slower shuttles in two columns. You can skip it. A crawl plays on the way in.
7. Trash Compactor — open the salvage chest to learn **Rock Toss**. A side hatch hides a Chewbacca-bot. The first time you take the sticker, the Chewbacca-bot wakes and dances once. It does not fight. A crawl plays on the way in.
8. Kylo Deck — defeat Kylo Ren to learn **Lightning**. He paints a gold cross, then a short lunge and a slower bolt, with a longer gap between them. A crawl plays on the way in.
9. Core Gate — a crawl plays on the way in. Fly the trench (towers on the walls, debris in the slot) or walk in. The Emperor waits until you hold all four Force powers. Win, and the card shows your hero, your lightsaber color, Grogu hopping if they joined, your clear time, **Part Two coming soon!**, and a New Game+ note. The saber prism remembers that lightsaber color on the next color pick.

Each deck has its own accent from the palette: blue, gold, purple, orange, green, lavender, then white at the core. Filled hearts glow green. Danger stays orange, and only on hazards. Corridors keep a round viewport, a blue-and-gold floor strip, and a pipe. Troopers march in step until they spot you. The Phasma Hangar opens on runway stripes and a parked fighter. The Trash Compactor floats a few pieces of junk over the sludge. Chewbacca stands a little taller than Luke Skywalker and Rey.

The three flights share one chase. A lane only changes how long it lasts, how crowded it is, what shows up, and how the background looks. The hangar is a striped bay with wing-marked fighters and doors that part when you break through. Vader's bay is gantries and wide shuttles. The trench is wall towers, a glowing slot, and debris. You clear one by lasting until the timer ends. The hangar win throws gold confetti and the chip reads **You made it!**

Force power keys stay fixed:

1. Force Push — the Docking Ring terminal. The north lock stays shut until you learn it. Captain Phasma confirms it.
2. Saber Throw — the Inquisitor
3. Lightning — Kylo Ren
4. Rock Toss — the salvage chest between Darth Vader and Kylo Ren

Rock Toss is the mid-game salvage chest in the Trash Compactor, after Darth Vader and before Kylo Ren. That fills the gap where Grogu joins and no Force power drops. If that chest cannot be reached, Kylo Ren grants Rock Toss along with Lightning.

Grogu has no heart of their own. They follow and, on a long cooldown, echo your last Force power. The echo is a thick gold beam, expanding rings, and a spark on the foe. When a boss falls and Grogu is already with you, they hop high and throw confetti. The Chewbacca-bot behind the trash hatch dances once when you first take the sticker, then it is an achievement only. It never joins the fight.

Each step from one deck to the next plays two crawl lines. Tap, or press Space, to skip. The clear-time clock runs while you walk or fly, and it pauses on cards, crawls, and the pause menu. The win card shows that time. Play again, and the color you won with wears a prism mark.

The game writes `localStorage` under `starStationAdventure.save.slot1` when you enter a deck and again after a reward, and Pause → Save does the same. Continue returns you to that deck entrance with Force powers, Grogu, and achievements kept. Foes on that deck respawn if the boss is still standing. The hatch and your exact spot in a fight are not stored. Mute is a separate key, `starStationAdventure.mute`, beside the save.

## Heroes

Space is a basic lightsaber swing for every hero. F or Shift, or the gold special face, fires the charged toy. It cools down before it can fire again.

- **Luke Skywalker** — longer reach. Hope Strike lunges, and a hit mends a heart.
- **Rey** — quicker steps. Staff Spin hits every foe around you.
- **Chewbacca** — more hearts, and a slightly taller silhouette. Bowcaster Blast reaches across the deck.
