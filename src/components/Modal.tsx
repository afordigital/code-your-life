export const Modal = ({
	text,
	setText,
	handleCreateLifeHistory,
	createLifeHistory,
}: {
	text: string;
	setText: React.Dispatch<React.SetStateAction<string>>;
	handleCreateLifeHistory: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	createLifeHistory: any;
}) => {
	return (
		<section className="flex flex-col w-full gap-4 align-items justify-content mt-10">
			<label htmlFor="text">
				Life history text:
				<input
					name="text"
					id="text"
					type="text"
					value={text}
					onChange={(event) => {
						setText(event.target.value);
					}}
					placeholder="Enter a text..."
				/>
			</label>
			<label htmlFor="text">
				Upload an image
				<input
					name="text"
					id="text"
					type="file"
					placeholder="Upload an image"
				/>
			</label>
			<button
				type="button"
				className="p-4 bg-green-500"
				onClick={handleCreateLifeHistory}
				disabled={createLifeHistory.isPending}
			>
				{createLifeHistory.isPending ? "Loading..." : "Create"}
			</button>
		</section>
	);
};
