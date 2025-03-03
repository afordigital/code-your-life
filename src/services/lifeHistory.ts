import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient } from "../utils/api"
import { Database } from "../database.types"
import { InsertLifeHistory } from "../types"
import { queryClient } from "../main"


export function useGetUserLifeHistories() {
  return useQuery({
    queryKey: ["lifeHistories"],
    queryFn: async () => {
      const {
        data: { session },
      } = await apiClient.auth.getSession()
      if (!session?.user.id) {
        throw new Error("User is not authenticated")
      }

      const lifeHistories = await apiClient.from("life_history").select("*").eq("user_id", session?.user.id)
      return lifeHistories.data
    },
  })
}

export function useCreateLifeHistory() {
  return useMutation({
    mutationFn: async ({
      event_date,
      event_image,
      event_text,
      updated_at,
      user_id,
    }: InsertLifeHistory) => {
      const {
        data: { session },
      } = await apiClient.auth.getSession()
      if (!session?.user.id) {
        throw new Error("User is not authenticated")
      }

      const { data, error } = await apiClient.from("life_history").insert({
        event_date,
        event_image,
        event_text,
        updated_at,
        user_id
      })
      if (error) {
        throw new Error(error.message)
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lifeHistories"] })
    }
  })
}

export function useUpdateLifeHistory() {
  return useMutation({
    mutationFn: async ({
      event_date,
      event_image,
      event_text,
      id,
      updated_at,
      user_id,
    }: Database["public"]["Tables"]["life_history"]["Update"]) => {
      const {
        data: { session },
      } = await apiClient.auth.getSession()
      if (!session?.user.id) {
        throw new Error("User is not authenticated")
      }

      const { data, error } = await apiClient.from("life_history").update({
        event_date,
        event_image,
        event_text,
        id,
        updated_at,
        user_id,
      })
      if (error) {
        throw new Error(error.message)
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lifeHistories"] })
    }
  })
}

export function useDeleteLifeHistory() {
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await apiClient.from("life_history").delete().eq("id", id)
      if (error) {
        throw new Error(error.message)
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lifeHistories"] })
    }
  })
}