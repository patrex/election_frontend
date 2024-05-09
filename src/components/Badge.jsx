import React from 'react';

const Badge = ({ description, text }) => {
  let bgColor;
  let textColor;

  switch (description) {
    case 'success':
      bgColor = 'bg-green-300';
      textColor = 'text-white';
      break;
    case 'failure':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-black';
      break;
    default:
      bgColor = 'bg-gray-500';
      textColor = 'text-white';
      break;
  }

  return (
    <span
      className={`inline-block ${bgColor} ${textColor} text-sm font-semibold px-2 py-1 rounded-full`}
    >
      {text}
    </span>
  );
};

export default Badge;
