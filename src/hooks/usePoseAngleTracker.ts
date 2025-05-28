// hooks/usePoseAngleTracker.ts
import { useEffect, useRef, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

const { movenet } = posedetection;

export type AngleSnapshot = {
  time: number;
  angles: {
    [key: string]: number | null;
  };
};

export const usePoseAngleTracker = (
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const [angleData, setAngleData] = useState<AngleSnapshot[]>([]);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const loadDetector = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      detectorRef.current = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: movenet.modelType.SINGLEPOSE_LIGHTNING }
      );

      console.log("✅ Détecteur initialisé");
    };

    loadDetector();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const getAngle = (
      a: posedetection.Keypoint,
      b: posedetection.Keypoint,
      c: posedetection.Keypoint
    ) => {
      if (!a || !b || !c || a.score! < 0.3 || b.score! < 0.3 || c.score! < 0.3)
        return null;

      const ab = [a.x - b.x, a.y - b.y];
      const cb = [c.x - b.x, c.y - b.y];
      const dot = ab[0] * cb[0] + ab[1] * cb[1];
      const magAB = Math.hypot(...ab);
      const magCB = Math.hypot(...cb);
      const angle = Math.acos(dot / (magAB * magCB));
      return (angle * 180) / Math.PI;
    };

    const extractAngles = (keypoints: posedetection.Keypoint[]) => {
      const keypointNames = [
        "nose", "leftEye", "rightEye", "leftEar", "rightEar",
        "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
        "leftWrist", "rightWrist", "leftHip", "rightHip",
        "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"
      ];

      const kp = Object.fromEntries(
        keypoints.map((k, i) => [keypointNames[i], k])
      );

      return {
        leftElbow: getAngle(kp["leftShoulder"], kp["leftElbow"], kp["leftWrist"]),
        rightElbow: getAngle(kp["rightShoulder"], kp["rightElbow"], kp["rightWrist"]),
        leftWrist: null,
        rightWrist: null,
        leftKnee: getAngle(kp["leftHip"], kp["leftKnee"], kp["leftAnkle"]),
        rightKnee: getAngle(kp["rightHip"], kp["rightKnee"], kp["rightAnkle"]),
        neck: getAngle(kp["leftShoulder"], kp["nose"], kp["rightShoulder"]),
        back: getAngle(kp["leftShoulder"], kp["leftHip"], kp["leftKnee"]),
      };
    };

    const analyze = async () => {
      if (!video || video.paused || video.ended || !detectorRef.current || !ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const poses = await detectorRef.current.estimatePoses(canvas);
      if (poses.length > 0) {
        const angles = extractAngles(poses[0].keypoints);
        const currentTime = Number(video.currentTime.toFixed(2));

        setAngleData((prev) => {
          const filtered = prev.filter((snap) => snap.time < currentTime);
          return [...filtered, { time: currentTime, angles }];
        });
      }
    };

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(analyze, 500);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    video.addEventListener("play", start);
    video.addEventListener("pause", stop);
    video.addEventListener("ended", stop);

    return () => {
      stop();
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
      video.removeEventListener("ended", stop);
    };
  }, [videoRef]);

  return { angleData, setAngleData };
};
