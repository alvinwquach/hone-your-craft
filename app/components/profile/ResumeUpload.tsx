"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";
import { PiFileDoc } from "react-icons/pi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [currentDocument, setCurrentDocument] = useState<any | null>(null);

  const fetchDocumentDetails = async () => {
    try {
      const response = await fetch("/api/documents/current", {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok && data) {
        setCurrentDocument(data);
      } else {
        console.log("No document found.");
      }
    } catch (error) {
      toast.error("Error fetching document.");
    }
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile);
      if (currentDocument?.id) {
        await handleFileUpdate(selectedFile);
      } else {
        await handleFileUpload(selectedFile);
      }
    }
  };

  const handleRemoveFile = async () => {
    if (!currentDocument?.id) {
      toast.error("Document ID is missing. Unable to delete the document.");
      return;
    }

    try {
      const response = await fetch(`/api/documents/${currentDocument.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }

      setFile(null);
      setCurrentDocument(null);

      toast.success("Your resume has been removed successfully.");
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
        fetchDocumentDetails();
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
    if (!currentDocument?.id) {
      toast.error("No document found to update.");
      return;
    }

    try {
      console.log(
        "Requesting document update with new file:",
        selectedFile.name
      );

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/documents/${currentDocument.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update document.");
      }

      const responseData = await response.json();
      console.log("Document updated successfully:", responseData);

      toast.success("Document updated successfully!");
      fetchDocumentDetails();
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
      if (currentDocument?.id) {
        await handleFileUpdate(droppedFile);
      } else {
        await handleFileUpload(droppedFile);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4 mt-5">
      {currentDocument && (
        <div className="w-full text-left">
          <p className="text-sm font-medium text-white break-words">
            {currentDocument.name}
          </p>
          <div className="flex flex-col items-start space-y-2 mt-2">
            <div className="flex items-center space-x-2 mt-2">
              <button
                aria-label="Open resume preview in a new tab"
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => window.open(currentDocument.url, "_blank")}
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
          {file || currentDocument ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {getFileIcon(file || currentDocument)}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <p className="text-sm text-white mr-1">
                  {file?.name || currentDocument?.name}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-400">(</span>
                  <button
                    aria-label="Open resume preview in a new tab"
                    className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file || currentDocument),
                        "_blank"
                      )
                    }
                  >
                    preview
                  </button>
                  <span className="text-sm text-gray-400">)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CiFileOn className="w-12 h-12 mb-4 text-white" />
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
      {(file || currentDocument) && (
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
  );
};

export default ResumeUpload;
