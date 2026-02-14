# Hoiwa Hub 33 (Mac)

A lightweight 3D browser mini-game inspired by your Hoiwa Hub horror prompt:
- Setting: Hung To Road, Kwun Tong, Hong Kong
- Gameplay: fixed-position defense across 5 Days (easy -> hard), each Day ends with a Boss
- Aim: mouse/trackpad with widened horizontal arc plus vertical up/down pointer control
- Weapon: hand-held Jesus crucifix firing one cross ammo per `S` press
- Holy Water: auto-unlock at score `1000`; press `F` for area attack
- Holy Water milestone: every additional 1000 score gives +1 Holy Water charge

## Run on macOS

1. Open Terminal in this project folder.
2. Start a local server:

```bash
python3 -m http.server 8080
```

3. Open your browser to:

```text
http://localhost:8080
```

Use Safari or Chrome. Press `Enter`/`Space` or click `Start` to begin.
If you already had the page open, refresh with `Cmd+Shift+R` to load the latest script.

## Controls

- `Mouse / Trackpad`: aim/look with horizontal + vertical (up/down) pointer control
- `Fixed position`: no movement, defend the spot
- `S` (press): shoot 1 cross projectile (ammo)
- `F`: release Holy Water AOE (when READY)
- Random plane supply drops:
  - HP restore crate
  - +1 Holy Water crate
  - 5-second Jesus protection crate
  - Crates must land first, then need 5 cross hits to open

## Notes

- This is an original mini-game implementation and does not reuse Steam/YouTube assets.
- Ghost style is now Japanese female horror type (stylized original art).
- Normal ghosts require 5 hits to kill.
- Every ghost kill shows vertical red Traditional Chinese New Year smoky greetings for 1 second.
- Removed the road stripe/pyramid visuals to keep a cleaner Hung To Road background.
- Screen shows red danger warning effect when HP is below 20.
- Ghost hits now trigger stronger red hit flash + camera shake.
- Holy Water now affects medium range around player (not full-map), with heavy damage on boss.
- From Day 3 onward, ghosts can perform dodge moves against incoming shots.
- Shooting now uses true 3D projectile arc (horizontal + vertical influence).
- Added built-in game audio:
  - Ambient background music
  - Rhythmic background melody loop
  - Shoot, hit, pickup, dodge, ghost defeat, and holy-water SFX
- Each Day now has weather progression:
  - Day 1: little cloudy
  - Day 2: windy cloudy
  - Day 3: raining
  - Day 4: cloudy + raining
  - Day 5: heavy storm with frequent lightning and snowing
- Boss now flies (hover movement), so vertical aiming matters.
