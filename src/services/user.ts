import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/api";
import { User } from "@supabase/supabase-js";

export function useGetCurrentUser(userId: User["id"] | null) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!userId) return;
      const response = await apiClient
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      return response.data;
    },
    enabled: Boolean(userId),
  });
}
