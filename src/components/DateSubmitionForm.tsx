import { type FC, useState } from "react";
import { useCreateLifeHistory } from "../services/lifeHistory";
import dayjs from "dayjs";

interface DateSubmitionFormProps {
	onSubmition: () => void;
	selectedDate: Date | undefined;
}

export const DateSubmitionForm: FC<DateSubmitionFormProps> = ({
	onSubmition,
	selectedDate,
}) => {
	const [note, setNote] = useState<string>("");
	const [imgFiles, setImgFiles] = useState<File[]>([]);

	const createLifeHistory = useCreateLifeHistory();

	const createNewHistory = async () => {
		if (createLifeHistory.isPending) return;

		await createLifeHistory.mutateAsync({
			event_text: note,
			event_date: dayjs(selectedDate).format("YYYY-MM-DD"),
			imgFiles,
			updated_at: dayjs().toISOString(),
		});

		setNote("");
		setImgFiles([]);
		onSubmition();
	};

	const formattedDate = selectedDate
		? new Intl.DateTimeFormat("es", {
				year: "numeric",
				month: "long",
			}).format(selectedDate)
		: "fecha actual";

	return (
		<>
			<form className="flex flex-col gap-8 p-8 relative">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<span
					className="text-2xl font-bold absolute top-0 right-2 cursor-pointer text-red-400"
					onClick={onSubmition}
				>
					x
				</span>
				<p>Tell me about {formattedDate}</p>
				<textarea
					value={note}
					disabled={createLifeHistory.isPending}
					onChange={(event) => {
						setNote(event.target.value);
					}}
					className="border-2 border-black"
				/>
				<button
					type="button"
					disabled={createLifeHistory.isPending}
					onClick={createNewHistory}
					className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
				>
					{createLifeHistory.isPending ? "Loading..." : "Upload a note"}
				</button>
			</form>
			<input
				type="file"
				className="m-8"
				multiple
				accept="image/*"
				onChange={(e) => {
					if (e.target.files) {
						setImgFiles(Array.from(e.target.files));
					}
				}}
			/>
		</>
	);
};
