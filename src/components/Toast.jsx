import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, position, type}) => {

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ff7f7f'; // Light coral for errors
      case 'info':
        return '#4da6ff'; // Dodger blue for info
      case 'warn':
        return '#ffd700'; // Gold for warnings
      case 'success':
        return '#90ee90'; // Light green for success
      default:
        return '#000'; // Default background color
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: position === 'top' ? '20px' : 'auto',
        bottom: position === 'bottom' ? '20px' : 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px',
        backgroundColor: getBackgroundColor(),
        color: '#fff',
        borderRadius: '2px',
        transition: 'visibility 0s, opacity 0.5s linear',
      }}
    >
      {message}
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom']).isRequired,
  type: PropTypes.oneOf(['error', 'info', 'warn', 'success']).isRequired,
};

export default Toast;
