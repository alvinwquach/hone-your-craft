"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTimes } from "react-icons/fa";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";
import { PiFileDoc } from "react-icons/pi";
import { TbFileCv } from "react-icons/tb";

interface ResumeData {
  id?: string;
  name?: string;
  url?: string;
}

interface ResumeUploadProps {
  resumeData: ResumeData | null;
  isLoading: boolean;
}

const ResumeUpload = ({ resumeData, isLoading }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setIsUploading(true);
    setFile(selectedFile);
    try {
      if (resumeData?.id) {
        await handleFileUpdate(selectedFile);
      } else {
        await handleFileUpload(selectedFile);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!resumeData?.id) {
      toast.error("Document ID is missing. Unable to delete the document.");
      return;
    }
    setIsUploading(true);
    try {
      const response = await fetch(`/api/documents/${resumeData.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
      setFile(null);
      toast.success("Your resume has been removed successfully.");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File | { name: string } | null | undefined) => {
    if (!file || !("name" in file)) {
      return <CiFileOn className="w-12 h-12 mb-4 text-blue-600" />;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <BsFiletypePdf className="w-12 h-12 mb-4 text-blue-600" />;
      case "docx":
        return <BsFiletypeDocx className="w-12 h-12 mb-4 text-blue-600" />;
      case "doc":
        return <PiFileDoc className="w-12 h-12 mb-4 text-blue-600" />;
      case "txt":
        return <BsFiletypeTxt className="w-12 h-12 mb-4 text-blue-600" />;
      default:
        return <CiFileOn className="w-12 h-12 mb-4 text-blue-600" />;
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    setIsUploading(true);
    try {
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
      const formData = new FormData();
      Object.keys(fields).forEach((key) => {
        formData.append(key, fields[key]);
      });
      formData.append("file", selectedFile);
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
      setIsUploading(false);
    }
  };

  const handleFileUpdate = async (selectedFile: File) => {
    if (!resumeData?.id) {
      toast.error("No resume found to update.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`/api/documents/${resumeData.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to update resume.");
      }
      const responseData = await response.json();
      toast.success("Resume updated successfully!");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
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
    if (!droppedFile) return;
    setIsUploading(true);
    setFile(droppedFile);
    try {
      if (resumeData?.id) {
        await handleFileUpdate(droppedFile);
      } else {
        await handleFileUpload(droppedFile);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-6 p-6 sm:p-8 mt-4 sm:mt-0 border border-zinc-700 rounded-lg max-w-[calc(100vw-13rem)] mx-auto">
      <div className="w-full lg:w-[300px]">
        <h2 className="text-base font-semibold text-white mb-2">
          Upload your resume
        </h2>
        <p className="text-gray-300 text-sm">
          File types: PDF, DOCX, DOC, TXT (MAX. 10 MB)
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center w-full space-y-4 mt-4 lg:mt-0"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="w-full text-left mb-4 animate-pulse">
            <div className="h-4 w-48 bg-zinc-700 rounded mb-2"></div>
            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
          </div>
        ) : resumeData?.name ? (
          <div className="w-full text-left mb-4">
            <p className="text-sm font-medium text-white break-words">
              {resumeData?.name}
            </p>
            <div className="flex flex-col items-start space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <button
                  aria-label="Open resume preview in a new tab"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  onClick={() => window.open(resumeData.url, "_blank")}
                >
                  View your resume
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-36 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-900 transition-colors relative ${
            isUploading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {resumeData?.name && (
            <button
              className={`absolute top-2 right-2 text-gray-400 hover:text-white ${
                isUploading ? "cursor-wait" : "hover:text-white"
              }`}
              onClick={handleRemoveFile}
              aria-label="Remove file"
              disabled={isUploading}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
          {resumeData?.name ? (
            <div className="flex flex-col items-center justify-center">
              {getFileIcon(file || { name: resumeData.name })}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <p className="text-sm text-white mr-1">{resumeData?.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-400">(</span>
                  <button
                    aria-label="Open resume preview in a new tab"
                    className={`text-blue-500 hover:text-blue-700 text-sm font-semibold ${
                      isUploading ? "cursor-wait opacity-70" : ""
                    }`}
                    onClick={() => {
                      if (resumeData?.name) {
                        window.open(
                          URL.createObjectURL(
                            file || new File([], resumeData.name)
                          ),
                          "_blank"
                        );
                      } else {
                        toast.error("No file name available for preview.");
                      }
                    }}
                    disabled={isUploading}
                  >
                    preview
                  </button>
                  <span className="text-sm text-gray-400">)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <TbFileCv className="w-12 h-12 mb-4 text-blue-600" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="text-gray-400">Click to upload</span> or drag
                and drop
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className={`hidden ${isUploading ? "cursor-wait" : ""}`}
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {isLoading ? (
          <div className="mt-4 flex items-center w-full animate-pulse">
            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
          </div>
        ) : resumeData?.name ? (
          <div className="mt-4 flex items-center w-full">
            <button
              className={`text-white text-sm ${
                isUploading ? "cursor-wait opacity-70" : ""
              }`}
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              Remove your resume
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResumeUpload;