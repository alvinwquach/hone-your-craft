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
}

const ResumeUpload = ({ resumeData }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile);
      if (resumeData?.id) {
        await handleFileUpdate(selectedFile);
      } else {
        await handleFileUpload(selectedFile);
      }
    }
  };

  const handleRemoveFile = async () => {
    if (!resumeData?.id) {
      toast.error("Document ID is missing. Unable to delete the document.");
      return;
    }

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
    }
  };

  const getFileIcon = (file: File | { name: string } | null | undefined) => {
    if (!file || !("name" in file)) {
      return <CiFileOn className="w-12 h-12 mb-4 text-white" />;
    }

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
        return <CiFileOn className="w-12 h-12 mb-4 text-white" />;
    }
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
    }
  };

  const handleFileUpdate = async (selectedFile: File) => {
    if (!resumeData?.id) {
      toast.error("No resume found to update.");
      return;
    }

    try {
      console.log("Requesting resume update with new file:", selectedFile.name);

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
      console.log("Resume updated successfully:", responseData);

      toast.success("Resume updated successfully!");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
      if (resumeData?.id) {
        await handleFileUpdate(droppedFile);
      } else {
        await handleFileUpload(droppedFile);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-start gap-8 p-6 sm:p-8 mt-4 sm:mt-0">
      <div>
        <h2 className="text-base font-semibold text-white mb-2">
          Upload your resume
        </h2>
        <p className="text-gray-400 text-sm">
          File types: PDF, DOCX, DOC, TXT (MAX. 10 MB)
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center w-full space-y-4 mt-4 lg:mt-0"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {resumeData?.name ? (
          <div className="w-full text-left mb-4">
            <p className="text-sm font-medium text-white break-words">
              {resumeData?.name}
            </p>
            <div className="flex flex-col items-start space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <button
                  aria-label="Open resume preview in a new tab"
                  className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
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
          className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition-colors relative"
        >
          {resumeData?.name && (
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={handleRemoveFile}
              aria-label="Remove file"
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
                    className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
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
                  >
                    preview
                  </button>
                  <span className="text-sm text-gray-400">)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <TbFileCv className="w-12 h-12 mb-4 text-white" />
              <p className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
        </label>
        {resumeData?.name && (
          <div className="mt-4 flex items-center justify-end w-full">
            <button
              className="text-gray-400 text-sm font-semibold"
              onClick={handleRemoveFile}
            >
              Remove your resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;