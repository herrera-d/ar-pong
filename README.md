# Ar-Pong Game

A web-based Pong game with smooth rendering and multiplayer capabilities, built on a modular architecture with React and TypeScript.

## 🚀 Project Overview

This project is a responsive Pong game supporting local multiplayer (keyboard input) while online multiplayer features are currently in development. The goal is to provide a polished gaming experience across different devices with a clean, modular codebase.

## 🛠 Tech Stack

### Frontend

- **React**: For the user interface and component architecture
- **TypeScript**: To ensure type safety and better developer experience
- **Vite**: For fast and optimized development and build environment
- **Canvas API**: For high-performance 2D rendering of game elements

### Backend (In Development)

- **Node.js**: To handle server-side logic for online multiplayer
- **WebSockets**: Will enable real-time, bi-directional communication between players
- **Status**: Currently under development - local multiplayer works, online multiplayer in progress

## 📁 Project Structure

```
.
├── frontend/                    # Frontend React application
│   ├── src/
│   │   ├── components/          # React components (e.g., Scoreboard)
│   │   ├── helpers/             # Core game logic and utilities
│   │   │   ├── canvas.ts        # Rendering functions (drawGame, resizeCanvas)
│   │   │   ├── engine.ts        # Game state management and physics update
│   │   │   └── constants.ts     # Physics and configuration constants
│   │   ├── assets/              # Static assets
│   │   ├── App.css              # Application styles
│   │   ├── App.tsx              # Main application component
│   │   └── main.tsx             # Entry point
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```

### `frontend/src/helpers/canvas.ts`

Core rendering module containing:

- **Rendering**: Functions to draw paddles and the ball using Canvas 2D API
- **Resizing**: Logic to synchronize the canvas internal resolution with its CSS size

### `frontend/src/helpers/engine.ts`

Game state management:

- Defines `GameState` type with ball, paddles, and score properties
- Implements `updateGame` function for game logic updates (position calculations)
- Provides `initialGameState` for game initialization

### `frontend/src/helpers/constants.ts`

Physics and configuration constants:

- **BallConfig**: Speed limits, bounce factors
- **PaddleConfig**: Movement speed, dimensions, collision properties  
- **GameConfig**: Winning score, reset delays
- **PhysicsConfig**: Combined physics configuration for all game entities

## 🎮 Getting Started

To run the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or check package.json for available scripts
   ```

3. Open your browser to the localhost URL shown in the terminal (typically `http://localhost:5173`)

## ⌨️ Controls

- **Touch**: Drag on mobile/touch devices to control the paddle
- **Keyboard**: Use arrow keys or WASD to move your paddle (local multiplayer support)

## 📝 Current Features

- Local multiplayer: Two players can play on the same device using keyboard inputs
- Smooth 2D rendering with Canvas API
- Responsive design for different screen sizes
- Modular codebase with separate concerns (rendering, state, physics)

**Paddle dimensions**: 50px wide × 20px tall  
**Ball radius**: 8px (fixed size for consistent rendering, no deformation)  
**Color theme**: Green (#2AA146) for paddles, dark background (#2C2C2E)