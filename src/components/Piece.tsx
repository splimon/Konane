import React from 'react';
import { PieceColor } from '../types/game';

interface PieceProps {
  color: PieceColor;
  isSelected: boolean;
  canMove: boolean;
}

const Piece: React.FC<PieceProps> = ({ color, isSelected, canMove }) => {
  const baseClass = "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-300 cursor-pointer shadow-lg";
  
  const colorClass = color === 'black' 
    ? "bg-slate-800 border-2 border-slate-900" 
    : "bg-amber-50 border-2 border-amber-200";
  
  const stateClass = isSelected 
    ? "transform scale-110 shadow-xl" 
    : canMove 
      ? "hover:transform hover:scale-105 hover:shadow-xl" 
      : "hover:transform hover:scale-105";

  return (
    <div className={`${baseClass} ${colorClass} ${stateClass}`}>
      {color === 'black' && (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner" />
      )}
      {color === 'white' && (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-amber-100 shadow-inner" />
      )}
    </div>
  );
};

export default Piece;