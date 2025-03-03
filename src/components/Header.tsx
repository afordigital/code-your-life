import type { CurrentUser } from "../types";

export const Header = ({
	currentUser,
}: { currentUser: CurrentUser | null }) => {
	if (!currentUser) return null;
	return (
		<header className="max-w-6xl mx-auto">
			<div className="flex gap-3">
				<h1>Welcome, {currentUser.name}</h1>
				<img
					src={currentUser.avatar_url}
					alt={currentUser.name}
					className="w-12 h-12 rounded-full"
				/>
			</div>
		</header>
	);
};
