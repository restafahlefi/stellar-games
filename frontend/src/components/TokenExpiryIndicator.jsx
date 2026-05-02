import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Token Expiry Indicator
 * Menampilkan sisa hari token expiry secara realtime
 */
export default function TokenExpiryIndicator() {
  const [daysLeft, setDaysLeft] = useState(null);
  const [hoursLeft, setHoursLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const token = authService.getToken();
      if (!token) {
        setDaysLeft(null);
        setHoursLeft(null);
        return;
      }

      try {
        // Decode JWT token to get expiry time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeLeft = expiryTime - now;

        if (timeLeft <= 0) {
          setDaysLeft(0);
          setHoursLeft(0);
          return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        setDaysLeft(days);
        setHoursLeft(hours);
      } catch (error) {
        console.error('Error decoding token:', error);
        setDaysLeft(null);
        setHoursLeft(null);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every minute
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, []);

  if (daysLeft === null) return null;

  // Determine color based on days left
  const getColor = () => {
    if (daysLeft === 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (daysLeft <= 3) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (daysLeft <= 7) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const getIcon = () => {
    if (daysLeft === 0) return '⚠️';
    if (daysLeft <= 3) return '⏰';
    if (daysLeft <= 7) return '⏳';
    return '✅';
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${getColor()}`}>
      <span>{getIcon()}</span>
      <span>
        {daysLeft === 0 ? (
          'Expired'
        ) : daysLeft === 1 ? (
          `${daysLeft} hari ${hoursLeft}j`
        ) : (
          `${daysLeft} hari`
        )}
      </span>
    </div>
  );
}
