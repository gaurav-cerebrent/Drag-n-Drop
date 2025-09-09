import React, { useState } from "react";
import "./FileUploader.css";

type FileWithPreview = {
  file: File;
  preview: string;
};

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };


  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="upload-container">

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>Drag & Drop your files here</p>
        <span>or</span>
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleBrowse}
          style={{ display: "none" }}
        />
        <label htmlFor="fileInput" className="browse-btn">
          Browse Files
        </label>
      </div>

      <div className="file-list">
        <h3>Files Ready to Upload</h3>
        <ul>
          {files.map((item, index) => (
            <li key={index}>
              <strong>{item.file.name}</strong> ({(item.file.size / 1024).toFixed(2)} KB)
              <button
                style={{
                  marginLeft: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => removeFile(index)}
              >
                ❌ Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileUploader;
