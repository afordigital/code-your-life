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
// import { createSwapy, Swapy, utils } from "swapy";

export type LifeUnit = "life" | "year" | "month";
export type TimeUnit = "years" | "months" | "weeks";

function App() {
  const [userId, setUserId] = useState<User["id"] | null>(null);
  const { data: currentUser, isPending: isPendingCurrentUser } =
    useGetCurrentUser(userId);

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
          {currentUser && <AuthenticatedApp currentUser={currentUser} />}
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

  return (
    <main className="p-20 bg-slate-100 flex flex-col items-center justify-center gap-8">
      <Header currentUser={currentUser} />

      <section className="flex-1 w-full max-w-8xl mx-auto flex flex-col gap-4 items-center">
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

        <LifeHistory />

        {getUserLifeHistories.isPending ? (
          <p>Loading...</p>
        ) : getUserLifeHistories.isError ? (
          <p>Error: {getUserLifeHistories.error.message}</p>
        ) : getUserLifeHistories.isSuccess ? (
          <ul className="list-disc">
            {getUserLifeHistories?.data?.map((lifeHistory) => (
              <li key={lifeHistory.id} className="flex gap-1">
                <p>{lifeHistory.event_text}</p>
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

        {/*
          <button
            type="button"
            className="px-10 py-2 border-2 border-red w-max hover:bg-slate-200"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
           >
            {isOpen ? "Close" : "Create a new life history"}
          </button>
        */}

        {/* 
          {!!isOpen && (
            <Modal
              text={text}
              setText={setText}
              handleCreateLifeHistory={handleCreateLifeHistory}
              createLifeHistory={createLifeHistory}
            />
          )}
        */}
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
