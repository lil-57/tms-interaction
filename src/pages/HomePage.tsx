import React, { useState, useMemo } from "react";
import { DropZone } from "@/components/DropZone";
import { VideoPlayer } from "@/components/VideoPlayer";
import { AngleChart } from "@/components/AngleChart";
import { AngleTable } from "@/components/AngleTable";
import { useVideo } from "@/hooks/useVideo";
import { exportToPDF } from "@/utils/exportToPDF";
import type { AngleSnapshot } from "@/hooks/usePoseAngleTracker";

const allAngles = [
  "leftElbow", "rightElbow", "leftWrist", "rightWrist",
  "leftKnee", "rightKnee", "neck", "back",
];

export const HomePage: React.FC = () => {
  const { videoFile, setVideoFile, videoRef, clearVideo } = useVideo();
  const [angleData, setAngleData] = useState<AngleSnapshot[]>([]);
  const [hiddenAngles, setHiddenAngles] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoWatchedToEnd, setVideoWatchedToEnd] = useState(false);

  const toggleAngle = (angle: string) => {
    setHiddenAngles((prev) =>
      prev.includes(angle)
        ? prev.filter((a) => a !== angle)
        : [...prev, angle]
    );
  };

  const visibleAngleData = useMemo(() => {
    return angleData.filter((d) => d.time <= currentTime);
  }, [angleData, currentTime]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Analyse des angles</h1>

      {!videoFile ? (
        <DropZone onFileAccepted={setVideoFile} />
      ) : (
        <VideoPlayer
          videoFile={videoFile}
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          onDelete={clearVideo}
          setAngleData={setAngleData}
          onTimeChange={(t) => setCurrentTime(t)}
          onEnded={() => setVideoWatchedToEnd(true)}
        />
      )}

      {videoFile && (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {allAngles.map((angle) => (
              <label key={angle} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hiddenAngles.includes(angle)}
                  onChange={() => toggleAngle(angle)}
                />
                {angle}
              </label>
            ))}
          </div>

          <div id="chart">
            <AngleChart angleData={visibleAngleData} hiddenAngles={hiddenAngles} />
          </div>

          <div id="table">
            <AngleTable angleData={visibleAngleData} />
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <button
              onClick={() => exportToPDF(document.getElementById("chart")!, "graphique")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!videoWatchedToEnd}
            >
              Télécharger le graphique
            </button>
            <button
              onClick={() => exportToPDF(document.getElementById("table")!, "tableau")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={!videoWatchedToEnd}
            >
              Télécharger le tableau
            </button>
            <button
              onClick={() =>
                exportToPDF(
                  [document.getElementById("chart"), document.getElementById("table")],
                  "graphique_et_tableau"
                )
              }
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={!videoWatchedToEnd}
            >
              Télécharger les deux
            </button>
          </div>
        </>
      )}
    </div>
  );
};
