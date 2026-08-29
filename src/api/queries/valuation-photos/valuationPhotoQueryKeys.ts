export const valuationPhotoQueryKeys = {
  all: ["valuation-photos"] as const,
  list: (valuationId: string) =>
    [...valuationPhotoQueryKeys.all, "list", valuationId] as const,
};
