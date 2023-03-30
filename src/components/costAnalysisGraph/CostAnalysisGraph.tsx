import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Tooltip from "../toolTip/ToolTip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../services/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  StorageReference,
  deleteObject,
} from "firebase/storage";
import { useParams } from "react-router-dom";

type Props = {
  data: MonthData[];
  setData: React.Dispatch<React.SetStateAction<MonthData[]>>;
} & React.SVGProps<SVGSVGElement>;

type CostData = {
  [key: string]: number;
  food: number;
  veterinary: number;
  insurance: number;
  other: number;
};

type MonthData = {
  month: string;
  totalSpent: number;
  costs: CostData;
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const CostAnalysisGraph: React.FC<Props> = ({ data, setData }) => {
  const graphRef = useRef<SVGSVGElement>(null);
  const screenWidth = window.innerWidth;
  const width = screenWidth <= 640 ? screenWidth * 2 : 800;
  const height = screenWidth <= 640 ? window.innerHeight - 150 : 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const petName = useParams<{ petName: string }>().petName;
  const [tooltipContent, setTooltipContent] = React.useState<
    React.ReactNode | string
  >();
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
  const handleMouseOver = (e: MouseEvent, category: string, value: number) => {
    setTooltipContent(
      <div className="bg-slate-100 absolute top-20 rounded-lg p-2 z-50">
        <p>{category} costs:</p>
        <span>{value.toFixed(2)} SEK</span>
      </div>
    );
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseOut = () => {
    setTooltipContent("");
  };

  const openDeleteDialog = (index: number) => {
    setDeleteDialogVisible(true);
    setDeleteIndex(index);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setDeleteIndex(null);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      handleDelete(deleteIndex);
    }
    closeDeleteDialog();
  };

  const handleDelete = async (index: number) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });

    const userId = auth.currentUser?.uid;

    if (userId !== null && userId !== undefined) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const pets = userDocSnap.data()?.pets || [];
        const petIndex = pets.findIndex(
          (pet: { name: string }) => pet.name === petName
        );

        if (petIndex !== -1) {
          const pet = pets[petIndex];
          const newCostData = [...pet.costData];
          newCostData.splice(index, 1);

          const updatedPets = [...pets];
          updatedPets[petIndex] = {
            ...pet,
            costData: newCostData,
          };

          await updateDoc(userDocRef, {
            pets: updatedPets,
          });
        }
      }
    }
  };
  useEffect(() => {
    if (!graphRef.current || data.length === 0) return;

    d3.select(graphRef.current).selectAll("*").remove();

    const categories = Object.keys(data[0].costs);

    const categoryScale = d3
      .scaleOrdinal<string, number>()
      .domain(categories)
      .range([0, 1, 2, 3]);

    const colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(categories)
      .range(["#1A237E", "#0D47A1", "#01579B", "#006064"]);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        (d3.max(data, (d) =>
          Math.max(d.totalSpent, d3.max(Object.values(d.costs)) as number)
        ) as number) * 1.2,
      ])
      .range([height - margin.bottom, margin.top]);

    const barWidth = xScale.bandwidth() / 4 - 2; // Subtract 2 to create a small gap between the bars

    // Draw bars
    const barGroups = d3
      .select(graphRef.current)
      .selectAll(".bar-group")
      .data(data.map((d, index) => ({ ...d, index })))
      .join("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${xScale(d.month) ?? 0},0)`);

    barGroups
      .append("rect")
      .attr("class", "total-bar")
      .attr(
        "x",
        xScale.bandwidth() / 2 -
          (barWidth * categories.length + (categories.length - 1) * 2) / 2
      )
      .attr("y", (d) => yScale(d.totalSpent))
      .attr("width", barWidth * categories.length + (categories.length - 1) * 2)
      .attr("height", (d) => yScale(0) - yScale(d.totalSpent))
      .attr("fill", "#0D87A1")
      .attr("z-index", -1)
      .on("mouseover", (e, d) => handleMouseOver(e, "Total", d.totalSpent))
      .on("mouseout", handleMouseOut);

    // Total bar labels
    barGroups
      .append("text")
      .attr("class", "total-bar-label")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.totalSpent) - 5)
      .text((d) => `Total: ${d.totalSpent.toFixed(2)} SEK`)
      .attr("font-size", "11px")
      .attr("text-anchor", "middle");

    barGroups
      .append("foreignObject")
      .attr("x", xScale.bandwidth() / 2 + 20)
      .attr("y", height - margin.bottom)
      .attr("width", 24)
      .attr("height", 24)
      .attr("class", "delete-icon")
      .html(
        ReactDOMServer.renderToString(
          <FontAwesomeIcon
            icon={faTrash}
            className=" text-slate-600 hover:text-red-600 cursor-pointer"
          />
        )
      )
      .on("click", (e, d) => {
        e.stopPropagation();
        openDeleteDialog(d.index);
      });

    // Bars for individual categories
    barGroups
      .selectAll(".bar")
      .data((d) => {
        const totalSpent = d.totalSpent;
        return categories.map((category) => {
          const value = d.costs[category];
          return {
            category: category,
            value: value,
            totalSpent: totalSpent,
          };
        });
      })
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => categoryScale(d.category) * (barWidth + 2))
      .attr("y", (d) => yScale(d.value))
      .attr("width", barWidth)
      .attr("height", (d) => yScale(0) - yScale(d.value))
      .attr("z-index", 1)
      .attr("fill", (d) => colorScale(d.category))
      .on("mouseover", (e, d) => handleMouseOver(e, d.category, d.value))
      .on("mouseout", handleMouseOut);

    // Add category labels to each bar
    barGroups
      .selectAll(".bar-label")
      .data((d) => {
        const totalSpent = d.totalSpent;
        return categories.map((category) => {
          const value = d.costs[category];
          return {
            category: category,
            value: value,
            totalSpent: totalSpent,
          };
        });
      })
      .join("text")
      .attr("class", "bar-label")
      .attr(
        "x",
        (d) =>
          (categoryScale(d.category) * xScale.bandwidth()) / 4 +
          xScale.bandwidth() / 8
      )
      .attr("y", (d) => yScale(d.value) - 5)
      .text((d) => d.category)
      .attr("font-size", "11px")
      .attr("text-anchor", "middle");

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
            .attr("y", -5)
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
      {tooltipContent && (
        <Tooltip content={tooltipContent} position={tooltipPosition} />
      )}
      {deleteDialogVisible && (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow">
            <p>Are you sure you want to delete this data entry?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-1 rounded mr-2"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={closeDeleteDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
