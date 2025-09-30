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