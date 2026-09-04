import { useRef } from "react";
import { Upload } from "lucide-react";
import "../components/CsvUpload.css";

interface CsvUploadProps {
  onUpload: (content: string) => void;
  error: string | null;
}

export function CsvUpload({ onUpload, error }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        onUpload(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        onUpload(text);
      }
    };
    reader.readAsText(file);
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
        aria-label="Upload CSV file"
      >
        <Upload size={32} className="csv-upload-icon" />
        <div className="csv-upload-title">Upload Student CSV</div>
        <div className="csv-upload-hint">
          Drop a .csv file here or click to browse
        </div>
        <div className="csv-upload-formats">
          Supports: Name-only, Roll+Name, Headerless CSV
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
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="csv-upload-input"
        aria-label="CSV file input"
      />
    </div>
  );
}
