"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ActionButton";

interface EvidenceUploadProps {
  onFileSelect: (file: File | null) => void;
}

const EvidenceUpload = ({ onFileSelect }: EvidenceUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setFileName(null);
      onFileSelect(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File exceeds the 50MB size limit");
      return;
    }

    setFileName(file.name);
    onFileSelect(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="w-full h-[272.5px] bg-[#201F1F] border border-[#444933] flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-stake-accent/40 transition-colors overflow-hidden relative"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.mp4"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : fileName ? (
        <div className="text-center z-10">
          <svg className="w-[33px] h-6 text-stake-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-stake-textLight text-sm">{fileName}</p>
        </div>
      ) : (
        <>
          <svg className="w-[33px] h-6 text-stake-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-center">
            <p className="text-stake-textLight text-base">Drag and drop visual evidence</p>
            <Button type="button" variant="outline-lime" className="mt-4">
              Browse Files
            </Button>
            <p className="mt-3 text-[11px] text-stake-muted tracking-widest">
              JPG, PNG OR MP4 (MAX 50MB)
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EvidenceUpload;
