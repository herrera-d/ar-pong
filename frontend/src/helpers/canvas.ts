import { PADDLE_WIDTH, PADDLE_HEIGHT } from "../constants"

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const getViewportSize = (): { width: number; height: number } => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  if (!canvas) return { width: window.innerWidth, height: window.innerHeight }
  return {
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
  }
}

export const getCanvasSize = (): { width: number; height: number } => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  if (!canvas) return { width: window.innerWidth, height: window.innerHeight }
  return {
    width: canvas.width || window.innerWidth,
    height: canvas.height || window.innerHeight,
  }
}

export const resizeCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  if (!canvasRef.current) return

  const { width, height } = getViewportSize()
  canvasRef.current.width = width
  canvasRef.current.height = height
  canvasRef.current.style.width = `${width}px`
  canvasRef.current.style.height = `${height}px`
  canvasRef.current.style.backgroundColor = "#2C2C2E"
}

const RETRO_GREEN = "#4ade80"

/** Classic Pong dashed line down the middle of the field. */
const drawCenterLine = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
) => {
  ctx.strokeStyle = RETRO_GREEN
  ctx.lineWidth = 2
  ctx.setLineDash([12, 12])
  ctx.beginPath()
  ctx.moveTo(canvasWidth / 2, 0)
  ctx.lineTo(canvasWidth / 2, canvasHeight)
  ctx.stroke()
  ctx.setLineDash([])
}

/** Retro pixel score drawn directly on the canvas, top center. */
const drawScore = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  score: { player1: number; player2: number },
) => {
  ctx.fillStyle = RETRO_GREEN
  ctx.font = '16px "Press Start 2P", "Courier New", monospace'
  ctx.textAlign = "center"
  ctx.textBaseline = "top"

  const topPadding = 16
  const gap = 90
  const centerX = canvasWidth / 2

  ctx.fillText(String(score.player1), centerX - gap, topPadding)
  ctx.fillText(String(score.player2), centerX + gap, topPadding)
}

export const drawGame = ({
  gameState,
  canvasRef,
}: {
  gameState: any
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) => {
  if (!canvasRef.current) return

  const canvas = canvasRef.current
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { ball } = gameState

  drawCenterLine(ctx, canvas.width, canvas.height)
  drawScore(ctx, canvas.width, gameState.score)

  ctx.fillStyle = RETRO_GREEN
  ctx.beginPath()
  ctx.arc(ball.xPosition + 8, ball.yPosition + 8, 8, 0, Math.PI * 2)
  ctx.fill()

  // Draw left paddle
  const leftPaddleY = gameState.paddles.left.yPosition || 0
  ctx.fillStyle = RETRO_GREEN
  ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)
  ctx.fillStyle = RETRO_GREEN
  ctx.fillRect(
    Math.max(0, canvas.width - PADDLE_WIDTH),
    gameState.paddles.right.yPosition,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  )
}
