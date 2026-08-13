# Online Multiplayer Pong

A web-based multiplayer Pong game with extra features, built for a smooth and responsive experience across different devices.

## 🚀 Project Overview

This project is an online multiplayer Pong game. It is designed to be highly responsive, allowing players to compete in real-time with low-latency interactions. The goal is to provide a polished gaming experience with a clean, modular codebase.

## 🛠 Tech Stack

### Frontend

- **React**: For the user interface and component architecture.
- **TypeScript**: To ensure type safety and better developer experience.
- **Vite**: For a fast and optimized development and build environment.

### Backend

- **Node.js**: To handle the server-side logic.
- **WebSockets**: To enable real-time, bi-directional communication between players.

## 📁 Core Components

### `src/helpers/canvas.ts`

A dedicated utility file containing core game mechanics:

- **Rendering**: Functions to draw paddles and the game frame.
- **Resizing**: Logic to synchronize the canvas internal resolution with its CSS size.
- **Utilities**: Helper functions like `clamp` for boundary checking.

### `src/App.tsx`

The main orchestrator of the application. It manages the high-level game state, listens for user pointer inputs, and triggers the rendering loop.

## 🎮 Getting Started

To run the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development servers:
   ```bash
   # Start the frontend
   npm run dev:frontend

   # Start the backend
   npm run dev:backend
   ```

_Note: The Frontend, backend environment and WebSocket configuration are currently under development._
