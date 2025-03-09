import { type FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const Login = () => {
	const { signInWithGoogle, signInWithDiscord, signInWithEmail } = useAuth();
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [formValues, setFormValues] = useState({ email: "", password: "" });

	const handleAuthWithEmail = (event: FormEvent) => {
		event.preventDefault();
		signInWithEmail(formValues.email, formValues.password);
		setFormValues({ email: "", password: "" });
	};

	return (
		<section className="w-screen min-h-screen flex items-center justify-center flex-col gap-8">
			{showEmailForm ? (
				<form className="flex flex-col gap-8 w-full h-full justify-center items-center">
					<label className="flex flex-col gap-4">
						Email
						<input
							type="text"
							value={formValues.email}
							onChange={(event) => {
								setFormValues({ ...formValues, email: event.target.value });
							}}
							placeholder="Enter your email"
						/>
					</label>
					<label className="flex flex-col gap-4">
						Password
						<input
							type="password"
							value={formValues.password}
							onChange={(event) => {
								setFormValues({ ...formValues, password: event.target.value });
							}}
							placeholder="Enter your password"
						/>
					</label>
					<button
						type="submit"
						className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
						onClick={handleAuthWithEmail}
					>
						Submit
					</button>
				</form>
			) : (
				<article className="flex flex-col gap-8">
					<button
						className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
						type="button"
						onClick={signInWithGoogle}
					>
						Iniciar sesión con Google
					</button>
					<button
						className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
						type="button"
						onClick={signInWithDiscord}
					>
						Iniciar sesión con Discord
					</button>
					<button
						className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
						type="button"
						onClick={() => {
							setShowEmailForm(true);
						}}
					>
						Iniciar sesión con Email
					</button>
				</article>
			)}
		</section>
	);
};
