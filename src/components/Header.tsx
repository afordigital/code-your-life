import { useAuth } from "../hooks/useAuth";
import type { CurrentUser } from "../types";
import { TitleSelector } from "./TitleSelector";

export const Header = ({
	currentUser,
}: { currentUser: CurrentUser | null }) => {
	if (!currentUser) return null;
	const { signOut } = useAuth();

	return (
		<header className="w-full flex flex-col gap-8">
			<div className="w-full flex justify-between">
				<div className="flex gap-3 items-center">
					<img
						src={currentUser.avatar_url}
						alt={currentUser.name}
						className="w-12 h-12 rounded-full"
					/>
					<h1>Welcome, {currentUser.name}</h1>
				</div>
				<button type="button" onClick={signOut}>
					Log Out
				</button>
			</div>

			<TitleSelector />
		</header>
	);
};
