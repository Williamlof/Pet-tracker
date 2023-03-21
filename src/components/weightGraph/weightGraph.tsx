import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type Props = {
  data: { date: string; weight: number }[];
};

const WeightGraph: React.FC<Props> = ({ data }) => {
  const graphRef = useRef<SVGSVGElement>(null);
  const screenWidth = window.innerWidth;
  const width = screenWidth <= 640 ? screenWidth * 2 : 800;
  const height = screenWidth <= 640 ? window.innerHeight - 150 : 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  useEffect(() => {
    if (!graphRef.current || data.length === 0) return;

    // Set up dimensions and margins

    // Set up scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.weight) as number])
      .range([height - margin.bottom, margin.top]);

    // Draw line
    const line = d3
      .line<{ date: string; weight: number }>()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.weight));

    d3.select(graphRef.current)
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Draw axes
    const xAxis = (g: any) =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(xScale)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    const yAxis = (g: any) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .call((g: any) => g.select(".domain").remove())
        .call((g: any) =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Weight (kg)")
        );

    d3.select(graphRef.current).append("g").call(xAxis);
    d3.select(graphRef.current).append("g").call(yAxis);
  }, [data]);

  const aspectRatio = height / width;

  const parentDivStyle = {
    width: "100%",
    paddingBottom: `${aspectRatio * 100}%`,
    maxWidth: screenWidth <= 640 ? "100%" : width,
  };

  return (
    <div
      style={parentDivStyle} // Use the parentDivStyle object
      className="flex justify-center items-center bg-slate-300 rounded relative h-screen sm:h-full"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflowX: "scroll",
        }}
        className=" h-full"
      >
        <div
          style={{
            minWidth: screenWidth <= 640 ? width : "100%",
            minHeight: screenWidth <= 640 ? height : "100%",
          }}
        >
          <svg
            ref={graphRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              position: "absolute",
              width: screenWidth <= 640 ? width : "100%",
              height: "100%",
            }}
          ></svg>
        </div>
      </div>
    </div>
  );
};

export default WeightGraph;
