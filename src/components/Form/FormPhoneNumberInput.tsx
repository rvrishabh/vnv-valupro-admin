import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface FormPhoneNumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  inputStyle?: React.CSSProperties;
  inputClass?: string;
  country?: string;
  [key: string]: unknown;
}

export default function FormPhoneNumberInput<T extends FieldValues>({
  control,
  name,
  label = "Phone Number",
  required = false,
  inputStyle,
  inputClass = "text-black",
  country = "in",
  ...props
}: FormPhoneNumberInputProps<T>) {
  const radius = 100; // change this to increase the radius of the hover effect
  const [visible, setVisible] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: {
    currentTarget: HTMLElement;
    clientX: number;
    clientY: number;
  }) {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="pb-2">
          <FormLabel className="text-left">
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl className="text-black">
            <motion.div
              style={{
                background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          #3b82f6,
          transparent 80%
        )
      `,
              }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setVisible(true)}
              onMouseLeave={() => setVisible(false)}
              className="group/input rounded-lg transition duration-300"
            >
              <PhoneInput
                country={country}
                value={field.value}
                onChange={(phone) => field.onChange(phone)}
                enableSearch
                enableAreaCodes
                inputProps={{
                  maxLength: 20,
                  minLength: 10,
                }}
                inputStyle={{ width: "100%", ...inputStyle }}
                inputClass={inputClass}
                containerClass="h-full rounded-md shadow-md border border-primary/30 dark:border-primary/50  bg-gray-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_4px_2px_#404040] dark:focus-visible:ring-primary/70"
                {...props}
              />
            </motion.div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
