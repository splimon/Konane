import React from 'react';
import { GamePiece, Position } from '../types/game';
import Piece from './Piece';

interface GameBoardProps {
  board: (GamePiece | null)[][]; // board. each square is either a piece or empty
  selectedPosition: Position | null; // currently selected piece on the board
  validMoves: Position[]; // list of valid moves from the selected piece
  onCellClick: (row: number, col: number) => void; // callback when a square is clicked
  isInitializing: boolean; // flag to adjust hover behavior
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedPosition,
  validMoves,
  onCellClick,
  isInitializing
}) => {
  // Checks if a given (row,col) is in the list of valid moves
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };
  // Checks if this cell is the currently selected one
  const isSelected = (row: number, col: number): boolean => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  // Determines CSS classes for styling each square on the board
  const getCellClassName = (row: number, col: number): string => {
    const baseClass = "relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border border-slate-300 transition-all duration-200 cursor-pointer flex items-center justify-center";
    const isEven = (row + col) % 2 === 0;
    
    let bgClass = isEven ? "bg-amber-100" : "bg-blue-100";
    
    if (isSelected(row, col)) {
      // highlight selected cell with a ring
      bgClass = "bg-emerald-300 ring-4 ring-emerald-400";
    } else if (isValidMove(row, col)) {
      // highlight valid move squares with green background
      bgClass = isEven ? "bg-emerald-200 hover:bg-emerald-300" : "bg-emerald-200 hover:bg-emerald-300";
    } else if (board[row][col] || isInitializing) {
      // if there's a piece or still initializing, allow hover effect
      bgClass += " hover:bg-opacity-80";
    }

    return `${baseClass} ${bgClass}`;
  };

  return (
    <div className="inline-block bg-slate-800 p-4 rounded-xl shadow-2xl">
      <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-lg overflow-hidden">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <Piece
                  color={cell.color}
                  isSelected={isSelected(rowIndex, colIndex)}
                  canMove={isValidMove(rowIndex, colIndex)}
                />
              )}
              {isValidMove(rowIndex, colIndex) && !cell && (
                <div className="w-4 h-4 bg-emerald-500 rounded-full opacity-70 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;