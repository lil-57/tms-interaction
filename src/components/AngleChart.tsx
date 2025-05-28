import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import type { AngleSnapshot } from "@/hooks/usePoseAngleTracker";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type Props = {
  angleData: AngleSnapshot[];
  hiddenAngles: string[];
};

const COLORS = [
  "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099",
  "#3B3EAC", "#0099C6", "#DD4477", "#66AA00", "#B82E2E",
];

const getColor = (index: number) => COLORS[index % COLORS.length];

export const AngleChart: React.FC<Props> = ({ angleData, hiddenAngles }) => {
  const allAngles = [
    "leftElbow", "rightElbow", "leftWrist", "rightWrist",
    "leftKnee", "rightKnee", "neck", "back",
  ];

  const availableAngles = useMemo(() => {
    const found: Set<string> = new Set();
    angleData.forEach((snapshot) => {
      Object.entries(snapshot.angles).forEach(([key, value]) => {
        if (value !== null && !found.has(key)) found.add(key);
      });
    });
    return [...found];
  }, [angleData]);

  const missingAngles = allAngles.filter(
    (angle) => !availableAngles.includes(angle)
  );

  const datasets = allAngles
    .filter((angle) => !hiddenAngles.includes(angle))
    .map((angle, index) => ({
      label: angle,
      data: angleData.map((snap) => ({
        x: snap.time,
        y: snap.angles[angle] ?? null,
      })),
      borderColor: getColor(index),
      backgroundColor: getColor(index),
      borderWidth: 3, // plus épais
      pointRadius: 0, // lisse
      spanGaps: true,
    }));

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Temps (s)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Angle (°)",
        },
        min: 0,
        max: 180,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div id="chart" className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Graphique des angles</h2>
      <Line data={{ datasets }} options={options} />
      {missingAngles.length > 0 && (
        <p className="text-sm text-red-600 mt-2">
          Courbes non disponibles : {missingAngles.join(", ")}
        </p>
      )}
    </div>
  );
};
