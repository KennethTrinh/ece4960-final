import { useState, useEffect } from 'react';
import styles from '@/styles/BarChart.module.css'
import { BarChart, Bar, Line, ReferenceLine, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
    { name: 'A', value1: 10, value2: 20 },
    { name: 'B', value1: 15, value2: 25 },
    { name: 'C', value1: 20, value2: 30 },
    { name: 'D', value1: 25, value2: 35 },
    { name: 'E', value1: 30, value2: 40 },
  ];

const Chart = ({ y, tmax, xmax, deaths, 
                    total, vline, timestep, 
                    total_infected, N, ymax, 
                    InterventionTime, colors, log }) => {
    const [sliderPosition, setSliderPosition] = useState(2);

    const handleSliderChange = (event) => {
        setSliderPosition(event.activeLabel);
    };

    useEffect(() => {
        console.log("BarChart: useEffect")
        console.log("y: ", y)
    }, [])

    return (
        <BarChart width={500} height={300} data={data}>
          <Bar dataKey="value1" fill="#8884d8" />
          <Bar dataKey="value2" fill="#82ca9d" />
          <Line dataKey="value1" stroke="#8884d8" dot={false} />
          <ReferenceLine x={sliderPosition} stroke="red" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </BarChart>
      );
}

export default Chart;