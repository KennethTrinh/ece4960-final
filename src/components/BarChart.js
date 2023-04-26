import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/BarChart.module.css'
import * as d3 from "d3";
import {brushX} from 'd3-brush';
import { useWindowSize, sum } from './utils';

// https://stackoverflow.com/questions/65625086/how-to-use-d3-with-reactjs-nextjs

function drawChart(y, checked, svgRef, width, height, 
                  tmax, xmax, deaths, total, vline, 
                  timestep, total_infected, N, ymax, 
                  InterventionTime, colors, log, setInterventionState,
                  interventionSlider, setInterventionSlider,
                  setActiveIndex, setActiveTime,
                  lock, setLock, Pmax, setPmax) {

  const svg = d3.select(svgRef.current);

  ymax = lock ? Pmax : ymax;
  
  const [m, n] = [y.length, y[0].length],
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
        
  const color = d3.scaleOrdinal()
                .domain(d3.range(n))
                .range(['rgba(56, 108, 176, 1)', 'rgba(141, 160, 203, 1 )',
                  'rgba(77, 175, 74, 1)', 'rgba(240, 2, 127, 1)', 'rgba(253, 192, 134, 1)',
                ]);
  //   y="{(function () { 
  //     var z = yScale( sum(y[i].slice(0,j+1), checked) ); 
  //     return Math.min(isNaN(z) ? 0: z, height - padding.top)
  //   })()  
  // }"
  const arr = y.map((row) => row.map((val, j) => val * (checked[j] ? 1 : 0))); // 110, 5
  
  // 5, 110, 2
  const y01z = d3.stack().keys(d3.range(n))(arr);

            
  const series = svg.selectAll(".series")
    .data(y01z);
  
  series.exit().remove(); // Remove old bars
  svg.selectAll(".axis").remove();
  svg.selectAll(".slider").remove();
  svg.selectAll(".slider-text").remove();
  svg.selectAll(".overlay").remove();
  
  // x-axis
  const xAxis = d3.axisBottom(xScaleTime)
    .tickSizeOuter(0)
    .tickSize(10)
    .tickFormat((d, i) => (i === 0 ? "Day " : "") + d);
    
  svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);
  
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
      .attr("y", d => !log ? yScale(d[1]) : ( () => {
          const z = yScale(d[1]);
          return Math.min( isNaN(z) ? 0 : z, innerHeight)
      })() )
      .attr("height", d => !log ? yScale(d[0]) - yScale(d[1]) : ( () => {
            const top = yScaleL(d[1] + 0.0001);
            const bottom = yScaleL(d[0] + 0.0001);
            const z = Math.min(top - bottom, innerHeight);
            const result = z + yScale( d[1] ) > innerHeight ? top : 
                      Math.max(isNaN(z) ? 0 : z, 0)
            return result > 0 ? result : 0;
      })() )
      .attr("id", (_, i) => i)

    // make overlay to detect when bars are hovered over
    svg.append("g")
        .attr("class", "overlay")
        .selectAll("rect")
        .data(y01z[0])
        .enter()
        .append("rect")
        .attr("x", (_, i) => xScale(i))
        .attr("y", 0)
        .attr("width", barWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent")
        .attr("id", (_, i) => `overlay-${i}`)
        .on("mouseover", (d) => {
          const element = d.target;
          const index = element.id.split("-")[1];
          const rects = document.querySelectorAll(`rect[id="${index}"]`);
          rects.forEach(rect => rect.style.fill = "rgba(0, 0, 0, 0.2)");
          rects.forEach(rect => rect.classList.add("hovered"));
          // console.log(index)
          // const tooltipData = y01z.map(series => series[index]);
          // console.log(tooltipData)
          setActiveIndex(index);
          setActiveTime(Math.round(indexToTime(index)));
      })
      .on("mouseout", function() {
        // Remove the fill
        d3.selectAll(".hovered").style("fill", null);
        
      });

  const sliderLine = svg.append("line")
      .attr("class", "slider")
      .attr("x1", interventionSlider ? interventionSlider : xScale(y.length/2))
      .attr("x2", interventionSlider ? interventionSlider : xScale(y.length/2))
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
            
            sliderText.text(`Intervention\n Day:\n ${Math.round(xScaleTime.invert(newX))}`);
            sliderText.attr("x", newX - 100);
            setInterventionState( Math.round(xScaleTime.invert(newX)) );
            
                      }
          )
          .on('start', () => {
                            setLock(true);
                            setPmax(ymax);
                        }
          )
          .on('end', () => {
                            setLock(false);
                        }
          )
        );
    
    // Add text element to display slider position
    const sliderText = svg.append("text")
      .attr("class", "slider-text")
      .attr("x", interventionSlider? interventionSlider - 100 : xScale(y.length/2) - 100)
      .attr("y", innerHeight + 40)
      .text(`Intervention Day: ${interventionSlider ? Math.round(xScaleTime.invert(interventionSlider)) : 
        Math.round(xScaleTime.invert(xScale(y.length/2)))}`);     

    // y-axis
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-width) 
        .tickPadding(5) // add space between tick labels and tick lines
        .ticks(5) // specify the number of ticks you want
        .tickFormat((d, i) => (i === 0 ? "" : d));
    const yAxisGroup = svg.append('g')
        .attr('class', 'axis y-axis')
        .attr('transform', `translate(${margin.left}, 0)`) // TODO: fix for bigger numbers
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


}


const BarChart = ({ y, tmax, xmax, deaths, 
                    total, vline, timestep, 
                    total_infected, N, ymax, 
                    InterventionTime, colors, log, 
                    checked, setInterventionState, 
                    setActiveIndex, setActiveTime }) => {

    const size = useWindowSize();
    const svg = useRef(null);
    const [interventionSlider, setInterventionSlider] = useState(null);
    const [lock, setLock] = useState(false);
    const [Pmax, setPMax] = useState(1);

    useEffect(() => {
        // drawChart(svg, width*0.5, height*0.5);
        if (size.width && size.height) {
          drawChart(y, checked, svg, size.width*0.75, size.height*0.9, 
                tmax, xmax, deaths, 
                total, vline, timestep, 
                total_infected, N, ymax, 
                InterventionTime, colors, log, setInterventionState,
                interventionSlider, setInterventionSlider, 
                setActiveIndex, setActiveTime,
                lock, setLock, Pmax, setPMax);
        }
    }, [svg, y, size.width, size.height, checked]);

    return (
      <div id="chart">
        { size.width && size.height ? 
          <svg ref={svg} width={size.width*0.75} 
                        height={size.height*0.9}/> 
                        : null }
      </div>
      );
}

export default BarChart;