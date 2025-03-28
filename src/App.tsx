import { useEffect, useState } from "react";
import "./App.css";
import type { User } from "@supabase/supabase-js";
import { DateSubmitionForm } from "./components/DateSubmitionForm";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LifeHistory } from "./components/LifeHistory";
import { Login } from "./components/Login";
import { Onboarding } from "./components/Onboarding";
import {
	useCreateLifeHistory,
	useDeleteLifeHistory,
	useGetUserLifeHistories,
} from "./services/lifeHistory";
import { useGetCurrentUser } from "./services/user";
import type { CurrentUser } from "./types";
import { apiClient } from "./utils/api";

export type LifeUnit = "life" | "year" | "month";
export type TimeUnit = "years" | "months" | "weeks";

function App() {
	const [userId, setUserId] = useState<User["id"] | null>(null);
	const { data: currentUser, isPending: isPendingCurrentUser } =
		useGetCurrentUser(userId);

	const birth_date = currentUser?.birth_date;

	useEffect(() => {
		const {
			data: { subscription },
		} = apiClient.auth.onAuthStateChange((_event, session) => {
			if (!session) return;
			setUserId(session.user.id);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const isAuthenticated = userId !== null;

	return (
		<section className="bg-custom">
			{isAuthenticated ? (
				<>
					{isPendingCurrentUser && <div>Loading user...</div>}
					{currentUser && !birth_date && <Onboarding />}
					{currentUser && birth_date && (
						<AuthenticatedApp currentUser={currentUser} />
					)}
				</>
			) : (
				<UnauthenticatedApp />
			)}
		</section>
	);
}

const AuthenticatedApp = ({ currentUser }: { currentUser: CurrentUser }) => {
	const deleteLifeHistory = useDeleteLifeHistory();
	const createLifeHistory = useCreateLifeHistory();
	const getUserLifeHistories = useGetUserLifeHistories();

	// const [lifeUnit, setLifeUnit] = useState<LifeUnit>("life");
	// const [timeUnit, setTimeUnit] = useState<TimeUnit>("years");

	const [openUploadForm, setOpenUploadForm] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

	const handleOpenForm = (open: boolean, date?: Date) => {
		setOpenUploadForm(open);
		setSelectedDate(date);
	};

	return (
		<main className="flex flex-col items-center justify-center gap-8 p-20 text-customBlack bg-custom">
			<Header currentUser={currentUser} />

			<section className="flex flex-col items-center flex-1 w-full gap-4 mx-auto max-w-8xl">
				{createLifeHistory.isPending ? (
					<p>Loading...</p>
				) : createLifeHistory.isError ? (
					<p>Error: {createLifeHistory.error.message}</p>
				) : null}

				{deleteLifeHistory.isPending ? (
					<p>Loading...</p>
				) : deleteLifeHistory.isError ? (
					<p>Error: {deleteLifeHistory.error.message}</p>
				) : null}

				{getUserLifeHistories.isPending ? (
					<p>Loading...</p>
				) : getUserLifeHistories.isError ? (
					<p>Error: {getUserLifeHistories.error.message}</p>
				) : getUserLifeHistories.isSuccess ? (
					<ul className="list-disc">
						{getUserLifeHistories?.data?.map((lifeHistory) => (
							<li key={lifeHistory.id} className="flex gap-1">
								<p>{lifeHistory.event_text}</p>
								{lifeHistory.imagesUrls.map(({ name, url }) => (
									<img
										className="w-8 h-8 object-cover"
										key={name}
										src={url}
										alt={name}
									/>
								))}
								<button
									type="button"
									onClick={() => {
										deleteLifeHistory.mutate(lifeHistory.id);
									}}
									className="text-red-500"
								>
									Delete
								</button>
							</li>
						))}
					</ul>
				) : null}

				{currentUser.birth_date && (
					<LifeHistory
						birthDate={currentUser.birth_date}
						setOpenUploadForm={handleOpenForm}
					/>
				)}

				{openUploadForm && (
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white p-8 rounded-lg">
							<DateSubmitionForm
								selectedDate={selectedDate}
								onSubmition={() => setOpenUploadForm(false)}
							/>
						</div>
					</div>
				)}
			</section>

			<Footer />
		</main>
	);
};

const UnauthenticatedApp = () => {
	return <Login />;
};

export default App;
