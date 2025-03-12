import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/api";
import type {
	InsertLifeHistory,
	ListLifeHistories,
	UpdateLifeHistory,
} from "../types";
import { queryClient } from "../main";
import { LifeHistoryDecade } from "../domain/LifeHistory";

const QUERY_KEYS = {
	lifeHistories: "lifeHistories",
} as const;

async function getAuthenticatedUserId(): Promise<string> {
	const {
		data: { session },
	} = await apiClient.auth.getSession();
	const userId = session?.user.id;

	if (!userId) {
		throw new Error("User is not authenticated");
	}

	return userId;
}

async function uploadImages(
	userId: string,
	recordId: number,
	imgFiles: File[],
): Promise<void> {
	if (!imgFiles?.length) return;

	const bucketPath = `${userId}/${recordId}`;
	const uploadPromises = imgFiles.map(async (file) => {
		const fileExtension = file.name.split(".").pop();
		const uniqueFileName = `${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 15)}.${fileExtension}`;
		const filePath = `${bucketPath}/${uniqueFileName}`;

		const { error: imgError } = await apiClient.storage
			.from("life_history")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (imgError) {
			console.error(`Error uploading ${file.name}:`, imgError);
			throw new Error(
				`Failed to upload image ${file.name}: ${imgError.message}`,
			);
		}

		return filePath;
	});

	try {
		await Promise.all(uploadPromises);

		const { error } = await apiClient
			.from("life_history")
			.update({
				bucket_url: bucketPath,
			})
			.eq("id", recordId);

		if (error) {
			throw new Error(
				`Failed to update record with bucket path: ${error.message}`,
			);
		}
	} catch (error) {
		console.error("Upload failed:", error);
		throw new Error(`Image upload failed: ${error}`);
	}
}

export function useGetUserLifeHistories() {
	return useQuery({
		queryKey: [QUERY_KEYS.lifeHistories],
		queryFn: async () => {
			const userId = await getAuthenticatedUserId();

			const { data, error } = await apiClient
				.from("life_history")
				.select("*")
				.eq("user_id", userId);

			if (error) {
				throw new Error(`Failed to fetch life histories: ${error.message}`);
			}

			const recordsWithBucketPaths = data.filter((record) => record.bucket_url);
			const recordsWithoutBucketPaths = data
				.filter((record) => !record.bucket_url)
				.map((record) => ({ ...record, imagesUrls: [] }));

			const imagesPromises = recordsWithBucketPaths.map(async (record) => {
				try {
					const { data: fileList, error: listError } = await apiClient.storage
						.from("life_history")
						.list(record.bucket_url ?? "");

					if (listError || !fileList) {
						console.error(`Error listing files for ${record.id}:`, listError);
						return { ...record, imagesUrls: [] };
					}

					const imageUrls = fileList.map((file) => ({
						name: file.name,
						url: apiClient.storage
							.from("life_history")
							.getPublicUrl(`${record.bucket_url}/${file.name}`).data.publicUrl,
					}));

					return { ...record, imagesUrls: imageUrls };
				} catch (error) {
					console.error(`Error processing record ${record.id}:`, error);
					return { ...record, imagesUrls: [] };
				}
			});

			const recordsWithImages = await Promise.all(imagesPromises);

			return [
				...recordsWithImages,
				...recordsWithoutBucketPaths,
			] as ListLifeHistories[];
		},
	});
}

export function useCreateLifeHistory() {
	return useMutation({
		mutationFn: async ({
			event_date,
			event_text,
			updated_at,
			imgFiles,
		}: InsertLifeHistory) => {
			const userId = await getAuthenticatedUserId();

			const { error, data } = await apiClient
				.from("life_history")
				.insert({
					event_date,
					event_text,
					updated_at,
					user_id: userId,
				})
				.select("id");

			if (error) {
				throw new Error(`Failed to create life history: ${error.message}`);
			}

			const lifeHistoryId = data?.[0]?.id;
			if (!lifeHistoryId) {
				throw new Error("Failed to get ID of newly created record");
			}

			if (imgFiles?.length) {
				await uploadImages(userId, lifeHistoryId, imgFiles);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.lifeHistories] });
		},
	});
}

export function useUpdateLifeHistory() {
	return useMutation({
		mutationFn: async (event: UpdateLifeHistory) => {
			const userId = await getAuthenticatedUserId();

			const { id, event_date, event_text, updated_at, imgFiles } = event;

			const { error } = await apiClient
				.from("life_history")
				.update({
					event_date,
					event_text,
					updated_at,
					user_id: userId,
				})
				.eq("id", id);

			if (error) {
				throw new Error(`Failed to update life history: ${error.message}`);
			}

			if (imgFiles?.length) {
				await uploadImages(userId, id, imgFiles);
			}
		},
		onMutate: async (event: UpdateLifeHistory) => {
			await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.lifeHistories] });

			const currentLifeHistory = queryClient.getQueryData([
				QUERY_KEYS.lifeHistories,
			]) as LifeHistoryDecade[];

			queryClient.setQueryData(
				[QUERY_KEYS.lifeHistories],
				currentLifeHistory.map((lifeHistoryEvent) =>
					String(lifeHistoryEvent.id) !== String(event.id)
						? lifeHistoryEvent
						: event,
				),
			);

			return { currentLifeHistory };
		},
		onError: (_error, _update, context) => {
			if (!context) return;
			queryClient.setQueryData(
				[QUERY_KEYS.lifeHistories],
				context.currentLifeHistory,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.lifeHistories] });
		},
	});
}

export function useDeleteLifeHistory() {
	return useMutation({
		mutationFn: async (id: number) => {
			const userId = await getAuthenticatedUserId();
			const bucketPath = `${userId}/${id}`;

			try {
				const { data: record, error: fetchError } = await apiClient
					.from("life_history")
					.select("bucket_url")
					.eq("id", id)
					.single();

				if (fetchError) {
					throw new Error(
						`Failed to fetch life history: ${fetchError.message}`,
					);
				}

				if (record?.bucket_url) {
					const { data: fileList, error: listError } = await apiClient.storage
						.from("life_history")
						.list(bucketPath);

					if (listError) {
						console.error(
							`Error listing files for deletion: ${listError.message}`,
						);
					} else if (fileList && fileList.length > 0) {
						const filesToDelete = fileList.map(
							(file) => `${bucketPath}/${file.name}`,
						);

						const { error: removeError } = await apiClient.storage
							.from("life_history")
							.remove(filesToDelete);

						if (removeError) {
							console.error(`Error removing files: ${removeError.message}`);
						}
					}
				}

				const { error } = await apiClient
					.from("life_history")
					.delete()
					.eq("id", id);

				if (error) {
					throw new Error(`Failed to delete life history: ${error.message}`);
				}
			} catch (error) {
				console.error("Error during deletion:", error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.lifeHistories] });
		},
	});
}
