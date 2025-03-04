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
import type { CurrentUser } from "./types";
// import type { InsertLifeHistory } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
// import { Modal } from "./components/Modal";
import { TitleSelector } from "./components/TitleSelector";
import { DndContainer } from "./components/dnd-kit/DndContainer";
// import { createSwapy, Swapy, utils } from "swapy";

export type LifeUnit = "life" | "year" | "month";
export type TimeUnit = "years" | "months" | "weeks";

const generateGrid = () => {
  let items = {
    decade_1: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
    decade_2: Array.from({ length: 10 }, (_, i) => (i + 11).toString()),
    decade_3: Array.from({ length: 10 }, (_, i) => (i + 21).toString()),
    decade_4: Array.from({ length: 10 }, (_, i) => (i + 31).toString()),
    decade_5: Array.from({ length: 10 }, (_, i) => (i + 41).toString()),
    decade_6: Array.from({ length: 10 }, (_, i) => (i + 51).toString()),
    decade_7: Array.from({ length: 10 }, (_, i) => (i + 61).toString()),
    decade_8: Array.from({ length: 10 }, (_, i) => (i + 71).toString()),
    decade_9: Array.from({ length: 10 }, (_, i) => (i + 81).toString()),
    decade_10: Array.from({ length: 10 }, (_, i) => (i + 91).toString()),
  };

  return items;
};

function App() {
  // const [text, setText] = useState("");
  const { mutateAsync: getUserAsync, isPending: getUserIsPending } =
    useGetCurrentUser();
  const { signInWithGoogle, signOut } = useAuth();
  const deleteLifeHistory = useDeleteLifeHistory();
  const createLifeHistory = useCreateLifeHistory();
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const getUserLifeHistories = useGetUserLifeHistories();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [lifeUnit, setLifeUnit] = useState<LifeUnit>("life");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("years");

  let gridItems = generateGrid();

  // const handleCreateLifeHistory = async () => {
  // 	if (createLifeHistory.isPending) return;

  // 	if (!currentUser) {
  // 		console.error("User is not authenticated");
  // 		return;
  // 	}

  // 	const newLifeHistory: InsertLifeHistory = {
  // 		event_text: text,
  // 		user_id: currentUser.id,
  // 		// rest of the fields:
  // 		// event_date,
  // 		// event_image,
  // 	};

  // 	createLifeHistory.mutate(newLifeHistory);
  // 	setText("");
  // };

  useEffect(() => {
    const {
      data: { subscription },
    } = apiClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id) {
        try {
          getUserAsync(session.user.id).then((user) => {
            if (user) setCurrentUser(user);
          });
        } catch (error) {
          console.error(error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUserAsync]);

  if (!currentUser) {
    return (
      <button type="button" onClick={signInWithGoogle}>
        {getUserIsPending ? "Loading..." : "Iniciar sesión con Google"}
      </button>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen min-h-full gap-8 py-20">
      <Header currentUser={currentUser} />

      <section className="flex flex-col items-center flex-1 w-full max-w-6xl gap-4 mx-auto">
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

        {/* <section className="grid grid-cols-10 gap-2 mt-4">
          {cells.map((index, cell) => (
            <div key={cell} className="p-2 text-center bg-gray-100 border">
              {index === 4 && <p className="bg-blue-500">content</p>}
              {cell}
            </div>
          ))}
        </section> */}

        <DndContainer gridItems={gridItems}></DndContainer>

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

        {/* <button
					type="button"
					className="px-10 py-2 border-2 border-red w-max hover:bg-slate-200"
					onClick={() => {
						setIsOpen(!isOpen);
					}}
				>
					{isOpen ? "Close" : "Create a new life history"}
				</button> */}

        {/* {!!isOpen && (
					<Modal
						text={text}
						setText={setText}
						handleCreateLifeHistory={handleCreateLifeHistory}
						createLifeHistory={createLifeHistory}
					/>
				)} */}
      </section>
      <Footer signOut={signOut} />
    </main>
  );
}

export default App;
