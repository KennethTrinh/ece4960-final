import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/BarChart.module.css'
import * as d3 from "d3";
import {brushX} from 'd3-brush';
import { useWindowSize, sum } from './utils';

// https://stackoverflow.com/questions/65625086/how-to-use-d3-with-reactjs-nextjs

function drawChart(y, checked, svgRef, width, height) {

  const [m, n] = [y.length, y[0].length];

  const svg = d3.select(svgRef.current);

  
  var xz = d3.range(m), // 58,
      yz = Array.from({ length: y[0].length }, 
                      (_, j) => y.map(row => sum(row.slice(0, j+1), checked)));// 4,58
                      // yz = [
                      //   { group1: 10, group2: 20, group3: 30, group4: 40, group5: 50 },
                      //   { group1: 15, group2: 25, group3: 35, group4: 45, group5: 55 },
                      //   { group1: 20, group2: 30, group3: 40, group4: 50, group5: 60 },
                      //   // ... more data points ...
                      // ],
                      // y01z = d3.stack().keys(['group1', 'group2', 'group3', 'group4', 'group5'])(yz),
      // y1Max = d3.max(yz, row => d3.max(row)),
      let arr = Array.from({ length: y.length }, () => Array.from({ length: y[0].length }, () => 0));
      for (let i = 0; i < y.length; i++) {
        for (let j = 0; j < y[i].length; j++) {
          arr[i][j] = y[i][j] * (checked[j] ? 1 : 0);
        }
      }

      var y01z = d3.stack().keys(d3.range(n))(arr),
      y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); }),
      margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom, 
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var x = d3.scaleBand()
            .domain(xz)
            .rangeRound([0, width])
            .padding(0.2);

  var y = d3.scaleLinear()
            .domain([0, y1Max ])
            .range([height, 0]);

  var color = d3.scaleOrdinal()
                .domain(d3.range(n))
                .range(
                  [ 'brown', 'blue', 'green', 'orange', 'yellow' ]
                )
                // .range([
                //   'rgba(253, 192, 134, 0.2)',
                //   'rgba(240, 2, 127, 0.4)',
                //   'rgba(77, 175, 74, 0.6)',
                //   'rgba(141, 160, 203, 0.8)',
                //   'rgba(56, 108, 176, 1)'
                // ]);

  const series = svg.selectAll(".series")
      .data(y01z);
        // .data(yz);
  
  series.exit().remove(); // Remove old bars
  
  const newSeries = series.enter().append("g")
      .attr("class", "series")
      .attr("fill", (_, i) => color(i));
  
    newSeries.merge(series) // Update existing and new bars
      .selectAll("rect")
      .data(d => d)
      .join(
        enter => enter.append("rect")
          .attr("x", (_, i) => x(i))
          .attr("y", innerHeight)
          .attr("width", x.bandwidth())
          .attr("height", 0)
          .attr("fill-opacity", 0), // Start with transparent bars
        update => update, // Update existing bars
        exit => exit.transition().duration(300) // Fade out old bars
          .attr("fill-opacity", 0)
          .remove() // Remove after fade out
      )
      .transition().duration(0) // Transition to new bars
      .delay((_, i) => i * 10)
      .attr("fill-opacity", 0.6)
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));
  
    svg.select(".axis--x")

}

function draw(y, checked, svgRef, width, height, 
              tmax, xmax, deaths, total, vline, 
              timestep, total_infected, N, ymax, 
                InterventionTime, colors, log, ) {
    
    const svg = d3.select(svgRef.current);

    const padding = { top: 20, right: 0, bottom: 20, left: 25 };

    const xScale = d3.scaleLinear()
      .domain([0, y.length])
      .range([padding.left, width - padding.right]);

    const xScaleTime = d3.scaleLinear()
      .domain([0, tmax])
      .range([padding.left, width - padding.right]);

    const indexToTime = d3.scaleLinear()
      .domain([0, y.length])
      .range([0, tmax]);

    const timeToIndex = d3.scaleLinear()
      .domain([0, tmax])
      .range([0, y.length]);

    const yScale = (log ? d3.scaleLog() : d3.scaleLinear())
      .domain([log ? 1 : 0, ymax / 1])
      .range([height - padding.bottom, padding.top]);

    const yScaleL = d3.scaleLog()
      .domain([1, ymax / 1])
      .range([0, height - padding.bottom - padding.top]);
    
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const barWidth = innerWidth / y.length;


    // x axis
    const xAxis = d3.axisBottom(xScaleTime)
      .tickSizeOuter(0)
      .tickFormat((d, i) => (i === 0 ? "Day " : "") + d);
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);
    
    // const yAxisGrid = d3.axisLeft(yScale).tickFormat("").ticks(5).tickSize(-innerWidth);
    // svg.append('g')
    //   .attr('class', 'y axis-grid')
    //   .call(yAxisGrid);

    // const yz = Array.from({ length: y[0].length }, 
    //   (_, j) => y.map(row => sum(row.slice(0, j+1), checked))), // 5 by 110
    
    //   y01z = d3.stack().keys(d3.range( y[0].length))(d3.transpose(yz)); // 5 by 110 by 2
      
    //   console.log(yz)
    //   console.log(y01z)
    // const barsGroup = svg.append("g")
    // .attr("class", "bars");



      



      

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
        drawChart(y, checked, svg, 960, 500);
        // draw(y, checked, svg, 960, 500, 
        //       tmax, xmax, deaths, 
        //       total, vline, timestep, 
        //       total_infected, N, ymax, 
        //       InterventionTime, colors, log, );
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