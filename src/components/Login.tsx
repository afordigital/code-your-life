import { ChevronLeft, KeyRound, Mail } from "lucide-react";
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
			<article className="bg-white flex flex-col border border-primary/10 p-10 rounded-md gap-8">
				{showEmailForm ? (
					<div>
						<button
							className="hover:underline underline-offset-4 flex gap-2 items-center cursor-pointer"
							type="button"
							onClick={() => {
								setShowEmailForm(false);
							}}
						>
							<ChevronLeft width={14} />
							Back
						</button>
						<form className="flex flex-col items-center gap-8">
							<h1
								style={{ fontFamily: "Fredoka Variable", fontWeight: 500 }}
								className="text-primary relative z-10 text-[32px]"
							>
								<div className="bg-secondary absolute -z-10 top-7 right-20 w-32 h-3" />
								Create an account
							</h1>
							<label className="relative flex flex-col gap-4">
								<input
									type="text"
									value={formValues.email}
									onChange={(event) => {
										setFormValues({
											...formValues,
											email: event.target.value,
										});
									}}
									placeholder="Enter your email"
									className="custom-input "
								/>
								<Mail
									width={20}
									color="#191919"
									className="absolute top-4 left-8"
								/>
							</label>
							<label className="relative flex flex-col gap-4">
								<input
									type="password"
									value={formValues.password}
									onChange={(event) => {
										setFormValues({
											...formValues,
											password: event.target.value,
										});
									}}
									className="custom-input"
									placeholder="Enter your password"
								/>
								<KeyRound
									width={20}
									color="#191919"
									className="absolute top-4 left-8"
								/>
							</label>
							<button
								type="submit"
								className="button-primary"
								onClick={handleAuthWithEmail}
							>
								<span>Submit</span>
							</button>
						</form>
					</div>
				) : (
					<article className="flex flex-col items-center gap-8">
						<h1
							style={{ fontFamily: "Fredoka Variable", fontWeight: 500 }}
							className="text-primary relative z-10 text-[32px]"
						>
							<div className="bg-secondary absolute -z-10 top-7 right-20 w-32 h-3" />
							Create an account
						</h1>
						<button
							className="custom-button"
							type="button"
							onClick={signInWithGoogle}
						>
							<span>
								<img src="/svgs/google.svg" width={24} alt="Google Icon SVG" />
								Continue with Google
							</span>
						</button>
						<button
							className="custom-button"
							type="button"
							onClick={signInWithGoogle}
						>
							<span>
								<img
									src="/svgs/roblox_light.svg"
									width={24}
									alt="Roblox Icon SVG"
								/>
								Continue with Roblox
							</span>
						</button>
						<button
							className="custom-button"
							type="button"
							onClick={signInWithDiscord}
						>
							<span>
								<img
									src="/svgs/discord.svg"
									width={24}
									alt="Discord Icon SVG"
								/>
								Continue with Discord
							</span>
						</button>
						<button
							className="custom-button"
							type="button"
							onClick={() => {
								setShowEmailForm(true);
							}}
						>
							<span>
								<img
									src="/svgs/mail.svg"
									color="#191919"
									width={24}
									alt="Gmail Icon SVG"
								/>
								Continue with Email
							</span>
						</button>
					</article>
				)}
			</article>
		</section>
	);
};
