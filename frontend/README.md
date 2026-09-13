# AR Pong — Frontend

A classic **Pong** game built with **React + TypeScript + Vite**, rendered on an HTML5 `<canvas>`. The player controls the left paddle by dragging on the screen, while the right paddle is driven by a CPU AI.

## Project Summary

- **Player 1 (left paddle):** controlled by the user via pointer/touch input (drag anywhere on the canvas).
- **Player 2 (right paddle):** controlled by a CPU AI that predicts the ball's trajectory, reacts with a delay, and plays with a small, stable aiming error so it stays beatable.
- **Rendering:** everything is drawn each frame on a full-viewport `<canvas>` using the 2D context.
- **Game loop:** a `requestAnimationFrame` loop that alternates between updating the physics (`updateGame`) and drawing the scene (`drawGame`).

### Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| UI        | React 19 + TypeScript           |
| Build     | Vite                            |
| Rendering | HTML5 Canvas 2D API             |
| Styling   | CSS (`App.css`) + inline styles |

### Folder Structure

```
frontend/
└── src/
    ├── App.tsx                  # Main component: game loop, input, state
    ├── App.css                  # Global styles
    ├── main.tsx                 # React entry point
    ├── components/
    │   └── Scoreboard.tsx       # (unused — the score is drawn on canvas)
    ├── constants/
    │   └── index.ts             # Physics & paddle constants
    └── helpers/
        ├── canvas.ts            # Canvas sizing + drawing (field, score)
        ├── computer.ts          # CPU AI for the right paddle
        └── engine.ts            # Core game state + physics update
```

---

## Core App Logic

### 1. Game State (`helpers/engine.ts`)

The whole game is described by a single `GameState` object:

```ts
export type GameState = {
  ball: {
    xPosition: number
    yPosition: number
    verticalVelocity: number
    horizontalVelocity: number
  }
  paddles: { left: { yPosition: number }; right: { yPosition: number } }
  score: { player1: number; player2: number }
  isGameOver: boolean
  cpuErrorOffset: number
}
```

- The **ball** stores a position plus a **normalized velocity vector** (direction only). Actual speed comes from `PHYSICS_CONFIG.BALL.INITIAL_SPEED`.
- `cpuErrorOffset` is a stable aiming error regenerated at the start of each rally (see CPU AI below).
- `App.tsx` builds the initial state with a **random starting direction** for the ball:

```ts
const createInitialGameState = (): GameState => ({
  ...initialGameState,
  ball: {
    xPosition: 0,
    yPosition: 50 + PADDLE_HEIGHT / 2,
    verticalVelocity:
      (Math.random() > 0.5 ? 1 : -1) * PHYSICS_CONFIG.BALL.INITIAL_SPEED,
    horizontalVelocity:
      (Math.random() > 0.5 ? 1 : -1) * PHYSICS_CONFIG.BALL.INITIAL_SPEED,
  },
})
```

### 2. The Game Loop (`App.tsx`)

The game runs inside a `useEffect` that sets up listeners and starts an animation loop:

```ts
const animate = () => {
  updateGame({
    gameState: gameState.current,
    input: leftPaddleYRef.current,
  })
  drawGame({
    gameState: gameState.current,
    canvasRef: canvasRef,
  })

  animationFrame = requestAnimationFrame(animate)
}
animationFrame = requestAnimationFrame(animate)
```

Each frame:

1. `updateGame` advances the physics (input → paddle → ball → collisions).
2. `drawGame` clears and redraws the canvas.
3. `requestAnimationFrame` schedules the next frame.

The effect also registers `resize` / `orientationchange` listeners (to keep the canvas full-viewport) and pointer listeners for input, and cleans everything up on unmount.

### 3. Player Input (`App.tsx`)

The left paddle follows the pointer while dragging:

```ts
const handleUserInput = (ev: PointerEvent) => {
  const canvas = canvasRef.current
  if (!canvas) return

  const canvasBounds = canvas.getBoundingClientRect()
  leftPaddleYRef.current = clamp(
    ev.clientY - canvasBounds.top - PADDLE_HEIGHT / 2,
    0,
    canvas.height - PADDLE_HEIGHT,
  )
}
```

- `pointerdown` starts dragging, `pointermove` updates the paddle while dragging, `pointerup` stops.
- The Y position is **clamped** so the paddle never leaves the canvas.
- The value is stored in a ref (`leftPaddleYRef`) so the game loop can read it without re-rendering React.

### 4. Physics Update (`updateGame` in `helpers/engine.ts`)

This is the heart of the game. Order of operations each frame:

1. **Apply player input** to the left paddle (clamped to the canvas).
2. **Move the CPU paddle** — only when the ball is traveling toward it (`horizontalVelocity > 0`).
3. **Move the ball** using the physics speed:

```ts
ball.xPosition += ball.horizontalVelocity * BALL.INITIAL_SPEED
ball.yPosition += ball.verticalVelocity * BALL.INITIAL_SPEED
```

4. **Left paddle collision** — when the ball is moving left and overlaps the paddle, the bounce angle depends on **where the ball hit the paddle**:

```ts
const hitPosition =
  (ball.yPosition + BALL_SIZE / 2 - (leftPaddleY + PADDLE_HEIGHT / 2)) /
  (PADDLE_HEIGHT / 2)
const speed = Math.min(
  PHYSICS_CONFIG.BALL.MAX_SPEED,
  Math.hypot(ball.horizontalVelocity, ball.verticalVelocity) *
    PHYSICS_CONFIG.BALL.BOUNCE_FACTOR_PADDLE,
)
const angle = hitPosition * PHYSICS_CONFIG.BALL.ANGLE_SENSITIVITY
ball.horizontalVelocity = Math.cos(angle) * speed
ball.verticalVelocity = Math.sin(angle) * speed
```

- Hitting the **center** sends the ball straight back; hitting near the **edges** adds a steep angle.
- Speed is capped at `MAX_SPEED` and slightly increased by `BOUNCE_FACTOR_PADDLE` (1.05) to speed rallies up.

5. **Wall bounce** — top/bottom walls reflect the vertical velocity:

```ts
if (ball.yPosition <= 0 || ball.yPosition + BALL_SIZE >= canvasHeight) {
  ball.verticalVelocity =
    -ball.verticalVelocity * PHYSICS_CONFIG.BALL.BOUNCE_FACTOR_WALL
  ball.yPosition = ball.yPosition < 0 ? 0 : canvasHeight - BALL_SIZE
}
```

6. **Round end** — if the ball fully crosses either side, the round is over and a new CPU error offset is rolled:

```ts
if (ball.xPosition + BALL_SIZE < 0 || ball.xPosition > canvasWidth) {
  gameState.isGameOver = true
  gameState.cpuErrorOffset = randomCpuErrorOffset()
  return
}
```

7. **Right paddle collision** — mirror of the left paddle logic (velocity flips sign, ball is repositioned to the paddle face).

8. **Speed clamp** — a final guard that scales the velocity vector back down if it ever exceeds `MAX_SPEED` (prevents tunneling / runaway speed).

### 5. CPU AI (`helpers/computer.ts`)

The right paddle is a **pure function** `updateCpuPaddle` that returns the next Y position. Its behavior is tuned by `CPU_CONFIG`:

```ts
export const CPU_CONFIG = {
  REACTION_DELAY: 30, // frames before impact at which the CPU reacts
  IMPERFECTION_FACTOR: 0.2, // ±20% of paddle height aiming error
  INTERPOLATION: 0.25, // lerp factor toward the target
  MAX_SPEED: 7, // max paddle travel per frame (slower than player)
} as const
```

The algorithm:

1. **Idle behavior:** if the ball is moving away (`horizontalVelocity <= 0`), the CPU drifts back to the vertical center.
2. **Time-to-arrival prediction:** it computes how many frames until the ball reaches the paddle plane:

```ts
const paddleX = canvasWidth - PADDLE_WIDTH - BALL_SIZE
const framesToPaddle = (paddleX - ball.xPosition) / ball.horizontalVelocity
```

3. **Reaction window:** it only reacts when the ball is within `REACTION_DELAY` frames of arrival.
4. **Wall folding:** `foldWithWalls` predicts the ball's Y at arrival, folding top/bottom bounces into a linear position:

```ts
const foldWithWalls = (y: number, canvasHeight: number): number => {
  const max = canvasHeight - BALL_SIZE
  if (max <= 0) return 0
  const range = max * 2
  let folded = ((y % range) + range) % range
  if (folded > max) folded = range - folded
  return folded
}
```

5. **Imperfection:** a stable `errorOffset` (from `randomCpuErrorOffset`) is added so the CPU misses sometimes.
6. **Smooth movement:** the paddle lerps toward the target, capped at `MAX_SPEED` per frame:

```ts
const delta = (targetY - paddleY) * INTERPOLATION
const cappedDelta = clamp(delta, -MAX_SPEED, MAX_SPEED)
return clamp(paddleY + cappedDelta, 0, canvasHeight - PADDLE_HEIGHT)
```

### 6. Canvas Rendering (`helpers/canvas.ts`)

- `resizeCanvas` keeps the canvas sized to the viewport (and sets a dark background `#2C2C2E`).
- `drawGame` clears the canvas and draws, each frame:
  - the **dashed center line** (classic Pong look),
  - the **score** in a retro pixel font (*Press Start 2P*) at the top center,
  - the **ball** as a filled circle (`arc`),
  - the **left paddle** (green `#4ade80`) at `x = 0`,
  - the **right paddle** at `x = canvas.width - PADDLE_WIDTH`.
- `getCanvasSize` / `getViewportSize` return the canvas dimensions used by the physics engine.

### 7. Physics Constants (`constants/index.ts`)

```ts
export const PADDLE_WIDTH = 4
export const PADDLE_HEIGHT = 25
export const BALL_SIZE = 4

export const PHYSICS_CONFIG = {
  BALL: {
    INITIAL_SPEED: 1, // base speed multiplier
    MAX_SPEED: 6, // speed cap
    SPEED_INCREMENT: 0.15, // (reserved for future speed-up)
    BOUNCE_FACTOR_PADDLE: 1.05, // speed gain per paddle hit
    BOUNCE_FACTOR_WALL: 1.0, // wall bounce keeps speed
    ANGLE_SENSITIVITY: 0.6, // how much hit position affects angle
  },
  PADDLE: {
    SPEED: 9,
  },
}
```

These values are the single source of truth for gameplay feel — tweak them here to change difficulty, ball speed, or bounce behavior.

---

## How to Run

From the repository root (npm workspaces):

```bash
npm install
npm run dev:frontend
```

Or from this folder directly:

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (e.g. `http://localhost:5173`), and drag on the canvas to move the left paddle.
