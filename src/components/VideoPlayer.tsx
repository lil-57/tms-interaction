import { usePoseAngleTracker, type AngleSnapshot } from "@/hooks/usePoseAngleTracker";
import { useEffect, useMemo } from "react";

type Props = {
  videoFile: File;
  videoRef: React.RefObject<HTMLVideoElement>;
  onDelete: () => void;
  setAngleData: React.Dispatch<React.SetStateAction<AngleSnapshot[]>>;
  onTimeChange: (time: number) => void;
  onEnded: () => void;
};

export const VideoPlayer = ({
  videoFile,
  videoRef,
  onDelete,
  setAngleData,
  onTimeChange,
  onEnded,
}: Props) => {
  const { angleData, setAngleData: internalSetAngleData } = usePoseAngleTracker(videoRef);
  const videoURL = useMemo(() => URL.createObjectURL(videoFile), [videoFile]);

  useEffect(() => {
    if (angleData.length > 0) {
      //const last = angleData[angleData.length - 1];
      setAngleData(angleData);
    }
  }, [angleData, setAngleData]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (video.currentTime === 0) {
        setAngleData([]);
        internalSetAngleData([]);
      }
    };

    const handleTimeUpdate = () => {
      onTimeChange(video.currentTime);
    };

    const handleEnded = () => {
      onEnded();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoRef, setAngleData, internalSetAngleData, onTimeChange, onEnded]);

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={videoURL}
        controls
        className="w-full max-w-4xl mx-auto"
      />
      <div className="flex justify-center">
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Supprimer la vidéo
        </button>
      </div>
    </div>
  );
};
