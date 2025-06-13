import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const WeightChart = ({ data, onLogWeightClick }) => {
    const ref = useRef();

    useEffect(() => {
        // --- Tooltip Setup ---
        // We create the tooltip once and hide/show it.
        // Appending to the chart's parent div is better than appending to the body.
        const tooltip = d3.select(ref.current.parentNode)
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("backdrop-filter", "blur(5px)")
            .style("border", "1px solid #444")
            .style("border-radius", "8px")
            .style("padding", "8px 12px")
            .style("color", "#fff")
            .style("font-size", "12px")
            .style("pointer-events", "none"); // Prevent tooltip from blocking mouse events

        const drawChart = () => {
            const svg = d3.select(ref.current);
            svg.selectAll("*").remove(); // Clear previous chart

            // --- MORE RELIABLE MEASUREMENT ---
            // Use getBoundingClientRect to get the true rendered size of the SVG.
            const containerRect = svg.node().getBoundingClientRect();
            if (containerRect.width <= 0) {
                // If the container has no width yet, stop and wait for the next render.
                return;
            }

            const margin = { top: 20, right: 30, bottom: 40, left: 50 };
            const width = containerRect.width - margin.left - margin.right;
            const height = containerRect.height - margin.top - margin.bottom;

            // --- Data and Scales (with fixed 30-day domain) ---
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            const parseDate = d3.timeParse("%Y-%m-%d");
            const chartData = data
                .map(d => ({
                    date: parseDate(d.date_recorded),
                    weight: +d.weight
                }))
                .filter(d => d.date >= thirtyDaysAgo && d.date <= today)
                .sort((a, b) => a.date - b.date);
            
            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
            
            const xScale = d3.scaleTime()
                .domain([thirtyDaysAgo, today])
                .range([0, width]);

            const yDomain = chartData.length > 0
                ? [d3.min(chartData, d => d.weight) - 5, d3.max(chartData, d => d.weight) + 5]
                : [150, 200]; 

            const yScale = d3.scaleLinear()
                .domain(yDomain)
                .range([height, 0]);

            // --- Axes ---
            g.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale).ticks(d3.timeWeek.every(1)).tickFormat(d3.timeFormat("%b %d")))
                .selectAll("text").style("fill", "#888888");
            g.selectAll(".domain").attr("stroke", "#444444");
            g.selectAll(".tick line").attr("stroke", "#444444");

            // --- Drawing Logic ---
            if (chartData.length < 2) {
                g.append("text")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#6b7280")
                    .text(chartData.length === 1 ? "Add one more entry to see your chart." : "No weight data in the last 30 days.");
            } else {
                g.append('g')
                    .attr('class', 'grid')
                    .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(""))
                    .selectAll(".tick line")
                        .attr("stroke-opacity", 0.1)
                        .attr("stroke-dasharray", "2,2");
                g.select(".grid .domain").remove();

                const line = d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.weight))
                    .curve(d3.curveMonotoneX);

                g.append('path')
                    .datum(chartData)
                    .attr('fill', 'none')
                    .attr('stroke', '#3498db')
                    .attr('stroke-width', 2.5)
                    .attr('d', line);
                
                // Add circles with tooltip events
                g.selectAll('circle')
                    .data(chartData)
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(d.date))
                    .attr('cy', d => yScale(d.weight))
                    .attr('r', 5)
                    .attr('fill', '#3498db')
                    .attr('stroke', '#1f2937')
                    .attr('stroke-width', 2)
                    .on("mouseover", (event, d) => {
                        tooltip.html(`<strong>${d.weight.toFixed(1)} lbs</strong><br/>${d3.timeFormat("%b %d, %Y")(d.date)}`)
                            .style("visibility", "visible");
                    })
                    .on("mousemove", (event) => {
                        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                    });

                g.append('g')
                    .call(d3.axisLeft(yScale).ticks(5))
                    .selectAll("text").style("fill", "#888888");
                g.selectAll(".domain").remove();
            }
        };

        drawChart(); // Initial draw

        // --- Handle Resizing ---
        // Redraw the chart whenever the window is resized
        window.addEventListener('resize', drawChart);

        // --- Cleanup Function ---
        // This runs when the component unmounts
        return () => {
            window.removeEventListener('resize', drawChart);
            // Remove the tooltip when the chart is destroyed
            tooltip.remove();
        };

    }, [data]); // Effect re-runs when data prop changes

    return (
        <div className="bg-gray-800 p-4 rounded-lg  relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Your Weight</h3>
                <button 
                    onClick={onLogWeightClick}
                    className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
                    title="Log new weight entry"
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
            {/* The ref is attached to the SVG element */}
            <svg ref={ref} style={{ width: '100%', height: '300px' }}></svg>
        </div>
    );
};

export default WeightChart;