# Implementation Plan: Pong Physics & Engine

This document outlines the plan for implementing a robust, decoupled physics engine for the Pong game. We will follow the **Engine Pattern** to separate game logic from rendering.

## 🏗 Architecture Overview
We will move away from mixed logic/rendering in the canvas helpers and move towards a pure physics engine.
- **State**: Managed by the physics engine (ball position, velocity, paddle positions, scores).
- **Logic**: `src/physics/engine.ts` handles all movement and collisions.
- **Rendering**: `src/canvas/canvas.ts` only draws the state provided to it.

## 🚀 Phases

### Phase 1: Core Movement & Boundaries
Implement the basic movement of the ball and collision with the walls.
- **Ball State**: `{ x, y, vx, vy }`
- **Update Logic**:
  - `x += vx`
  - `y += vy`
  - Check if `y` hits top or bottom boundaries -> reverse `vy`.
- **Example**:
  ```typescript
  // engine.ts
  function updateBall(ball: BallState) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    if (ball.y <= 0 || ball.y >= height) {
      ball.vy *= -1;
    }
  }
  ```

### Phase 2: Paddle Interaction
Implement collisions between the ball and the paddles.
- **Collision Detection**: Check if the ball's bounding box overlaps with the paddle's bounding box.
- **Reflection**: Reverse `vx` and apply `BOUNCE_FACTOR_PADDLE`.
- **Angle Variation**: Calculate the bounce angle based on the distance from the center of the paddle.
- **Example**:
  ```typescript
  // engine.ts
  function handlePaddleCollision(ball: BallState, paddle: PaddleState) {
    if (checkCollision(ball, paddle)) {
      ball.vx *= -1 * BOUNCE_FACTOR_PADDLE;
      // Add "spin" based on hit location
      const relativeHitPoint = (ball.y - paddle.y) / paddle.height;
      ball.vy += (relativeHitPoint - 0.5) * MAX_SPIN;
    }
  }
  ```

### Phase 3: Mobile & Input Integration
Adapt the input handling for touch devices.
- **Input Mapping**: Map touch coordinates to paddle Y positions.
- **Smoothness**: Use interpolation or velocity to make paddle movement feel fluid on mobile.
- **Drag and Drop**: The paddle should follow the user's touch point on the Y-axis.

### Phase 4: Optimization & Networking
- Implement `MAX_BALL_SPEED` to ensure the game remains playable.
- Prepare the state for synchronization (serialization of `BallState` and `PaddleState`).

## 🛠 Constants & Configuration
We will use a centralized constants file: `src/physics/constants.ts`.
- `BOUNCE_FACTOR_PADDLE`: 1.05 (slight speed increase on hit).
- `BOUNCE_FACTOR_WALL`: 1.0 (perfect reflection).
- `INITIAL_BALL_SPEED`: Base speed of the ball.
- `MAX_BALL_SPEED`: Speed cap.
