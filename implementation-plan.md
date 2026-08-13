# Implementation Plan: Pong Game Physics

This document outlines the physics engine implementation for the multiplayer Pong game. The goal is to create a responsive, predictable, and fun experience for both local and online play.

## 1. Game Constants and Configuration

We will define a set of constants to tune the "feel" of the game without modifying the core logic.

| Constant | Description | Default Value |
| :--- | :--- | :--- |
| `INITIAL_BALL_SPEED` | The starting velocity of the ball. | `5` |
| `MAX_BALL_SPEED` | The maximum speed a ball can reach. | `15` |
| `PADDLE_SPEED` | The maximum speed a paddle can move. | `8` |
| `BALL_BOUNCE_FACTOR` | Multiplier applied to velocity when hitting a wall (vertical). | `1` |
| `BALL_BOUNCE_FACTOR_PADDLE` | Multiplier when hitting a paddle (allows for speed variation). | `1.1` |
| `FRICTION` | Slight reduction in speed over time (optional). | `0.999` |

## 2. Ball Mechanics

The ball is the primary moving object. Its state will be managed by its position (`x`, `y`) and its velocity vector (`vx`, `vy`).

### Movement
In every frame, the ball's position is updated based on its velocity:
`position.x += velocity.x`
`position.y += velocity.y`

### Wall Collisions
- **Top/Bottom Walls**: When the ball hits the top or bottom edge, the vertical velocity is inverted.
  - *Example*: If `ball.y` exceeds the canvas height, `velocity.y = -velocity.y * BALL_BOUNCE_FACTOR`.
- **Side Walls (Scoring)**: When the ball hits the left or right edge, a point is awarded, and the ball is reset.

### Paddle Collisions
Collision detection between the ball and a paddle will be treated as an AABB (Axis-Aligned Bounding Box) intersection.

**Example Logic:**
```typescript
function resolvePaddleCollision(ball, paddle) {
  if (isIntersecting(ball, paddle)) {
    // Invert horizontal velocity
    ball.vx *= -1;
    
    // Add "spin" or "angle" based on where it hits the paddle
    // If it hits the edge of the paddle, it should fly off at a sharper angle
    const hitPoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    ball.vy = hitPoint * MAX_BALL_SPEED;

    // Increase speed slightly
    ball.vx *= BALL_BOUNCE_FACTOR_PADDLE;
  }
}
```

## 3. Paddle Mechanics

Paddles move along the Y-axis. Their movement should be constrained by the canvas boundaries and their own dimensions.

### Movement Logic
The paddle position is updated based on user input (pointer/keyboard). To prevent "teleporting", we use a velocity-based movement with clamping.

**Example Logic:**
```typescript
function updatePaddle(paddle, direction) {
  const speed = direction > 0 ? PADDLE_SPEED : -PADDLE_SPEED;
  
  // New position calculation
  let newY = paddle.y + speed;

  // Boundary Clamping
  if (newY < 0) newY = 0;
  if (newY + paddle.height > canvas.height) newY = canvas.height - paddle.height;

  paddle.y = newY;
}
```

## 4. Scoring and Reset

When the ball passes the boundary of a player:
1. Increment the opponent's score.
2. Reset the ball to the center of the canvas.
3. Invert the ball's initial direction (so the person who just lost serves).

**Reset Sequence:**
1. `ball.x = canvas.width / 2`
2. `ball.y = canvas.height / 2`
3. `ball.vx = (initialSpeed * Math.random() > 0.5 ? 1 : -1)`
4. `ball.vy = (initialSpeed * Math.random() > 0.5 ? 1 : -1)`

## 5. Implementation Phases

### Phase 1: Basic Movement & Walls
- Implement ball movement in `canvas.ts`.
- Implement top/bottom wall bouncing.
- Implement scoring when ball hits side boundaries.

### Phase 2: Paddle Interaction
- Implement paddle movement logic.
- Implement AABB collision detection between ball and paddles.
- Implement variable bounce angles based on hit position.

### Phase 3: Polish & Optimization
- Implement speed caps to prevent the ball from becoming unplayable.
- Add "friction" or "drag" if necessary for gameplay feel.
- Integrate with the `useCanvasResize` hook to ensure physics coordinates match CSS dimensions.
