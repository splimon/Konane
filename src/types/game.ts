export type PieceColor = 'black' | 'white';

export interface GamePiece {
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured: Position[];
}

export type GameState = 'initializing' | 'playing' | 'finished';
// 'initializing' = players are removing starting pieces
// 'playing'      = normal gameplay is ongoing
// 'finished'     = the game is over, a winner is determined