import { useEffect, useState } from "react";
import "./App.css";
import { apiClient } from "./utils/api";
import { useAuth } from "./hooks/useAuth";
import { InsertLifeHistory, useCreateLifeHistory } from "./services/lifeHistory";
import { useGetCurrentUser } from "./services/user";
import { CurrentUser } from "./types";


function App() {
  const [text, setText] = useState("");
  const getCurrentUser = useGetCurrentUser();
  const { signInWithGoogle, signOut } = useAuth();
  const createLifeHistory = useCreateLifeHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const handleCreateLifeHistory = async () => {
    if (createLifeHistory.isPending) return

    if (!currentUser) {
      console.error("User is not authenticated");
      return;
    }
    
    const newLifeHistory: InsertLifeHistory = {
      event_text: text,
      user_id: currentUser?.id,
      // rest of the fields:
      // event_date,
      // event_image,
    }

    createLifeHistory.mutate(newLifeHistory);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = apiClient.auth.onAuthStateChange((_event, session) => {

      if (session?.user.id) {
        try {
          getCurrentUser.mutateAsync(session.user.id).then((user) => {
            if (user) setCurrentUser(user);
          });
        } catch (error) {
          console.error(error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);


  if (!currentUser) {
    return (
      <button type="button" onClick={signInWithGoogle}>
        {
          getCurrentUser.isPending ? "Loading..." : 'Iniciar sesión con Google'
        }
      </button>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen min-h-full gap-8 py-20">

      <header className="max-w-6xl mx-auto">
        <div className="flex gap-3">
          <h1>Welcome, {currentUser.name}</h1>
          <img src={currentUser.avatar_url} alt={currentUser.name} className="w-12 h-12 rounded-full" />
        </div>

      </header>

      <section className="max-w-6xl mx-auto grow">
        <dialog open={isOpen}>
          <section className="flex flex-col w-full gap-4 align-items justify-content">
            <h1>This is a form</h1>
            <label htmlFor="text">
              Text
              <input
                name="text"
                id="text"
                type="text"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                }}
                placeholder="Enter a text..."
              />
            </label>
            <label htmlFor="text">
              Upload an image
              <input
                name="text"
                id="text"
                type="file"
                placeholder="Upload an image"
              ></input>
            </label>
            <button className="p-4 bg-green-500" onClick={handleCreateLifeHistory}>
              Save changes
            </button>
          </section>
        </dialog>

        {
          createLifeHistory.isPending ? (
            <p>Loading...</p>
          ) : createLifeHistory.isError ? (
            <p>Error: {createLifeHistory.error.message}</p>
          ) : createLifeHistory.isSuccess ? (
            <p>Success</p>
          ) : null
        }

        <button
          type="button"
          className="border-2 border-red w-[300px] h-[300px] hover:bg-slate-200"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Click me
        </button>
      </section>
      <footer className="max-w-6xl mx-auto">
        <button type="button" onClick={signOut}>
          Log Out
        </button>
      </footer>
    </main>
  );
}

export default App;
