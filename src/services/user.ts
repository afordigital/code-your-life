import { useMutation } from "@tanstack/react-query"
import { apiClient } from "../utils/api"
import { User } from "@supabase/supabase-js"

export function useGetCurrentUser() {
	return useMutation({
		mutationFn: async (userId: User['id']) => {
			const response = await apiClient.from("users").select('*').eq("id", userId).single()

			return  response.data
		},
	})
}
