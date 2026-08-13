import { useEffect, useRef } from "react"
import "./App.css"
import Scoreboard from "./components/Scoreboard"
import { drawGame, resizeCanvas } from "./helpers/canvas"
import { onPointerDown, onPointerMove, onPointerUp } from "./helpers/userInput"

const initializeGame = ({
  canvasRef,
  leftPaddleYRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  leftPaddleYRef: React.RefObject<number>
}) => {
  if (canvasRef.current) {
    const context = canvasRef.current.getContext("2d")
    const canvas = canvasRef.current

    // Clear the canvas before drawing the game
    context?.clearRect(0, 0, canvas.width, canvas.height)

    drawGame(canvasRef, leftPaddleYRef.current)
  }
}

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const leftPaddleYRef = useRef(0)
  const draggingRef = useRef(false)

  useEffect(() => {
    initializeGame({ canvasRef, leftPaddleYRef })

    const handleResize = () => {
      resizeCanvas(canvasRef, leftPaddleYRef.current)
    }

    const handleOnPointerDown = (ev: PointerEvent) => {
      onPointerDown(ev, { canvasRef, leftPaddleYRef, draggingRef })
    }

    const handleOnPointerUp = (ev: PointerEvent) => {
      onPointerUp(ev, { canvasRef, leftPaddleYRef, draggingRef })
    }

    const handleOnPointerMove = (ev: PointerEvent) => {
      onPointerMove(ev, { canvasRef, leftPaddleYRef, draggingRef })
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    if (canvasRef.current) {
      canvasRef.current.addEventListener("pointerdown", handleOnPointerDown)
      window.addEventListener("pointermove", handleOnPointerMove)
      window.addEventListener("pointerup", handleOnPointerUp)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)

      if (canvasRef.current) {
        canvasRef.current.removeEventListener(
          "pointerdown",
          handleOnPointerDown,
        )
        window.removeEventListener("pointermove", handleOnPointerMove)
        window.removeEventListener("pointerup", handleOnPointerUp)
      }
    }
  }, [])

  return (
    <>
      <Scoreboard />
      <canvas ref={canvasRef} id="canvas"></canvas>
    </>
  )
}

export default App
