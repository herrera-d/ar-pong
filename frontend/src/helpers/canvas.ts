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

  ctx.beginPath()
  ctx.arc(ball.xPosition + 8, ball.yPosition + 8, 8, 0, Math.PI * 2)
  ctx.fill()

  // Draw left paddle
  const leftPaddleY = gameState.paddles.left.yPosition || 0
  ctx.fillStyle = "#4ade80"
  ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)
  console.log("right paddle y", gameState.paddles.right.yPosition)
  ctx.fillStyle = "#4ade80"
  ctx.fillRect(
    Math.max(0, canvas.width - PADDLE_WIDTH),
    gameState.paddles.right.yPosition,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  )
}
