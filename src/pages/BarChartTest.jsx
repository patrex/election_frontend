import React from 'react';
import BarChart from '@/components/BarChart';

const BarChartTest = () => {
  const data = [20, 1, 20, 40, 60, 1, 10, 40, 23, 14];
  const width = 600;
  const height = 500;

  return (
    <div>
      <h1>My Bar Chart</h1>
      <BarChart data={data} width={width} height={height} />
    </div>
  );
};

export default BarChartTest;
