"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import {
  BsFiletypeCsv,
  BsFiletypePdf,
  BsFiletypeDocx,
  BsFiletypeTxt,
} from "react-icons/bs";
import { PiFileDoc } from "react-icons/pi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile);
      await handleFileUpload(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    console.log("File removed");
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <BsFiletypePdf className="w-12 h-12 mb-4 text-white" />;
      case "docx":
        return <BsFiletypeDocx className="w-12 h-12 mb-4 text-white" />;
      case "doc":
        return <PiFileDoc className="w-12 h-12 mb-4 text-white" />;
      case "txt":
        return <BsFiletypeTxt className="w-12 h-12 mb-4 text-white" />;
      default:
        return <BsFiletypeCsv className="w-12 h-12 mb-4 text-white" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1048576).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleFileUpload = async (selectedFile: File) => {
    try {
      console.log("Requesting presigned URL for file:", selectedFile.name);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url, fields } = await response.json();

      console.log("Received presigned URL:", url);
      console.log("Received fields:", fields);

      const formData = new FormData();
      Object.keys(fields).forEach((key) => {
        formData.append(key, fields[key]);
      });

      formData.append("file", selectedFile);

      console.log("FormData prepared for upload:", formData);

      console.log("Uploading file to S3 with URL:", url);
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        toast.success("Resume uploaded successfully!");
      } else {
        throw new Error("Upload to S3 failed");
      }
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      console.log("File dropped:", droppedFile);
      await handleFileUpload(droppedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4 mt-5">
      {file && (
        <div className="w-full text-left">
          <p className="text-sm font-medium text-white break-words">
            {file.name}
          </p>
          <div className="flex flex-col items-start space-y-2 mt-2">
            <p className="text-xs text-gray-400">
              Size: {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-gray-400">
              Last Modified: {formatDate(file.lastModified)}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => window.open(URL.createObjectURL(file), "_blank")}
              >
                View your resume
              </button>
              <p className="text-xs text-gray-400">or upload a new one</p>
            </div>
          </div>
        </div>
      )}
      <div className="w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition-colors relative"
        >
          {file && (
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={handleRemoveFile}
              aria-label="Remove file"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
          {file ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {getFileIcon(file)}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <p className="text-sm text-white mr-1">{file.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-400">(</span>
                  <button
                    className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                    onClick={() =>
                      window.open(URL.createObjectURL(file), "_blank")
                    }
                  >
                    preview
                  </button>
                  <span className="text-sm text-gray-400">)</span>
                </div>
                <div className="flex flex-col items-center space-y-1 sm:space-y-0 sm:flex-row sm:space-x-2">
                  <span className="text-xs text-gray-400">or</span>
                  <span className="text-sm text-blue-500 hover:text-blue-700 font-semibold">
                    Upload new file
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <BsFiletypeCsv className="w-12 h-12 mb-4 text-white" />
              <p className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-400">
                Accepted file types: PDF, DOCX, DOC, TXT (MAX. 10 MB)
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {file && (
        <div className="mt-4 flex items-center justify-end w-full">
          <div className="bottom-4 right-4 p-2 rounded-md">
            <button
              className="text-gray-400 text-sm font-semibold"
              onClick={handleRemoveFile}
            >
              Remove your resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;