import { useState, useCallback } from 'react';
import { GamePiece, Position, PieceColor, GameState, Move } from '../types/game';

const BOARD_SIZE = 8;

export const useKonaneGame = () => {
  const [board, setBoard] = useState<(GamePiece | null)[][]>(() => initializeBoard());  // 2d board array
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('black');              // Whose turn
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);      // Currently selected piece
  const [gameState, setGameState] = useState<GameState>('initializing');                // "initializing" | "playing" | "finished"
  const [winner, setWinner] = useState<PieceColor | null>(null);                        // Who won
  const [moveCount, setMoveCount] = useState<number>(0);                                // number of moves made
  const [removedPieces, setRemovedPieces] = useState<number>(0);                        // tracks removed pieces at start
  const [moveHistory, setMoveHistory] = useState<Move[]>([]); 

  // Initialize checker pattern of black/white board pieces
  function initializeBoard(): (GamePiece | null)[][] {
    const newBoard: (GamePiece | null)[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      const newRow: (GamePiece | null)[] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isEven = (row + col) % 2 === 0;
        newRow.push({
          color: isEven ? 'black' : 'white'
        });
      }
      newBoard.push(newRow);
    }
    return newBoard;
  }

  // CHANGED: Added forcedDirection parameter
  // Get valid moves for a single piece
  const getValidMoves = useCallback((
    position: Position, 
    boardState: (GamePiece | null)[][], 
    playerColor: PieceColor,
    forcedDirection?: [number, number] // CHANGED
  ): Position[] => {
    if (gameState === 'initializing') return [];
    
    const { row, col } = position;
    const piece = boardState[row][col];
    
    // Must be player's own piece
    if (!piece || piece.color !== playerColor) return [];
    
    const validMoves: Position[] = [];
    // CHANGED: If we are mid-jump, only check the same direction
    const directions = forcedDirection ? [forcedDirection] : [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    
    for (const [dRow, dCol] of directions) {
      const jumpOverRow = row + dRow;
      const jumpOverCol = col + dCol;
      const landRow = row + (dRow * 2);
      const landCol = col + (dCol * 2);
      
      // Check bounds (Must land inside the board)
      if (landRow < 0 || landRow >= BOARD_SIZE || landCol < 0 || landCol >= BOARD_SIZE) continue;
      
      // Check if there's an opponent piece to jump over
      const jumpOverPiece = boardState[jumpOverRow]?.[jumpOverCol];
      if (!jumpOverPiece || jumpOverPiece.color === playerColor) continue;
      
      // Check if landing spot is empty
      if (boardState[landRow][landCol] === null) {
        validMoves.push({ row: landRow, col: landCol });
      }
    }
    
    return validMoves;
  }, [gameState]);

  // Get all valid moves for the current player
  const getAllValidMovesForPlayer = useCallback((playerColor: PieceColor, boardState: (GamePiece | null)[][]): Position[] => {
    const allMoves: Position[] = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = boardState[row][col];
        if (piece && piece.color === playerColor) {
          const moves = getValidMoves({ row, col }, boardState, playerColor);
          allMoves.push(...moves);
        }
      }
    }
    
    return allMoves;
  }, [getValidMoves]);

  // CHANGED: Added direction parameter
  // Execute a move: move piece, capture, switch player if no more jumps
  const executeMove = useCallback((from: Position, to: Position, direction?: [number, number]) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      const piece = newBoard[from.row][from.col];
      
      if (!piece) return prevBoard;
      
      // Move piece to new position
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      
      // Capture jumped piece
      const dRow = to.row > from.row ? 1 : to.row < from.row ? -1 : 0;
      const dCol = to.col > from.col ? 1 : to.col < from.col ? -1 : 0;
      const capturedRow = from.row + dRow;
      const capturedCol = from.col + dCol;
      
      newBoard[capturedRow][capturedCol] = null;

      // CHANGED: If this is the first jump, set the direction now
      const moveDirection: [number, number] = direction ?? [dRow, dCol];
      
      // CHANGED: Only look for further moves in the same direction
      const additionalMoves = getValidMoves(to, newBoard, piece.color, moveDirection);
      
      if (additionalMoves.length === 0) {
        // No more jumps available, switch players
        const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
        setCurrentPlayer(nextPlayer);
        setMoveCount(prev => prev + 1);
        
        // Check if next player has any valid moves
        const nextPlayerMoves = getAllValidMovesForPlayer(nextPlayer, newBoard);
        if (nextPlayerMoves.length === 0) {
          setWinner(currentPlayer);
          setGameState('finished');
        }
      }
      
      return newBoard;
    });
  }, [currentPlayer, getValidMoves, getAllValidMovesForPlayer]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState === 'initializing') {
      // Handle initial piece removal
      const piece = board[row][col];
      if (!piece) return;
      
      // CHANGED: REMOVED THIS BLOCK OF CODE
      // Check if this is near the center and adjacent to another removed piece or first removal
      // const centerRow = Math.floor(BOARD_SIZE / 2);
      // const centerCol = Math.floor(BOARD_SIZE / 2);
      //  const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
      
      // if (distanceFromCenter > 2) return; // Too far from center
      
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(r => [...r]);
        newBoard[row][col] = null;
        return newBoard;
      });
      
      // CHANGED: ADDED THIS BLOCK OF CODE
      setRemovedPieces(prev => {
        const newCount = prev + 1;
        // store first removed position
        if (newCount === 1) {
          setSelectedPosition({ row, col });
        } else if (newCount === 2) {
          // check adjacency to the first removed piece
          if (selectedPosition) {
            const isAdjacent =
              (Math.abs(row - selectedPosition.row) === 1 && col === selectedPosition.col) ||
              (Math.abs(col - selectedPosition.col) === 1 && row === selectedPosition.row);

            if (!isAdjacent) {
              // invalid second removal → undo it
              setBoard(prevBoard => {
                const newBoard = prevBoard.map(r => [...r]);
                newBoard[row][col] = { color: piece.color }; // restore piece
                return newBoard;
              });
              return prev; // don’t count it
            }
          }
          // valid, then start the game
          setGameState('playing');
          setSelectedPosition(null);
        }
        return newCount;
      });
      return;
    }
    
    if (gameState !== 'playing') return;
    
    const clickedPiece = board[row][col];
    
    if (selectedPosition) {
      // Check if clicking on a valid move destination
      const validMoves = getValidMoves(selectedPosition, board, currentPlayer);
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        executeMove(selectedPosition, { row, col });
        setSelectedPosition(null);
      } else if (clickedPiece && clickedPiece.color === currentPlayer) {
        // Select different piece of same color
        setSelectedPosition({ row, col });
      } else {
        // Invalid move or opponent piece
        setSelectedPosition(null);
      }
    } else {
      // Select piece if it belongs to current player
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        setSelectedPosition({ row, col });
      }
    }
  }, [board, currentPlayer, selectedPosition, gameState, getValidMoves, executeMove]);

  const getValidMovesForSelected = useCallback((): Position[] => {
    if (!selectedPosition || gameState !== 'playing') return [];
    return getValidMoves(selectedPosition, board, currentPlayer);
  }, [selectedPosition, board, currentPlayer, getValidMoves, gameState]);

  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setCurrentPlayer('black');
    setSelectedPosition(null);
    setGameState('initializing');
    setWinner(null);
    setMoveCount(0);
    setRemovedPieces(0);
    setMoveHistory([]);
  }, []);

  return {
    board,
    currentPlayer,
    selectedPosition,
    gameState,
    winner,
    moveCount,
    validMoves: getValidMovesForSelected(),
    onCellClick: handleCellClick,
    resetGame,
    isInitializing: gameState === 'initializing'
  };
};