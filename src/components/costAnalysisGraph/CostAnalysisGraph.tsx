import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type Props = {
  data: {
    month: string;
    totalSpent: number;
    costs: {
      food: number;
      veterinary: number;
      insurance: number;
      other: number;
    };
  }[];
} & React.SVGProps<SVGSVGElement>;

const CostAnalysisGraph: React.FC<Props> = ({ data }) => {
  const graphRef = useRef<SVGSVGElement>(null);
  const screenWidth = window.innerWidth;
  const width = screenWidth <= 640 ? screenWidth * 2 : 800;
  const height = screenWidth <= 640 ? window.innerHeight - 150 : 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };

  const handleMouseOver = (
    e: MouseEvent,
    d: {
      month: string;
      totalSpent: number;
      costs: {
        food: number;
        veterinary: number;
        insurance: number;
        other: number;
      };
    }
  ) => {
    const tooltip = d3.select("#tooltip");
    tooltip
      .style("display", "block")
      .html(
        `Month: ${d.month}<br/>Food: ${d.costs.food.toFixed(2)} SEK
        <br/>Veterinary: ${d.costs.veterinary.toFixed(2)} SEK
        <br/>Insurance: ${d.costs.insurance.toFixed(2)} SEK
        <br/>Other: ${d.costs.other.toFixed(2)} SEK
        <br/>Total cost: ${d.totalSpent.toFixed(2)} SEK`
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

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .paddingInner(0.5)
      .paddingOuter(0.25);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalSpent) as number])
      .range([height - margin.bottom, margin.top]);

    // Draw bars
    d3.select(graphRef.current)
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.month) || 0)
      .attr("y", (d) => yScale(d.totalSpent))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.totalSpent))
      .attr("fill", "steelblue")
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

    // Draw axes
    const xAxis = (g: any) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .call((g: any) =>
          g
            .select(".tick:first-of-type text")
            .clone()
            .attr("y", 10)
            .attr("x", -50)
            .attr("text-anchor", "end")
            .attr("font-weight", "bold")
            .text("Month")
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
            .attr("y", -15)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Total Spent in SEK")
        );

    d3.select(graphRef.current).append("g").call(xAxis);
    d3.select(graphRef.current).append("g").call(yAxis);
  }, [data]);

  const aspectRatio = height / width;

  const parentDivStyle = {
    width: "100%",
    paddingBottom: `${aspectRatio * 100}%`,
    maxWidth: screenWidth <= 640 ? "100%" : 1300,
  };

  return (
    <div
      style={parentDivStyle}
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
        className="h-full"
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
export default CostAnalysisGraph;
