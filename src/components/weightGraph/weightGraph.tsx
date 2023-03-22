import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { NumberValue } from "d3";

type Props = {
  data: { date: string; weight: number }[];
};

const WeightGraph: React.FC<Props> = ({ data }) => {
  const graphRef = useRef<SVGSVGElement>(null);
  const screenWidth = window.innerWidth;
  const width = screenWidth <= 640 ? screenWidth * 2 : 800;
  const height = screenWidth <= 640 ? window.innerHeight - 150 : 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };

  const handleMouseOver = (
    e: MouseEvent,
    d: { date: string; weight: number }
  ) => {
    const tooltip = d3.select("#tooltip");
    tooltip
      .style("display", "block")
      .html(
        `Date: ${d3.timeFormat("%Y-%m-%d")(
          new Date(d.date)
        )}<br/>Weight: ${d.weight.toFixed(2)} kg`
      )
      .style("left", e.clientX - 450 + "px")
      .style("top", e.clientY - 200 + "px");
  };

  const handleMouseOut = () => {
    d3.select("#tooltip").style("display", "none");
  };

  useEffect(() => {
    if (!graphRef.current || data.length === 0) return;

    d3.select(graphRef.current).selectAll("*").remove();
    const makeXGridlines = () => d3.axisBottom(xScale).ticks(width / 80);
    const makeYGridlines = () => d3.axisLeft(yScale);

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
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("z-index", 0)
      .attr("d", line);

    // Draw axes
    const xAxis = (g: any) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(((d: Date) => d3.timeFormat("%Y-%m-%d")(d)) as (
              domainValue: Date | NumberValue,
              index: number
            ) => string)
        )
        .call((g: any) =>
          g
            .select(".tick:first-of-type text")
            .clone()
            .attr("y", 10)
            .attr("x", -50)
            .attr("text-anchor", "end")
            .attr("font-weight", "bold")
            .text("Date")
        )
        .call((g: any) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("y2", -(height - margin.top - margin.bottom))
            .attr("stroke-opacity", 0.1)
            .attr("stroke-dasharray", "2,2")
        );

    const yAxis = (g: any) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .call((g: any) =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Weight (kg)")
        )
        .call((g: any) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("x2", width - margin.left - margin.right)
            .attr("stroke-opacity", 0.1)
            .attr("stroke-dasharray", "2,2")
        );

    d3.select(graphRef.current).append("g").call(xAxis);
    d3.select(graphRef.current).append("g").call(yAxis);
    d3.select(graphRef.current)
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(new Date(d.date)))
      .attr("cy", (d) => yScale(d.weight))
      .attr("r", 5)
      .attr("fill", "red")
      .attr("width", 20)
      .attr("height", 20)
      .attr("z-index", 10)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("touchstart", (event, d) => {
        event.preventDefault();
        handleMouseOver(event, d);
      })
      .on("touchend", (event) => {
        event.preventDefault();
        handleMouseOut();
      });
    console.log("rendered with new data");
  }, [data]);

  const aspectRatio = height / width;

  const parentDivStyle = {
    width: "100%",
    paddingBottom: `${aspectRatio * 100}%`,
    maxWidth: screenWidth <= 640 ? "100%" : 1300,
  };

  return (
    <div
      style={parentDivStyle} // Use the parentDivStyle object
      className="flex justify-center items-center bg-slate-300 rounded relative h-screen sm:h-full"
    >
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          background: "white",
          borderRadius: "5px",
          padding: "5px",
          boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        }}
      ></div>
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
            position: "relative",
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
