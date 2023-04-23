import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/BarChart.module.css'
import * as d3 from "d3";
import {brushX} from 'd3-brush';
import { useWindowSize, sum } from './utils';

// https://stackoverflow.com/questions/65625086/how-to-use-d3-with-reactjs-nextjs

function drawChart(y, checked, svgRef, width, height, 
              tmax, xmax, deaths, total, vline, 
              timestep, total_infected, N, ymax, 
                InterventionTime, colors, log, 
                interventionSlider, setInterventionSlider) {

  const [m, n] = [y.length, y[0].length];

  const svg = d3.select(svgRef.current);

  // y1Max = d3.max(yz, row => d3.max(row)),
  const arr = y.map((row) => row.map((val, j) => val * (checked[j] ? 1 : 0))); // 110, 5
  const y01z = d3.stack().keys(d3.range(n))(arr), // 5, 110, 2
      // y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); }),
      margin = {top: 20, right: 30, bottom: 30, left: 40},
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
            
  const series = svg.selectAll(".series")
    .data(y01z);
  
  series.exit().remove(); // Remove old bars
  svg.selectAll(".axis").remove();
  svg.selectAll(".slider").remove();
  svg.selectAll(".slider-text").remove();
  
  // x-axis
  const xAxis = d3.axisBottom(xScaleTime)
    .tickSizeOuter(0)
    .tickSize(10)
    .tickFormat((d, i) => (i === 0 ? "Day " : "") + d);
    
  svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);
  
  // y-axis
  const yAxis = d3.axisLeft(yScale)
      .tickSize(-width) 
      .tickPadding(5) // add space between tick labels and tick lines
      .ticks(5) // specify the number of ticks you want
      .tickFormat((d, i) => (i === 0 ? "" : d));

  const yAxisGroup = svg.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);
  
    yAxisGroup.selectAll('.tick line')
    .attr('stroke', 'white')
    .attr('stroke-dasharray', '2 2')
  
  // add labels to the tick marks
  yAxisGroup.selectAll('.tick text')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('opacity', 1)
    // move the labels to the right
    .attr('x', 0)
  
    //hide the y-axis line
  yAxisGroup.select('.domain').remove();

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
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("id", (_, i) => i)

    newSeries.merge(series)
      .selectAll("rect")
      .on("mouseover", (d) => {
          const element = d.target;
          const index = element.id;
          // get all the rects with the same index
          const rects = document.querySelectorAll(`rect[id="${index}"]`);
          rects.forEach(rect => rect.style.fill = "rgba(0, 0, 0, 0.2)");
          rects.forEach(rect => rect.classList.add("hovered"));
          // get the corresponding data from y01z
          const tooltipData = y01z.map(series => series[index]);
          console.log(tooltipData)

      })
      .on("mouseout", function() {
        // Remove the fill
        d3.selectAll(".hovered").style("fill", null);
        
      });

  const sliderLine = svg.append("line")
      .attr("class", "slider")
      .attr("x1", interventionSlider ? interventionSlider : innerWidth / 2)
      .attr("x2", interventionSlider ? interventionSlider : innerWidth / 2)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "40,2")
      .attr("stroke-width", 10)
      .call(d3.drag()
        .on("drag", (event) => {
          const newX = event.x;
          // Restrict slider to be within bounds
          if (newX < margin.left || newX > width - margin.right) return;
          // Update position of slider
          sliderLine.attr("x1", newX).attr("x2", newX);
          setInterventionSlider(newX);
      
          sliderText.text(`Intervention\n Day:\n ${xScaleTime.invert(newX)}`);
          sliderText.attr("x", newX - 100);
        })
        .on('start', () => sliderLine.attr('stroke', 'red'))
        .on('end', () => sliderLine.attr('stroke', 'black'))
        );
    
    // Add text element to display slider position
    const sliderText = svg.append("text")
      .attr("class", "slider-text")
      .attr("x", interventionSlider? interventionSlider: innerWidth / 2 - 100)
      .attr("y", innerHeight + 40)
      .text(`Intervention Day: ${interventionSlider ? xScaleTime.invert(interventionSlider) : 
        xScaleTime.invert(innerWidth / 2)}`);               



}


const BarChart = ({ y, tmax, xmax, deaths, 
                    total, vline, timestep, 
                    total_infected, N, ymax, 
                    InterventionTime, colors, log, 
                    checked }) => {

    const size = useWindowSize();
    const svg = useRef(null);
    const [interventionSlider, setInterventionSlider] = useState(null);

    // useEffect(() => {
    //     console.log("y: ", y)
    //     console.log(size.width, size.height)
    // }, [size.width, size.height])

    useEffect(() => {
        // drawChart(svg, width*0.5, height*0.5);
        if (size.width && size.height) {
        drawChart(y, checked, svg, size.width*0.7, size.height*0.8, 
              tmax, xmax, deaths, 
              total, vline, timestep, 
              total_infected, N, ymax, 
              InterventionTime, colors, log, interventionSlider, setInterventionSlider);
        }
    }, [svg, y, size.width, size.height]);

  //   useEffect(() => {
  //     // drawChart(svg, width*0.5, height*0.5);
  //     drawChart(y, svg, size.width*0.8, size.height);
  // }, [size.width, size.height, svg]);


    return (
      <div id="chart">
        { size.width && size.height ? 
          <svg ref={svg} width={size.width*0.7} 
                        height={size.height*0.8}/> 
                        : null }
      </div>
      );
}

export default BarChart;