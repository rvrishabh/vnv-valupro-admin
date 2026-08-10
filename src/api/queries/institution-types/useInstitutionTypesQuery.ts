import { api } from "@/lib/axios";
import type { FindQueryParams, InstitutionType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { institutionTypeQueryKeys } from "./institutionTypeQueryKeys";

export function useInstitutionTypesQuery(query: FindQueryParams) {
  return useQuery({
    queryKey: institutionTypeQueryKeys.list(query),
    // Unlike other list endpoints, GET /institution-types returns a plain
    // array — the backend service intentionally discards pagination info
    // (src/modules/institution-types/institution-types.service.ts findAll).
    queryFn: async () => {
      const response = await api.get<InstitutionType[]>("/institution-types", {
        params: query,
      });
      return response.data;
    },
  });
}
