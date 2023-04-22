import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/BarChart.module.css'
import * as d3 from "d3";
import {brushX} from 'd3-brush';
import { useWindowSize, sum } from './utils';

// https://stackoverflow.com/questions/65625086/how-to-use-d3-with-reactjs-nextjs

function drawChart(y, checked, svgRef, width, height, 
              tmax, xmax, deaths, total, vline, 
              timestep, total_infected, N, ymax, 
                InterventionTime, colors, log, ) {

  const [m, n] = [y.length, y[0].length];

  const svg = d3.select(svgRef.current);

  // y1Max = d3.max(yz, row => d3.max(row)),
  const arr = y.map((row) => row.map((val, j) => val * (checked[j] ? 1 : 0))); // 110, 5
  const y01z = d3.stack().keys(d3.range(n))(arr), // 5, 110, 2
      // y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); }),
      margin = {top: 10, right: 0, bottom: 10, left: 10},
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom,
      barWidth = innerWidth / m - 1.5
  
  const xScale = d3.scaleLinear()
              .domain([0, y.length])
              .range([margin.left, width - margin.right]);
  const xScaleTime = d3.scaleLinear()
              .domain([0, tmax])
              .range([margin.left, width - margin.right]);

  const yScale = (log ? d3.scaleLog() : d3.scaleLinear())
              .domain([log ? 1 : 0, ymax])
              .range([innerHeight, 0]);
  
  const yScaleL = d3.scaleLog()
              .domain([1, ymax / 1])
              .range([0, height - margin.bottom - margin.top]);

  const indexToTime = d3.scaleLinear()
              .domain([0, y.length])
              .range([0, tmax]);
        
  const timeToIndex = d3.scaleLinear()
              .domain([0, tmax])
              .range([0, y.length]);
        
  var color = d3.scaleOrdinal()
                .domain(d3.range(n))
                .range([
                  'rgba(253, 192, 134, 1)',
                  'rgba(240, 2, 127, 1)',
                  'rgba(77, 175, 74, 1)',
                  'rgba(141, 160, 203, 1 )',
                  'rgba(56, 108, 176, 1)'
                ]);
          
  const xAxis = d3.axisBottom(xScaleTime)
    .tickSizeOuter(0)
    .tickSize(10)
    .tickFormat((d, i) => (i === 0 ? "Day " : "") + d);
  svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  const series = svg.selectAll(".series")
      .data(y01z);
  
  series.exit().remove(); // Remove old bars
  
  const newSeries = series.enter().append("g")
      .attr("class", "series")
      .attr("fill", (_, i) => color(i));
  
    newSeries.merge(series) // Update existing and new bars
      .selectAll("rect")
      .data(d => d)
      .join(
        enter => enter.append("rect")
          .attr("x", (_, i) => xScale(i))
          .attr("y", innerHeight)
          .attr("width", barWidth)
          .attr("height", 0)
          .attr("fill-opacity", 0), // Start with transparent bars
        update => update, // Update existing bars
        exit => exit.transition().duration(300) // Fade out old bars
          .attr("fill-opacity", 0)
          .remove() // Remove after fade out
      )
      .transition().duration(0) // Transition to new bars
      .delay((_, i) => i * 10)
      .attr("fill-opacity", 1)
      .attr("x", (d, i) => xScale(i))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]));
  
}


const BarChart = ({ y, tmax, xmax, deaths, 
                    total, vline, timestep, 
                    total_infected, N, ymax, 
                    InterventionTime, colors, log, 
                    checked }) => {

    const size = useWindowSize();
    const svg = useRef(null);

    // useEffect(() => {
    //     console.log("y: ", y)
    //     console.log(size.width, size.height)
    // }, [size.width, size.height])

    useEffect(() => {
        // drawChart(svg, width*0.5, height*0.5);
        drawChart(y, checked, svg, 960, 500, 
              tmax, xmax, deaths, 
              total, vline, timestep, 
              total_infected, N, ymax, 
              InterventionTime, colors, log, );
    }, [svg, y]);

  //   useEffect(() => {
  //     // drawChart(svg, width*0.5, height*0.5);
  //     drawChart(y, svg, size.width*0.8, size.height);
  // }, [size.width, size.height, svg]);


    return (
      <div id="chart">
        { size.width && size.height ? 
          <svg ref={svg} width={size.width*0.8} 
                        height={size.height}/> 
                        : null }
      </div>
      );
}

export default BarChart;