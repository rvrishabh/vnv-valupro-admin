import { IconUpload, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { Button } from "../ui/button";

interface ImageUploaderProps {
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove?: () => void;
  currentImage?: string | null;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** "circle" suits an avatar-style single image; "square" suits a photo tile. */
  shape?: "circle" | "square";
  /** Lets the caller pick several files at once. Disables the local preview,
   * since a multi-select result can't be shown as a single image. */
  multiple?: boolean;
  accept?: string;
  /** Shown under the upload icon while no image is selected, e.g. "Upload photos". */
  label?: string;
  /** Overrides the size-based width/height classes, e.g. for a grid tile. */
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageChange,
  onImageRemove,
  currentImage,
  disabled = false,
  size = "md",
  shape = "circle",
  multiple = false,
  accept = "image/*",
  label,
  className,
}) => {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const inputId = React.useId();

  // Update image state when currentImage prop changes
  React.useEffect(() => {
    setImage(currentImage || null);
  }, [currentImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !multiple) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Call the parent's onImageChange if provided
    onImageChange?.(e);
    // Allow re-selecting the same file(s) on a subsequent upload/replace.
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    // Call the parent's onImageRemove callback if provided
    onImageRemove?.();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-16 h-16";
      case "lg":
        return "w-24 h-24";
      default:
        return "w-18 h-18";
    }
  };

  const showImage = !multiple && !!image;
  const shapeClasses = shape === "circle" ? "rounded-full" : "rounded-md";

  return (
    <div>
      <div
        className={`relative ${className ?? getSizeClasses()} border-2 border-dashed border-gray-300 overflow-hidden ${shapeClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {showImage ? (
          <div className="relative w-full h-full">
            <img
              src={image ?? undefined}
              alt="Uploaded"
              className={`object-cover w-full h-full ${shapeClasses}`}
            />
            {!disabled && (
              <Button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 w-6 h-6 p-0 flex items-center justify-center rounded-full"
              >
                <IconX className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full px-1 text-center ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <IconUpload className="w-6 h-6 text-gray-400" />
            {label ? <span className="text-xs text-gray-400">{label}</span> : null}
            <input
              id={inputId}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={handleImageChange}
              disabled={disabled}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
