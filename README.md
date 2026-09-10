# AR Pong

A classic **Pong** game built with **React + TypeScript + Vite**, rendered on a full-viewport HTML5 `<canvas>`. It's designed as a **multiplayer** game, but as it's currently a work in progress (WIP), the left paddle is driven by a CPU AI for now.

> This is a monorepo managed with **npm workspaces**. The game lives in the `frontend/` workspace.

## How the Game Works

### Game Loop (`frontend/src/App.tsx`)

- The game runs inside a `useEffect` that sets up event listeners and starts a `requestAnimationFrame` loop.
- Each frame:
  1. `updateGame` advances the physics (input → paddle → ball → collisions).
  2. `drawGame` clears and redraws the canvas.
  3. `requestAnimationFrame` schedules the next frame.
- The effect also registers `resize` / `orientationchange` listeners (to keep the canvas full-viewport) and pointer listeners for input, and cleans everything up on unmount.

### Player Input (WIP)

- Multiplayer input is **not implemented yet** — the left paddle is currently driven by the CPU AI.
- The pointer listeners (`pointerdown` / `pointermove` / `pointerup`) and the `leftPaddleYRef` are still in place as scaffolding for the future player-controlled paddle.

### Physics (`frontend/src/helpers/engine.ts`)

- The whole game is described by a single `GameState` object (ball position/velocity, paddle positions, score, `isGameOver`, `cpuErrorOffset`).
- The ball moves using a **normalized velocity vector** scaled by `PHYSICS_CONFIG.BALL.INITIAL_SPEED`.
- **Left paddle collision:** the bounce angle depends on where the ball hits the paddle; speed is capped at `MAX_SPEED` and slightly increased by `BOUNCE_FACTOR_PADDLE` (1.05).
- **Wall bounce:** top/bottom walls reflect the vertical velocity.
- **Round end:** if the ball fully crosses either side, `isGameOver` is set to `true` and a new CPU error offset is rolled. _(Note: the score is drawn but never incremented, and the game freezes after the first point — there is no restart logic yet.)_
- **Right paddle collision:** mirror of the left paddle logic.
- **Speed clamp:** a final guard scales the velocity vector back down if it ever exceeds `MAX_SPEED` (prevents tunneling / runaway speed).

### CPU AI (`frontend/src/helpers/computer.ts`)

- Both paddles are driven by the CPU AI for now (multiplayer is WIP). The paddle logic is a **pure function** `updateCpuPaddle` that returns the next Y position.
- It only chases the ball while it moves toward the CPU (`horizontalVelocity > 0`), otherwise drifts back to the vertical center.
- It predicts the ball's Y at the moment it reaches the paddle (time-to-arrival), folding top/bottom wall bounces.
- It reacts only within a `REACTION_DELAY` window, applies a stable aiming error (`randomCpuErrorOffset`), and interpolates smoothly toward the target capped at `MAX_SPEED` per frame.

### Rendering (`frontend/src/helpers/canvas.ts`)

- `resizeCanvas` keeps the canvas sized to the viewport (and sets a dark background `#2C2C2E`).
- `drawGame` clears and redraws each frame:
  - the **dashed center line** (classic Pong look),
  - the **score** in a retro pixel font (_Press Start 2P_) at the top center,
  - the **ball** as a filled circle,
  - the **left paddle** at `x = 0`,
  - the **right paddle** at `x = canvas.width - PADDLE_WIDTH`.

## Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| UI        | React 19 + TypeScript           |
| Build     | Vite                            |
| Rendering | HTML5 Canvas 2D API             |
| Styling   | CSS (`App.css`) + inline styles |

## Folder Structure

```
ar-pong/
├── frontend/                    # React + Vite game
│   └── src/
│       ├── App.tsx              # Main component: game loop, input, state
│       ├── App.css              # Global styles
│       ├── main.tsx             # React entry point
│       ├── components/
│       │   └── Scoreboard.tsx   # (unused — the score is drawn on canvas)
│       ├── constants/
│       │   └── index.ts         # Physics & paddle constants
│       └── helpers/
│           ├── canvas.ts        # Canvas sizing + drawing (field, score)
│           ├── computer.ts      # CPU AI for the right paddle
│           └── engine.ts        # Core game state + physics update
├── implementation-plan.md       # Original engine implementation plan
├── opencode.json                # OpenCode model config
└── package.json                 # npm workspaces root
```

## How to Run

From the repository root:

```bash
npm install
npm run dev:frontend
```

Or from the `frontend/` folder directly:

```bash
cd frontend
npm install
npm run dev
```

Then open the local URL Vite prints (e.g. `http://localhost:5173`) and watch the two CPU paddles play against each other.
