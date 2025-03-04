import { Ref, useEffect, useMemo, useRef, useState } from "react";
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
import { createSwapy, Swapy, utils } from "swapy";

export type LifeUnit = "life" | "year" | "month";
export type TimeUnit = "years" | "months" | "weeks";

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

  const generateGrid = (lifeUnit: LifeUnit, timeUnit: TimeUnit) => {
    let cells: number[] = [];

    if (lifeUnit === "life") {
      cells = Array.from({ length: 100 }, (_, i) => i + 1); // 1 a 100 años
    } else if (lifeUnit === "year") {
      cells =
        timeUnit === "months"
          ? Array.from({ length: 12 }, (_, i) => i + 1)
          : Array.from({ length: 52 }, (_, i) => i + 1); // Meses o semanas
    } else if (lifeUnit === "month") {
      cells = Array.from({ length: 4 }, (_, i) => i + 1); // 4 semanas
    }

    return cells;
  };

  let cells = generateGrid(lifeUnit, timeUnit);

  const [slotItemMap, setSlotItemMap] = useState(
    utils.initSlotItemMap(cells, "cellsId")
  );
  const slottedItems = useMemo(
    () => utils.toSlottedItems(cells, "cellsId", slotItemMap),
    [cells, slotItemMap]
  );

  useEffect(
    () =>
      utils.dynamicSwapy(
        swapyRef.current,
        cells,
        "cellsId",
        slotItemMap,
        setSlotItemMap
      ),
    [cells]
  );

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
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current, {
      manualSwap: true,
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, []);

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

        <section ref={containerRef} className="grid grid-cols-10 gap-2 mt-4">
          {slottedItems.map((index, cell) => (
            <div
              key={cell}
              className="p-2 text-center bg-gray-100 border"
              data-swapy-slot={`cell-${index}`}
            >
              {index === 4 && (
                <p className="bg-blue-500" data-swapy-item={`cell-${index}`}>
                  content
                </p>
              )}
              {cell}
            </div>
          ))}
        </section>

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
