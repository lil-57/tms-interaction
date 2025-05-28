import React from "react";
import type { AngleSnapshot } from "@/hooks/usePoseAngleTracker";

type Props = {
  angleData: AngleSnapshot[];
};

export const AngleTable: React.FC<Props> = ({ angleData }) => {
  if (!angleData.length) {
    return (
      <div id="table" className="bg-white rounded shadow p-4 mt-6">
        <p className="text-center text-gray-500">Aucune donnée disponible pour le tableau.</p>
      </div>
    );
  }

  const maxAngles: Record<string, { angle: number; time: number }> = {};

  angleData.forEach(({ time, angles }) => {
    for (const [joint, value] of Object.entries(angles)) {
      if (value !== null && (!maxAngles[joint] || value > maxAngles[joint].angle)) {
        maxAngles[joint] = { angle: value, time };
      }
    }
  });

  return (
    <div id="table" className="bg-white rounded shadow p-4 mt-6 overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Angles maximaux par articulation</h2>
      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Articulation</th>
            <th className="border px-4 py-2">Angle max (°)</th>
            <th className="border px-4 py-2">Temps (s)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(maxAngles).map(([joint, { angle, time }]) => (
            <tr key={joint}>
              <td className="border px-4 py-2">{joint}</td>
              <td className="border px-4 py-2">{angle.toFixed(1)}</td>
              <td className="border px-4 py-2">{time.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
