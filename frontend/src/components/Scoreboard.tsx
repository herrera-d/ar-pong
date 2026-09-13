import React from "react"

const Scoreboard: React.FC = () => {
  const scoreboardStyle: React.CSSProperties = {
    position: "fixed",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "40px",
    padding: "10px 20px",
    backgroundColor: "#2c2c2e",
    border: "2px solid #00ff0023",
    borderRadius: "4px",
    color: "rgb(42 161 70)",
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: "1rem",
    fontWeight: "bold",
    zIndex: 1000,
    boxShadow: "inset rgb(42, 161, 70) 0px -2px 3px 1px",
  }

  const scoreItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "60px",
    textAlign: "center",
  }

  const PlayerScore = ({
    playerName = "",
    score = 0,
  }: {
    playerName: string
    score: number
  }) => {
    return (
      <div style={{ display: "inline-flexbox" }}>
        <div>{playerName}</div>
        <div>{score}</div>
      </div>
    )
  }

  return (
    <div style={scoreboardStyle}>
      <div style={scoreItemStyle}>
        <PlayerScore playerName="Player 1" score={0} />
        <PlayerScore playerName="Player 2" score={0} />
      </div>
    </div>
  )
}

export default Scoreboard
