import { useEffect, useRef } from "react"
import "./App.css"
import { drawGame, resizeCanvas, clamp } from "./helpers/canvas"
import { type GameState, initialGameState, updateGame } from "./helpers/engine"
import { PHYSICS_CONFIG, PADDLE_HEIGHT } from "./constants"

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const leftPaddleYRef = useRef(0)
  const isDraggingRef = useRef(false)

  // Create a new gameState with random starting velocity
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

  const gameState: React.RefObject<GameState> = useRef(createInitialGameState())

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas(canvasRef)
    }

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

    const handlePointerDown = (ev: PointerEvent) => {
      isDraggingRef.current = true
      handleUserInput(ev)
    }

    const handlePointerMove = (ev: PointerEvent) => {
      if (isDraggingRef.current) handleUserInput(ev)
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    handleResize()

    const canvasElement = canvasRef.current
    if (canvasElement) {
      canvasElement.addEventListener("pointerdown", handlePointerDown)
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }

    let animationFrame: number
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

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      if (canvasElement) {
        canvasElement.removeEventListener("pointerdown", handlePointerDown)
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }, [])

  // Initialize and start the game loop only when canvas is available in DOM

  return (
    <>
      <canvas ref={canvasRef} id="canvas"></canvas>
    </>
  )
}

export default App
