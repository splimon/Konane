import { useState, useCallback } from 'react';
import { GamePiece, Position, PieceColor, GameState, Move } from '../types/game';

const BOARD_SIZE = 8;

export const useKonaneGame = () => {
  const [board, setBoard] = useState<(GamePiece | null)[][]>(() => initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('black');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [gameState, setGameState] = useState<GameState>('initializing');
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [removedPieces, setRemovedPieces] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

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

  const getValidMoves = useCallback((position: Position, boardState: (GamePiece | null)[][], playerColor: PieceColor): Position[] => {
    if (gameState === 'initializing') return [];
    
    const { row, col } = position;
    const piece = boardState[row][col];
    
    if (!piece || piece.color !== playerColor) return [];
    
    const validMoves: Position[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    
    for (const [dRow, dCol] of directions) {
      const jumpOverRow = row + dRow;
      const jumpOverCol = col + dCol;
      const landRow = row + (dRow * 2);
      const landCol = col + (dCol * 2);
      
      // Check bounds
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

  const executeMove = useCallback((from: Position, to: Position) => {
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
      
      // Check for additional jumps from new position
      const additionalMoves = getValidMoves(to, newBoard, piece.color);
      
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
      
      // Check if this is near the center and adjacent to another removed piece or first removal
      const centerRow = Math.floor(BOARD_SIZE / 2);
      const centerCol = Math.floor(BOARD_SIZE / 2);
      const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
      
      if (distanceFromCenter > 2) return; // Too far from center
      
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(r => [...r]);
        newBoard[row][col] = null;
        return newBoard;
      });
      
      setRemovedPieces(prev => {
        const newCount = prev + 1;
        if (newCount === 2) {
          setGameState('playing');
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