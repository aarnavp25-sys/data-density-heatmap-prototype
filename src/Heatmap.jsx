import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Heatmap = () => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);

  // Generate 10x10 grid of random data
  useEffect(() => {
    const gridData = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        gridData.push({
          row,
          col,
          value: Math.floor(Math.random() * 101)
        });
      }
    }
    setData(gridData);
  }, []);

  useEffect(() => {
    if (data.length === 0 || !d3Container.current) return;

    // Dimensions
    const width = 400;
    const height = 400;
    const cellSize = 38;
    const cellSpacing = 2; // small spacing between cells

    // Select the container and clear previous SVG
    const svg = d3.select(d3Container.current);
    svg.selectAll('*').remove();

    // Create SVG element
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Color scale: Light color to Dark blue
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0, 100]);

    // Tooltip setup
    // Use a floating div for the tooltip since it follows the mouse
    let tooltip = d3.select('body').select('.heatmap-tooltip');
    
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'heatmap-tooltip')
        .style('position', 'absolute')
        .style('background', '#333')
        .style('color', '#fff')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('font-size', '13px')
        .style('font-weight', '500')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('transition', 'opacity 0.2s')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
    }

    // Draw rectangles
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => d.col * (cellSize + cellSpacing))
      .attr('y', d => d.row * (cellSize + cellSpacing))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 4) // simple rounded corners for aesthetics
      .attr('ry', 4)
      // Optional smooth hover interaction added via D3 transitions
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight cell
        d3.select(this)
          .transition()
          .duration(150)
          .attr('transform', `translate(-2, -2)`)
          .attr('width', cellSize + 4)
          .attr('height', cellSize + 4)
          .style('filter', 'drop-shadow(0px 4px 4px rgba(0,0,0,0.2))');
          
        tooltip.style('opacity', 1)
               .html(`Density: ${d.value}%`)
               .style('left', (event.pageX + 15) + 'px')
               .style('top', (event.pageY + 15) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 15) + 'px')
               .style('top', (event.pageY + 15) + 'px');
      })
      .on('mouseout', function() {
        // Remove highlight
        d3.select(this)
          .transition()
          .duration(150)
          .attr('transform', `translate(0, 0)`)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .style('filter', 'none');
          
        tooltip.style('opacity', 0);
      });

    // Cleanup tooltip on unmount
    return () => {
      d3.select('.heatmap-tooltip').remove();
    };
  }, [data]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a1a1a' }}>Data Density Heatmap (Prototype)</h1>
      <svg ref={d3Container} style={{ overflow: 'visible' }}></svg>
    </div>
  );
};

export default Heatmap;
