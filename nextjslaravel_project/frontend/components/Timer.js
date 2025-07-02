import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const Timer = ({ initialTime, onTimeUp, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timeUpCalled = useRef(false);

  useEffect(() => {
    setTimeLeft(initialTime);
    timeUpCalled.current = false;
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft <= 0 && !timeUpCalled.current) {
      timeUpCalled.current = true;
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        onTick(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCriticalTime = timeLeft <= 60; // 1 minute
  const isVeryCriticalTime = timeLeft <= 30; // 30 seconds

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all duration-300 ${
      isVeryCriticalTime 
        ? 'bg-red-200 text-red-700 animate-pulse shadow-lg' 
        : isCriticalTime 
        ? 'bg-red-100 text-red-600 animate-pulse' 
        : isLowTime 
        ? 'bg-yellow-100 text-yellow-600' 
        : 'bg-blue-100 text-blue-600'
    }`}>
      {isCriticalTime ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime(timeLeft)}</span>
      {isLowTime && (
        <span className="text-xs ml-2">
          {isVeryCriticalTime ? 'Waktu hampir habis!' : 'Waktu tersisa sedikit!'}
        </span>
      )}
    </div>
  );
};

export default Timer;
