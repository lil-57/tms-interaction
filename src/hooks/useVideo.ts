import { useState, useRef } from "react";

export const useVideo = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clearVideo = () => {
    setVideoFile(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return {
    videoFile,
    setVideoFile,
    videoRef,
    clearVideo,
  };
};
