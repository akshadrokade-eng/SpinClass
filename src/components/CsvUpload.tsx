import { useRef } from "react";
import { Upload } from "lucide-react";
import { parseFile } from "../utils/csvParser";
import type { Student } from "../types";
import "../components/CsvUpload.css";

interface CsvUploadProps {
  onUpload: (students: Student[]) => void;
  error: string | null;
}

export function CsvUpload({ onUpload, error }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const binaryExts = ["xlsx", "xls"];

    if (binaryExts.includes(ext)) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          let binary = "";
          for (let i = 0; i < data.byteLength; i++) {
            binary += String.fromCharCode(data[i]);
          }
          const base64 = btoa(binary);
          const students = parseFile(base64, file.name, true);
          onUpload(students);
        } catch {
          onUpload([]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result;
          if (typeof text !== "string") return;
          const students = parseFile(text, file.name);
          onUpload(students);
        } catch {
          onUpload([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="csv-upload-container">
      <div
        className="csv-upload-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload student file"
      >
        <Upload size={32} className="csv-upload-icon" />
        <div className="csv-upload-title">Upload Student File</div>
        <div className="csv-upload-hint">
          Drop a file here or click to browse
        </div>
        <div className="csv-upload-formats">
          CSV, TSV, TXT, JSON, XLSX, XLS
        </div>
      </div>
      {error && (
        <div className="csv-upload-error" role="alert">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt,.json,.xlsx,.xls"
        onChange={handleFileChange}
        className="csv-upload-input"
        aria-label="Student file input"
      />
    </div>
  );
}
