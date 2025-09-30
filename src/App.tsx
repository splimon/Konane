import React from 'react';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import { useKonaneGame } from './hooks/useKonaneGame';

function App() {
  const {
    board,
    currentPlayer,
    selectedPosition,
    gameState,
    winner,
    moveCount,
    validMoves,
    onCellClick,
    resetGame,
    isInitializing
  } = useKonaneGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          <div className="flex-shrink-0">
            <GameBoard
              board={board}
              selectedPosition={selectedPosition}
              validMoves={validMoves}
              onCellClick={onCellClick}
              isInitializing={isInitializing}
            />
          </div>
          
          <div className="flex-shrink-0">
            <GameStatus
              gameState={gameState}
              currentPlayer={currentPlayer}
              moveCount={moveCount}
              onReset={resetGame}
              winner={winner}
              isInitializing={isInitializing}
            />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">About Konane</h2>
            <p className="text-slate-600 leading-relaxed">
              Konane is a traditional Hawaiian strategy game similar to checkers. The game was historically 
              played by Hawaiian royalty and commoners alike. Players must jump over opponent pieces to 
              capture them, with the goal of being the last player able to make a move. The game requires 
              strategic thinking and planning, as players must consider both offensive captures and 
              defensive positioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;