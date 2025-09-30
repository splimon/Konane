# Kokane 🌺

**Kokane** is a traditional Hawaiian strategy game similar to checkers. Each player is assigned either a white or black piece. The player with the black piece starts by removing any piece from the board (usually from the center or a corner). Players then take turns jumping over their opponent's pieces to capture them. The game ends when a player can no longer make a move.

---

## About This Project 📑

This project was originally generated using **Vibe Coding with Bolt.new** with the prompt:

> "Make a board game based on the game Konane (Hawaiian Checkers)."

While the base project provided a working UI, there were a few issues with the game mechanics:

1. Players could only start from the center of the board, instead of being able to remove any two adjacent pieces.  
2. Players could perform multiple jumps with the same piece, but the code allowed jumping around corners, which is not allowed in Konane.

I modified the generated code to fix these problems, ensuring the game follows the correct rules.

---

## Features 👩‍💻

- Fully playable Konane board game in the browser  
- Supports removing any two adjacent pieces to start  
- Multiple jumps restricted to the same straight line (no corner turns)  
- Responsive UI with interactive game board and status display  

---
This project was deployed using Vercel, and can be accessed [here](https://kokane.vercel.app/).

Enjoy playing Kokane!
