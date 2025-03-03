export const Footer = ({ signOut }: { signOut: () => void }) => {
	return (
		<footer className="max-w-6xl mx-auto">
			<button type="button" onClick={signOut}>
				Log Out
			</button>
		</footer>
	);
};
