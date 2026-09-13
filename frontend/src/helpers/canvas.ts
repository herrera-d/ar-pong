// Paddle dimensions.
export const PADDLE_WIDTH = 10
export const PADDLE_HEIGHT = 100

// Draw the game frame. Left paddle follows orientation input, right paddle is centered.
export const drawGame = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  leftPaddleY: number,
) => {
  if (!canvasRef.current) return

  const ctx = canvasRef.current.getContext("2d")
  if (!ctx) return

  const width = canvasRef.current.width
  const height = canvasRef.current.height

  // Clamp the left paddle inside the canvas bounds.
  const leftY = Math.max(0, Math.min(leftPaddleY, height - PADDLE_HEIGHT))
  const rightY = (height - PADDLE_HEIGHT) / 2

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = "#2AA146"
  ctx.fillRect(25, leftY, PADDLE_WIDTH, PADDLE_HEIGHT)
  ctx.fillRect(width - 20 - PADDLE_WIDTH, rightY, PADDLE_WIDTH, PADDLE_HEIGHT)
}

// Clamp a value to a min/max range.
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const getViewportSize = () => {
  const viewport = window.visualViewport
  return {
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
  }
}

export const resizeCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  paddingY: number,
) => {
  if (!canvasRef.current) return

  const { width, height } = getViewportSize()
  canvasRef.current.width = width
  canvasRef.current.height = height
  canvasRef.current.style.width = `${width}px`
  canvasRef.current.style.height = `${height}px`
  canvasRef.current.style.backgroundColor = "#2C2C2E"

  // Redraw the game with the left paddle at the top after resizing
  drawGame(canvasRef, paddingY)
}
