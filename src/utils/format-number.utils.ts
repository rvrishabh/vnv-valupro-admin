export const formatNumberWithCommas = (value: string | number) => {
  if (value === undefined || value === "") return "";
  const strValue = value.toString();
  const parts = strValue.split(".");
  // International format: 1,234,567,890
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export const unFormatNumber = (value: string) => {
  return value.replace(/,/g, "");
};
