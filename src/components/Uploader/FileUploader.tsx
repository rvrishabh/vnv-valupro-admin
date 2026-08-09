import { File, FileText, Image, Play, Upload, Video, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  progress?: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface FileUploaderProps {
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (
    type.startsWith("text/") ||
    type.includes("document") ||
    type.includes("pdf")
  )
    return FileText;
  return File;
};

const getFileType = (type: string) => {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (
    type.startsWith("text/") ||
    type.includes("document") ||
    type.includes("pdf")
  )
    return "document";
  return "file";
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  acceptedTypes = ["image/*", "video/*", "application/pdf", "text/*"],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  onFilesChange,
  onUpload,
  className,
  disabled = false,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)}`;
    }

    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return "File type not accepted";
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 150;
          const ctx = canvas.getContext("2d");
          video.currentTime = 1;
          video.onseeked = () => {
            ctx?.drawImage(video, 0, 0, 200, 150);
            resolve(canvas.toDataURL());
          };
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve("");
      }
    });
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      // Take only the first file since we want one file at a time
      const file = Array.from(files)[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        console.error(`File ${file.name}: ${error}`);
        return;
      }

      const fileId = Math.random().toString(36).substr(2, 9);
      const preview = await createFilePreview(file);

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        progress: 0,
        status: "uploading",
      };

      // Replace the current file instead of adding to array
      setUploadedFiles([uploadedFile]);
      onFilesChange?.([uploadedFile]);

      // Simulate upload progress
      if (onUpload) {
        try {
          await onUpload([file]);
          // Update status to success
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, status: "success", progress: 100 }
                : f
            )
          );
        } catch (error) {
          // Update status to error
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, status: "error", error: error as string }
                : f
            )
          );
        }
      }
    },
    [onFilesChange, onUpload, acceptedTypes, maxFileSize]
  );

  const removeFile = () => {
    // Clear the file since we only have one file at a time
    setUploadedFiles([]);
    onFilesChange?.([]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-8 text-center transition-colors",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload File</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop a file here, or click to select
        </p>
        <Button
          variant="outline"
          onClick={() => document.getElementById("file-input")?.click()}
          disabled={disabled}
        >
          Choose File
        </Button>
        <input
          id="file-input"
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded File</h4>
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {getFileType(file.type) === "image" ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : getFileType(file.type) === "video" ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-600" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      {React.createElement(getFileIcon(file.type), {
                        className: "w-6 h-6 text-gray-600",
                      })}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {getFileType(file.type)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile()}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  {file.status === "uploading" && (
                    <div className="mt-2">
                      <Progress value={file.progress || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {file.progress || 0}%
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  {file.status === "success" && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Uploaded successfully
                    </p>
                  )}
                  {file.status === "error" && (
                    <p className="text-xs text-red-600 mt-1">✗ {file.error}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
