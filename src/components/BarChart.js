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
                      (_, j) => y.map(row => sum(row.slice(0, j+1), checked))),// 4,58
      // y1Max = d3.max(yz, row => d3.max(row)),
      y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
      y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); }),
      margin = {top: 0, right: 10, bottom: 0, left: 10},
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
        // drawChart(y, checked, svg, 750*1.2, 420*1);
    }, [svg, y]);

  //   useEffect(() => {
  //     // drawChart(svg, width*0.5, height*0.5);
  //     drawChart(y, svg, size.width*0.8, size.height);
  // }, [size.width, size.height, svg]);


    return (
      <div id="chart">
        <svg ref={svg} width={size.width? size.width*0.8 : 0} 
                      height={size.height? size.height : 0}/>
      </div>
      );
}

export default BarChart;