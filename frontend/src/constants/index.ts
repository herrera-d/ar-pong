export const PADDLE_WIDTH = 4
export const PADDLE_HEIGHT = 25
export const BALL_SIZE = 4

export interface BallConfig {
  INITIAL_SPEED: number
  MAX_SPEED: number
  SPEED_INCREMENT: number
  BOUNCE_FACTOR_PADDLE: number
  BOUNCE_FACTOR_WALL: number
  ANGLE_SENSITIVITY: number
}

export interface PaddleConfig {
  SPEED: number
}

export interface PhysicsConfig {
  BALL: BallConfig
  PADDLE: PaddleConfig
}

export const PHYSICS_CONFIG: PhysicsConfig = {
  BALL: {
    INITIAL_SPEED: 1,
    MAX_SPEED: 6,
    SPEED_INCREMENT: 0.15,
    BOUNCE_FACTOR_PADDLE: 1.05,
    BOUNCE_FACTOR_WALL: 1.0,
    ANGLE_SENSITIVITY: 0.6,
  },
  PADDLE: {
    SPEED: 9,
  },
}
