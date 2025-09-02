
import React, { useState, useEffect } from 'react';

interface Props {
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

const Timer: React.FC<Props> = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const timeColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-amber-500' : 'text-slate-800';


  return (
    <div className="text-center p-4 bg-slate-100 rounded-lg">
      <h3 className="text-sm font-medium text-slate-500">Оставшееся время приема</h3>
      <p className={`text-4xl font-bold mt-1 ${timeColor}`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
};

export default Timer;
