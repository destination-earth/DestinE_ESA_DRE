import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../services/api/axiosConfig";

interface FileUploaderProps {
  endpoint: string;
  acceptedFileTypes: string;
  buttonText: string;
  className?: string;
  additionalData?: Record<string, string | number | boolean>;
  customHeaders?: Record<string, string>;
  onUploadSuccess?: (response: Record<string, unknown>) => void;
  onUploadError?: (error: Error | unknown) => void;
}

/**
 * A reusable component for uploading files to specified endpoints
 * Handles authentication and file selection
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  endpoint,
  acceptedFileTypes,
  buttonText,
  className = "",
  additionalData = {},
  customHeaders = {},
  onUploadSuccess,
  onUploadError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { accessToken } = useAuth();

  const handleUpload = () => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = acceptedFileTypes;
    
    // When a file is selected
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        console.error("No file selected");
        return;
      }
      
      setIsUploading(true);
      
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        
        // Append the file with the expected field name
        // The server expects specific file-related fields
        formData.append("file", file);
        formData.append("Name", file.name);
        formData.append("FileName", file.name);
        formData.append("ContentType", file.type);
        formData.append("Length", String(file.size));
        
        // Add any additional data
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        
        // Log what we're sending for debugging
        console.log("Sending file upload with:", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          additionalData
        });
        
        // Send the file to the server
        // Remove any existing Content-Type header to let axios set it automatically with boundary
        const headers = { ...customHeaders };
        delete headers['Content-Type']; 
        
        const response = await axiosInstance.post(endpoint, formData, {
          headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        console.log("Upload successful:", response.data);
        
        // Call the success callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        
        // Call the error callback if provided
        if (onUploadError) {
          onUploadError(error);
        }
      } finally {
        setIsUploading(false);
      }
    };
    
    // Trigger the file input click
    fileInput.click();
  };

  return (
    <Button
      type="button"
      onClick={handleUpload}
      variant="outline"
      className={className}
      disabled={isUploading}
    >
      {isUploading ? "Uploading..." : buttonText}
    </Button>
  );
};

export default FileUploader;
