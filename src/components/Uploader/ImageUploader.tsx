import { IconUpload, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { Button } from "../ui/button";

interface ImageUploaderProps {
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove?: () => void;
  currentImage?: string | null;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageChange,
  onImageRemove,
  currentImage,
  disabled = false,
  size = "md",
}) => {
  const [image, setImage] = useState<string | null>(currentImage || null);

  // Update image state when currentImage prop changes
  React.useEffect(() => {
    setImage(currentImage || null);
  }, [currentImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Call the parent's onImageChange if provided
    onImageChange?.(e);
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

  return (
    <div>
      <div
        className={`relative ${getSizeClasses()} border-2 border-dashed border-gray-300 rounded-full overflow-hidden ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {image ? (
          <div className="relative w-full h-full">
            <img
              src={image}
              alt="Uploaded"
              className="object-cover w-full h-full rounded-full"
            />
            {!disabled && (
              <Button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 w-6 h-6 p-0 flex items-center justify-center rounded-full"
              >
                <IconX className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center w-full h-full ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <IconUpload className="w-6 h-6 text-gray-400" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
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
