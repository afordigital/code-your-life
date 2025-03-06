import { useEffect, useState } from "react";
import "./App.css";
import { apiClient } from "./utils/api";
import { useAuth } from "./hooks/useAuth";
import {
  useCreateLifeHistory,
  useDeleteLifeHistory,
  useGetUserLifeHistories,
} from "./services/lifeHistory";
import { useGetCurrentUser } from "./services/user";
// import type { InsertLifeHistory } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
// import { Modal } from "./components/Modal";
import { TitleSelector } from "./components/TitleSelector";
import { User } from "@supabase/supabase-js";
import { LifeHistory } from "./components/LifeHistory";
import { CurrentUser } from "./types";
import { Onboarding } from "./components/Onboarding";
import { DateSubmitionForm } from "./components/DateSubmitionForm";
// import { createSwapy, Swapy, utils } from "swapy";

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
    <>
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
    </>
  );
}

const AuthenticatedApp = ({ currentUser }: { currentUser: CurrentUser }) => {
  const { signOut } = useAuth();

  const deleteLifeHistory = useDeleteLifeHistory();
  const createLifeHistory = useCreateLifeHistory();
  const getUserLifeHistories = useGetUserLifeHistories();

  const [lifeUnit, setLifeUnit] = useState<LifeUnit>("life");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("years");

  const [openUploadForm, setOpenUploadForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleOpenForm = (open: boolean, date?: Date) => {
    setOpenUploadForm(open);
    setSelectedDate(date);
  };

  return (
    <main className="flex flex-col items-center justify-center gap-8 p-20 bg-slate-100">
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

        <TitleSelector
          lifeUnit={lifeUnit}
          setLifeUnit={setLifeUnit}
          timeUnit={timeUnit}
          setTimeUnit={setTimeUnit}
        />

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
        <LifeHistory
          birthDate={currentUser.birth_date}
          setOpenUploadForm={handleOpenForm}
        />
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

      <Footer signOut={signOut} />
    </main>
  );
};

const UnauthenticatedApp = () => {
  const { signInWithGoogle } = useAuth();
  return (
    <button type="button" onClick={signInWithGoogle}>
      Iniciar sesión con Google
    </button>
  );
};

export default App;
