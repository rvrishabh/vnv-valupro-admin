export const circleRateUpliftQueryKeys = {
  all: ["circle-rate-uplift"] as const,
  lists: () => [...circleRateUpliftQueryKeys.all, "list"] as const,
  resolve: (tehsil: string) =>
    [...circleRateUpliftQueryKeys.all, "resolve", tehsil] as const,
};
