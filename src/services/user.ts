import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/api";
import { User } from "@supabase/supabase-js";
import { Database } from "../database.types";
import { queryClient } from "../main";

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

export function useUpdateUserDatabirth() {
  return useMutation({
    mutationFn: async ({
      birth_date,
    }: Database["public"]["Tables"]["users"]["Update"]) => {
      const {
        data: { session },
      } = await apiClient.auth.getSession();
      if (!session?.user.id) {
        throw new Error("User is not authenticated");
      }

      const { data, error } = await apiClient
        .from("users")
        .update({
          birth_date,
        })
        .eq("id", session.user.id);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
