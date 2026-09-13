import { clamp, drawGame, PADDLE_HEIGHT } from "./canvas"
import React from "react"

export interface InputRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  leftPaddleYRef: React.RefObject<number>
  draggingRef: React.RefObject<boolean>
}
// Handle pointer down event to start dragging the left paddle
export const onPointerDown = (ev: PointerEvent, refs: InputRefs) => {
  const { canvasRef, leftPaddleYRef, draggingRef } = refs
  if (!canvasRef.current) return

  draggingRef.current = true
  try {
    canvasRef.current.setPointerCapture(ev.pointerId)
  } catch {}

  // Calculate the new Y position of the left paddle based on pointer down event
  const rect = canvasRef.current.getBoundingClientRect()
  const y = ev.clientY - rect.top
  leftPaddleYRef.current = clamp(
    y - PADDLE_HEIGHT / 2,
    0,
    canvasRef.current.height - PADDLE_HEIGHT,
  )

  // Redraw the game with the updated left paddle position
  drawGame(canvasRef, leftPaddleYRef.current)
}

// Handle pointer move event to update the left paddle position while dragging
export const onPointerMove = (ev: PointerEvent, refs: InputRefs) => {
  const { canvasRef, leftPaddleYRef, draggingRef } = refs
  if (!draggingRef.current || !canvasRef.current) return

  // Calculate the new Y position of the left paddle based on pointer movement
  const rect = canvasRef.current.getBoundingClientRect()
  const y = ev.clientY - rect.top
  if (leftPaddleYRef?.current !== undefined) {
    leftPaddleYRef.current = clamp(
      y - PADDLE_HEIGHT / 2,
      0,
      canvasRef.current.height - PADDLE_HEIGHT,
    )
  }

  // Redraw the game with the updated left paddle position
  drawGame(canvasRef, leftPaddleYRef.current)
}

// Handle pointer up event to stop dragging the left paddle
export const onPointerUp = (ev: PointerEvent, refs: InputRefs) => {
  const { canvasRef, draggingRef } = refs
  if (!canvasRef.current) return

  draggingRef.current = false
  try {
    // Release pointer capture when the pointer is released
    canvasRef.current.releasePointerCapture(ev.pointerId)
  } catch {}
}
