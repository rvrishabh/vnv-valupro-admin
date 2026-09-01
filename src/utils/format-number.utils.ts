export const formatNumberWithCommas = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const strValue = value.toString();
  const isNegative = strValue.startsWith("-");
  const unsigned = isNegative ? strValue.slice(1) : strValue;
  const [integerPart, decimalPart] = unsigned.split(".");

  // Indian numbering: last 3 digits, then groups of 2 — e.g. 12,34,567
  const lastThree = integerPart.slice(-3);
  const rest = integerPart.slice(0, -3);
  const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const groupedInt = rest ? `${groupedRest},${lastThree}` : lastThree;

  const sign = isNegative ? "-" : "";
  return decimalPart !== undefined
    ? `${sign}${groupedInt}.${decimalPart}`
    : `${sign}${groupedInt}`;
};

export const unFormatNumber = (value: string) => {
  return value.replace(/,/g, "");
};
