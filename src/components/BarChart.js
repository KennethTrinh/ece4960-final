import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/BarChart.module.css'
import * as d3 from "d3";
import { useWindowSize, sum } from './utils';

// https://stackoverflow.com/questions/65625086/how-to-use-d3-with-reactjs-nextjs

function drawChart(y, checked, svgRef, width, height) {

  const [m, n] = [y.length, y[0].length];

  const svg = d3.select(svgRef.current);
  var xz = d3.range(m), // 58,
      yz = Array.from({ length: y[0].length }, 
                      (_, j) => y.map(row => sum(row.slice(0, j+1), checked))),//d3.range(n).map(function() { return bumps(m); }), // 4,58
      y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)), // 4,58,2
      y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
  
  // console.log(d3.transpose(y))
  // console.log(yz)    
  // console.log(y01z)
  // console.log(y1Max)

  var margin = {top: 40, right: 10, bottom: 20, left: 10},
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
    .domain(xz)
    .rangeRound([0, width])
    .padding(0.08);

  var y = d3.scaleLinear()
      .domain([0, y1Max])
      .range([height, 0]);

  var color = d3.scaleOrdinal()
      .domain(d3.range(n))
      .range(d3.schemeSet1);

  var series = g.selectAll(".series")
    .data(y01z)
    .enter().append("g")
    .attr("fill", function(d, i) { return color(i); });

  var rect = series.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("x", function(d, i) { return x(i); })
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0);
  
    rect.transition()
    .delay(function(d, i) { return i * 10; })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickSize(0)
        .tickPadding(6));


}


const BarChart = ({ y, tmax, xmax, deaths, 
                    total, vline, timestep, 
                    total_infected, N, ymax, 
                    InterventionTime, colors, log, 
                    checked }) => {

    const size = useWindowSize();
    const svg = useRef(null);

    useEffect(() => {
        console.log("y: ", y)
        console.log(size.width, size.height)
    }, [size.width, size.height])

    useEffect(() => {
        // drawChart(svg, width*0.5, height*0.5);
        drawChart(y, checked, svg, 960, 500);
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