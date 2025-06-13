import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const WeightChart = ({ data, onLogWeightClick }) => {
    // useRef is used to get a reference to the <svg> element in the DOM
    const ref = useRef();

    useEffect(() => {
        // Guard clause: If there's no data or not enough data, do nothing.
        if (!data || data.length < 2) {
            const svg = d3.select(ref.current);
            svg.selectAll("*").remove(); // Clear previous chart
            // Optional: Display a message
            svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .attr("fill", "grey")
                .text("Not enough data to display a chart.");
            return;
        }

        // --- Data Parsing ---
        // D3 works best with its own time format. We parse our date strings.
        const parseDate = d3.timeParse("%Y-%m-%d");
        const chartData = data.map(d => ({
            date: parseDate(d.date_recorded),
            weight: +d.weight // The '+' converts the string to a number
        })).sort((a, b) => a.date - b.date); // Sort data by date just in case

        // --- D3 Setup ---
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove(); // Clear previous chart before drawing

        // Define dimensions and margins for the chart
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = parseInt(svg.style('width')) - margin.left - margin.right;
        const height = parseInt(svg.style('height')) - margin.top - margin.bottom;

        // Create the main 'g' element to hold the chart, applying margins
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // --- Scales ---
        // X Scale: Maps dates to horizontal positions
        const xScale = d3.scaleTime()
            .domain(d3.extent(chartData, d => d.date)) // Input domain: min to max date
            .range([0, width]); // Output range: pixel width of the chart

        // Y Scale: Maps weights to vertical positions
        const yScale = d3.scaleLinear()
            .domain([d3.min(chartData, d => d.weight) - 5, d3.max(chartData, d => d.weight) + 5]) // Input domain: min to max weight with some padding
            .range([height, 0]); // Output range: pixel height (inverted for SVG)

        // --- Axes ---
        // X Axis
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d")))
            .selectAll("text")
                .style("fill", "#888888"); // Style tick labels
        g.selectAll(".domain, .tick line").attr("stroke", "#444444"); // Style axis lines

        // Y Axis
        g.append('g')
            .call(d3.axisLeft(yScale).ticks(5))
            .selectAll("text")
                .style("fill", "#888888"); // Style tick labels
        g.selectAll(".domain, .tick line").attr("stroke", "#444444");
        
        // Add Y-axis grid lines
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(""))
            .selectAll(".tick line")
                .attr("stroke-opacity", 0.1)
                .attr("stroke-dasharray", "2,2");
        g.select(".grid .domain").remove();


        // --- Line Generator ---
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.weight))
            .curve(d3.curveMonotoneX); // Makes the line smooth

        // --- Drawing the Chart ---
        // Draw the line path
        g.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', '#3498db') // Our blue accent color
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // --- Tooltip for Interactivity ---
        const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "#2d3436")
            .style("border-radius", "5px")
            .style("padding", "8px 12px")
            .style("color", "#fff")
            .style("font-size", "12px");
            
        // Add circles for each data point
        g.selectAll('circle')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.weight))
            .attr('r', 5)
            .attr('fill', '#3498db')
            .attr('stroke', '#121212') // A dark stroke to pop against the line
            .attr('stroke-width', 2)
            .on("mouseover", (event, d) => {
                tooltip.html(`<strong>${d.weight.toFixed(1)} lbs</strong><br/>${d3.timeFormat("%b %d, %Y")(d.date)}`)
                       .style("visibility", "visible");
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

    }, [data]); // This useEffect runs whenever the `data` prop changes

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            {/* Use flexbox to align the title and the new button */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Weight History</h3>
                
                {/* THIS IS THE NEW BUTTON */}
                <button 
                    onClick={onLogWeightClick}
                    className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
                    title="Log new weight entry"
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
            <svg ref={ref} style={{ width: '100%', height: '300px' }}></svg>
        </div>
    );
};

export default WeightChart;