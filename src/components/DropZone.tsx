// components/DropZone.tsx
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type DropZoneProps = {
  onFileAccepted: (file: File) => void;
};

export const DropZone = ({ onFileAccepted }: DropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) onFileAccepted(acceptedFiles[0]);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition"
    >
      <input {...getInputProps()} />
      {isDragActive ? <p>Dépose la vidéo ici...</p> : <p>Glisse une vidéo ici ou clique pour sélectionner</p>}
    </div>
  );
};
