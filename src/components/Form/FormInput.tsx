import { IconEye, IconEyeOff } from "@tabler/icons-react";
import React, { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "../../lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

interface FormInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: string;
  isPassword?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  defaultValue?: string;
  disabled?: boolean; // Added disabled prop
  description?: string;
}

const FormInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  isPassword = false,
  required = false,
  className,
  disabled = false, // Default value for disabled
  description,
}: FormInputProps<TFieldValues>) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("w-full pb-2", className)}>
          <FormLabel>
            {label}{" "}
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}{" "}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <LabelInputContainer>
              <div className="relative">
                <Input
                  {...field}
                  type={isPassword && showPassword ? "text" : type}
                  placeholder={placeholder}
                  className={cn(fieldState.error && "border-red-500")}
                  disabled={disabled} // Apply disabled prop
                />
                {isPassword && (
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </div>
                )}
              </div>
            </LabelInputContainer>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
