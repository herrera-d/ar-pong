import { BALL_SIZE, PADDLE_HEIGHT, PADDLE_WIDTH } from "../constants"

export const CPU_CONFIG = {
  /** Frames before impact at which the CPU starts reacting to the ball. */
  REACTION_DELAY: 30,
  /** Aiming error per rally: ±20% of the paddle height. */
  IMPERFECTION_FACTOR: 0.2,
  /** Lerp factor (0..1) for smooth paddle movement toward the target. */
  INTERPOLATION: 0.25,
  /** Max paddle travel per frame; slightly slower than the player keeps the CPU beatable. */
  MAX_SPEED: 7,
} as const

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * Folds a linear Y position into [0, canvasHeight - BALL_SIZE],
 * simulating bounces off the top and bottom walls.
 */
const foldWithWalls = (y: number, canvasHeight: number): number => {
  const max = canvasHeight - BALL_SIZE
  if (max <= 0) return 0
  const range = max * 2
  let folded = ((y % range) + range) % range
  if (folded > max) folded = range - folded
  return folded
}

/** Stable aiming error for the current rally (±IMPERFECTION_FACTOR of the paddle height). */
export const randomCpuErrorOffset = (): number =>
  (Math.random() - 0.5) * 2 * CPU_CONFIG.IMPERFECTION_FACTOR * PADDLE_HEIGHT

export interface CpuBallState {
  xPosition: number
  yPosition: number
  verticalVelocity: number
  horizontalVelocity: number
}

/**
 * Pure CPU AI: computes the next Y position for the right paddle.
 *
 * - Only chases the ball while it moves toward the CPU (horizontalVelocity > 0),
 *   otherwise drifts back to the vertical center.
 * - Predicts the ball's Y at the moment it reaches the paddle (time-to-arrival),
 *   folding top/bottom wall bounces.
 * - Waits until the ball enters the REACTION_DELAY window before reacting.
 * - Applies a stable imperfection offset for realistic gameplay.
 * - Interpolates smoothly toward the target, capped at MAX_SPEED per frame.
 */
export const updateCpuPaddle = ({
  ball,
  paddleY,
  canvasWidth,
  canvasHeight,
  errorOffset,
}: {
  ball: CpuBallState
  paddleY: number
  canvasWidth: number
  canvasHeight: number
  errorOffset: number
}): number => {
  const { REACTION_DELAY, INTERPOLATION, MAX_SPEED } = CPU_CONFIG
  const centerY = canvasHeight / 2 - PADDLE_HEIGHT / 2

  let targetY = centerY

  if (ball.horizontalVelocity > 0) {
    const paddleX = canvasWidth - PADDLE_WIDTH - BALL_SIZE
    const framesToPaddle = (paddleX - ball.xPosition) / ball.horizontalVelocity

    if (framesToPaddle >= 0 && framesToPaddle <= REACTION_DELAY) {
      const predictedY = ball.yPosition + ball.verticalVelocity * framesToPaddle
      targetY =
        foldWithWalls(predictedY, canvasHeight) +
        BALL_SIZE / 2 -
        PADDLE_HEIGHT / 2 +
        errorOffset
    }
  }

  targetY = clamp(targetY, 0, canvasHeight - PADDLE_HEIGHT)

  const delta = (targetY - paddleY) * INTERPOLATION
  const cappedDelta = clamp(delta, -MAX_SPEED, MAX_SPEED)

  return clamp(paddleY + cappedDelta, 0, canvasHeight - PADDLE_HEIGHT)
}
