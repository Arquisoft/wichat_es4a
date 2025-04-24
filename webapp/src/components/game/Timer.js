import React, { useState, useEffect } from 'react';

/**
 * React component to represent a timer whose time is decremented every second.
 * @param {Number} initialTime - The initial time in seconds.
 * @param {Function} onTimeUp - A callback function to be executed when the time reaches 0.
 * @param {Boolean} stopTime - A boolean to stop the timer.
 * @param {*} resetTime - A value to reset the timer every time it changes.
 * 
 * @returns A timer that decrements the time every second.
 */
const Timer = ({ initialTime, onTimeUp, stopTime }) => {

    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [timeUp, setTimeUp] = useState(false);
    const className = timeLeft <= 5 ? "game-timer-warning-minus-5" : (timeLeft <= 10 ? "game-timer-warning-minus-10" : "game-timer");

    useEffect(() => {
        if (timeLeft <= 0 && !timeUp) {
            if (onTimeUp) onTimeUp(); // Execute the callback function when the time reaches 0
            setTimeUp(true);
            return;
        } else if (timeLeft <= 0) {
            return;
        }
    
        setTimeUp(false);
        const timer = setInterval(() => {
            if (!stopTime)
                setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer); // Clean up the timer when the component is unmounted
    }, [timeLeft, onTimeUp]);

    return (
        <div className={className}>
            {timeLeft}s
        </div>
    )
}

export default Timer