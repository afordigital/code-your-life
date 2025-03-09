import { useState } from "react";
import { useUpdateUserDatabirth } from "../services/user";

export const Onboarding = () => {
	const [birthdate, setBirthdate] = useState("");
	const updateUserDatabirth = useUpdateUserDatabirth();

	const onBoard = () => {
		if (updateUserDatabirth.isPending) return;

		updateUserDatabirth.mutate({ birth_date: birthdate });
		setBirthdate("");
	};

	return (
		<form className="flex flex-col items-center justify-center w-full min-h-screen gap-8">
			<h1 className="text-5xl">Welcome to your ¿life? in ¿years?</h1>
			<p className="text-2xl">
				We need to know your birth date to start creating...
			</p>
			<label>
				<input
					type="date"
					value={birthdate}
					onChange={(event) => {
						setBirthdate(event.target.value);
					}}
				/>
			</label>
			<button
				type="submit"
				disabled={!birthdate}
				onClick={onBoard}
				className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
			>
				Start Creating
			</button>
		</form>
	);
};
