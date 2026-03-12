import React, { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval] && interval !== 's') {
      return null;
    }

    return (
      <span key={interval} style={{ margin: '0 5px' }}>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

export default Countdown;