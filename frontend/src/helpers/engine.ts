import { getCanvasSize } from "./canvas"
import {
  BALL_SIZE,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PHYSICS_CONFIG,
} from "../constants"
import { updateCpuPaddle, randomCpuErrorOffset } from "./computer"

export type GameState = {
  // ...existing code...

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

export const initialGameState: GameState = {
  ball: {
    xPosition: 0,
    yPosition: 0,
    verticalVelocity: 0,
    horizontalVelocity: 0,
  },
  paddles: { left: { yPosition: 0 }, right: { yPosition: 0 } },
  score: { player1: 0, player2: 0 },
  isGameOver: false,
  cpuErrorOffset: 0,
}

export const updateGame = ({
  gameState,
  input,
}: {
  gameState: GameState
  input: number | null
}) => {
  if (gameState.isGameOver) return

  const { ball, paddles } = gameState
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize()
  const { BALL } = PHYSICS_CONFIG

  if (input !== null) {
    paddles.left.yPosition = Math.min(
      canvasHeight - PADDLE_HEIGHT,
      Math.max(0, input),
    )
  }

  if (ball.horizontalVelocity > 0) {
    paddles.right.yPosition = updateCpuPaddle({
      ball: {
        xPosition: ball.xPosition,
        yPosition: ball.yPosition,
        verticalVelocity: ball.verticalVelocity,
        horizontalVelocity: ball.horizontalVelocity,
      },
      paddleY: paddles.right.yPosition,
      canvasWidth,
      canvasHeight,
      errorOffset: gameState.cpuErrorOffset,
    })
  }

  // Update ball position using physics config for speed
  ball.xPosition += ball.horizontalVelocity * BALL.INITIAL_SPEED
  ball.yPosition += ball.verticalVelocity * BALL.INITIAL_SPEED

  const leftPaddleY = paddles.left.yPosition

  // Left paddle collision
  if (
    ball.horizontalVelocity < 0 &&
    ball.xPosition <= PADDLE_WIDTH &&
    ball.yPosition <= leftPaddleY + PADDLE_HEIGHT &&
    ball.yPosition + BALL_SIZE >= leftPaddleY
  ) {
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
    ball.xPosition = PADDLE_WIDTH
  }

  // Boundary checking - bounce off top and bottom walls
  if (ball.yPosition <= 0 || ball.yPosition + BALL_SIZE >= canvasHeight) {
    ball.verticalVelocity =
      -ball.verticalVelocity * PHYSICS_CONFIG.BALL.BOUNCE_FACTOR_WALL
    // Keep ball inside bounds after bounce
    ball.yPosition = ball.yPosition < 0 ? 0 : canvasHeight - BALL_SIZE
  }

  // A ball crossing either side ends the round.
  if (ball.xPosition + BALL_SIZE < 0 || ball.xPosition > canvasWidth) {
    gameState.isGameOver = true
    gameState.cpuErrorOffset = randomCpuErrorOffset()
    return
  }

  // Right paddle collision
  const rightPaddleY = paddles.right.yPosition
  if (
    ball.horizontalVelocity > 0 &&
    ball.xPosition + BALL_SIZE >= canvasWidth - PADDLE_WIDTH &&
    ball.yPosition <= rightPaddleY + PADDLE_HEIGHT &&
    ball.yPosition + BALL_SIZE >= rightPaddleY
  ) {
    const hitPosition =
      (ball.yPosition + BALL_SIZE / 2 - (rightPaddleY + PADDLE_HEIGHT / 2)) /
      (PADDLE_HEIGHT / 2)
    const speed = Math.min(
      PHYSICS_CONFIG.BALL.MAX_SPEED,
      Math.hypot(ball.horizontalVelocity, ball.verticalVelocity) *
        PHYSICS_CONFIG.BALL.BOUNCE_FACTOR_PADDLE,
    )
    const angle = hitPosition * PHYSICS_CONFIG.BALL.ANGLE_SENSITIVITY
    ball.horizontalVelocity = -Math.cos(angle) * speed
    ball.verticalVelocity = Math.sin(angle) * speed
    ball.xPosition = canvasWidth - PADDLE_WIDTH - BALL_SIZE
  }

  // Clamp ball vertical velocity to prevent tunneling
  const MAX_BALL_SPEED = Math.sqrt(
    ball.verticalVelocity ** 2 + ball.horizontalVelocity ** 2,
  )
  if (MAX_BALL_SPEED > PHYSICS_CONFIG.BALL.MAX_SPEED) {
    const scale = PHYSICS_CONFIG.BALL.MAX_SPEED / MAX_BALL_SPEED
    ball.verticalVelocity *= scale
    ball.horizontalVelocity *= scale
  }
}
