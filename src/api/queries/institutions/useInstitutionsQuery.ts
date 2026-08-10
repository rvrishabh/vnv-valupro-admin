import { api } from "@/lib/axios";
import type {
  Institution,
  ListInstitutionsQuery,
  PaginatedResult,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { institutionQueryKeys } from "./institutionQueryKeys";

export function useInstitutionsQuery(query: ListInstitutionsQuery) {
  return useQuery({
    queryKey: institutionQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Institution>>(
        "/institutions",
        { params: query },
      );
      return response.data;
    },
  });
}
