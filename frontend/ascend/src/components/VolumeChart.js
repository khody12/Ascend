import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const VolumeChart = ({ data }) => {
    const ref = useRef();

    useEffect(() => {
        const tooltip = d3.select(ref.current.parentNode)
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("backdrop-filter", "blur(5px)")
            .style("border-radius", "8px")
            .style("padding", "8px 12px")
            .style("color", "#fff")
            .style("font-size", "12px")
            .style("pointer-events", "none");

        const drawChart = () => {
            const svg = d3.select(ref.current);
            svg.selectAll("*").remove();

            const containerRect = svg.node().getBoundingClientRect();
            if (containerRect.width <= 0) return;

            const margin = { top: 20, right: 30, bottom: 40, left: 60 };
            const width = containerRect.width - margin.left - margin.right;
            const height = containerRect.height - margin.top - margin.bottom;

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
            
            // --- X Scale (Time) ---
            const xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.week))
                .range([0, width]);

            // --- Y Scale (Volume) ---
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.totalVolume) * 1.1]) // Start at 0, add 10% padding
                .range([height, 0]);

            // --- Axes ---
            g.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale).ticks(d3.timeWeek.every(1)).tickFormat(d3.timeFormat("%b %d")))
                .call(g => g.select(".domain").remove()) // Remove axis line for X-axis
                .selectAll("text").style("fill", "#888888");

            // --- Drawing Logic ---
            if (data.length < 2) {
                g.append("text")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#6b7280")
                    .text("Log more workouts to see your volume trend.");
            } else {
                // --- Grid lines drawn WITHOUT labels and WITHOUT the domain path ---
                g.append('g')
                    .attr('class', 'grid')
                    .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(""))
                    .call(g => g.select(".domain").remove()) // <-- THIS IS THE FIX
                    .selectAll(".tick line")
                        .attr("stroke-opacity", 0.1);
                
                // Define the area under the line
                const area = d3.area()
                    .x(d => xScale(d.week))
                    .y0(height)
                    .y1(d => yScale(d.totalVolume))
                    .curve(d3.curveMonotoneX);

                // Add the area path
                g.append("path")
                    .datum(data)
                    .attr("fill", "url(#volume-gradient)") // Use a gradient for the fill
                    .attr("d", area);

                const line = d3.line()
                    .x(d => xScale(d.week))
                    .y(d => yScale(d.totalVolume))
                    .curve(d3.curveMonotoneX);

                g.append('path')
                    .datum(data)
                    .attr('fill', 'none')
                    .attr('stroke', '#2ecc71') // A motivating green color
                    .attr('stroke-width', 2.5)
                    .attr('d', line);
                
                g.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(d.week))
                    .attr('cy', d => yScale(d.totalVolume))
                    .attr('r', 5)
                    .attr('fill', '#2ecc71')
                    .on("mouseover", (event, d) => {
                        tooltip.html(`<strong>${d.totalVolume.toLocaleString()} lbs</strong><br/>Week of ${d3.timeFormat("%b %d")(d.week)}`)
                            .style("visibility", "visible");
                    })
                    .on("mousemove", (event) => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
                    .on("mouseout", () => tooltip.style("visibility", "hidden"));
                
                // --- Draw the final Y-Axis on top of the grid and area chart ---
                g.append('g')
                    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d/1000}k`))
                    .call(g => g.select(".domain").remove()) // Remove the axis line itself
                    .selectAll("text").style("fill", "#888888");
            }
             // --- Gradient for the area fill ---
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "volume-gradient")
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "0%").attr("y2", "100%");
            gradient.append("stop").attr("offset", "0%").attr("stop-color", "#2ecc71").attr("stop-opacity", 0.4);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", "#2ecc71").attr("stop-opacity", 0);
        };

        if (data && data.length > 0) {
            drawChart();
        }

        window.addEventListener('resize', drawChart);
        return () => {
            window.removeEventListener('resize', drawChart);
            tooltip.remove();
        };
    }, [data]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg relative">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Volume Trend</h3>
            <svg ref={ref} style={{ width: '100%', height: '300px' }}></svg>
        </div>
    );
};

export default VolumeChart;