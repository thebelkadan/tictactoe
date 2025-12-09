// pages/index.js
import { useState, useEffect } from 'react';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [status, setStatus] = useState('Твой ход!');
  const [showPromo, setShowPromo] = useState('');
  const [gameOver, setGameOver] = useState(false);

  // Проверка победы
  const checkWinner = (squares) => {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'draw';
  };

  // Простой "ИИ": случайный ход
  const computerMove = () => {
    const emptyIndices = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const newBoard = [...board];
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);
    setIsPlayerTurn(true);
  };

  const handleClick = (index) => {
    if (board[index] || !isPlayerTurn || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  // Отправка в Telegram
  const sendTelegram = async (text) => {
    try {
      await fetch('/.netlify/functions/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    } catch (e) {
      console.error('Telegram send failed:', e);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setStatus('Твой ход!');
    setShowPromo('');
    setGameOver(false);
  };

  // Проверка результата после каждого хода
  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      setGameOver(true);
      if (winner === 'X') {
        const promo = Math.floor(10000 + Math.random() * 90000).toString();
        setShowPromo(promo);
        setStatus('Поздравляем! Ты победила! 💖');
        sendTelegram(`Победа! Промокод выдан: ${promo}`);
      } else if (winner === 'O') {
        setStatus('Проигрыш 😢');
        sendTelegram('Проигрыш');
      } else {
        setStatus('Ничья!');
      }
    } else if (!isPlayerTurn) {
      const timer = setTimeout(() => computerMove(), 600);
      return () => clearTimeout(timer);
    }
  }, [board, isPlayerTurn]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">Крестики-нолики</h1>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-20 h-20 md:w-24 md:h-24 text-3xl font-bold rounded-xl bg-white shadow-sm border-2 border-pink-200 flex items-center justify-center hover:bg-pink-100 transition-colors disabled:opacity-70"
            disabled={!!cell || !isPlayerTurn || gameOver}
          >
            {cell === 'X' ? (
              <span className="text-pink-600">✗</span>
            ) : cell === 'O' ? (
              <span className="text-purple-600">○</span>
            ) : ''}
          </button>
        ))}
      </div>

      <div className="text-center mb-6">
        <p className="text-lg text-gray-700 font-medium">{status}</p>
        {showPromo && (
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border border-pink-300 max-w-xs mx-auto">
            <p className="text-sm text-purple-800 font-medium">Твой промокод:</p>
            <p className="text-xl font-mono text-pink-700 font-bold">{showPromo}</p>
          </div>
        )}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full shadow-md transition-colors"
      >
        {gameOver ? 'Сыграть ещё' : 'Начать заново'}
      </button>
    </div>
  );
}