import React from 'react';
import { GameState, PieceColor } from '../types/game';
import { RotateCcw, Trophy, Clock } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState;
  currentPlayer: PieceColor;
  moveCount: number;
  onReset: () => void;
  winner: PieceColor | null;
  isInitializing: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameState,
  currentPlayer,
  moveCount,
  onReset,
  winner,
  isInitializing
}) => {
  const getStatusMessage = (): string => {
    if (winner) {
      return `${winner === 'black' ? 'Black' : 'White'} Wins!`;
    }
    if (isInitializing) {
      return 'Remove two adjacent pieces from the center to begin';
    }
    if (gameState === 'playing') {
      return `${currentPlayer === 'black' ? 'Black' : 'White'}'s Turn`;
    }
    return 'Game Over';
  };

  const getStatusColor = (): string => {
    if (winner) return 'text-emerald-600';
    if (isInitializing) return 'text-blue-600';
    return currentPlayer === 'black' ? 'text-slate-700' : 'text-amber-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 min-w-80">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 font-serif">
          Konane
        </h1>
        <p className="text-slate-600 text-sm">Hawaiian Checkers</p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getStatusColor()} mb-2`}>
            {winner && <Trophy className="inline mr-2" size={24} />}
            {!winner && !isInitializing && <Clock className="inline mr-2" size={24} />}
            {getStatusMessage()}
          </div>
          {!isInitializing && !winner && (
            <div className="text-sm text-slate-500">
              Move #{Math.floor(moveCount / 2) + 1}
            </div>
          )}
        </div>

        {isInitializing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm text-center">
              Click on two adjacent pieces near the center of the board to remove them and start the game.
            </p>
          </div>
        )}

        {!isInitializing && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-700 mb-2">How to Play:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Jump over opponent pieces to capture them</li>
              <li>• Multiple jumps in one turn are allowed</li>
              <li>• Move only horizontally or vertically</li>
              <li>• Last player able to move wins</li>
            </ul>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameStatus;