import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import "./App.css";

const projectUrl: string = import.meta.env.VITE_PROJECT_URL;
const apiKey: string = import.meta.env.VITE_API_KEY;

export const supabase = createClient(projectUrl, apiKey);
const LIFE_HISTORY_TABLE = "life_history";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://hckzsirtpkhuupdqcfia.supabase.co/auth/v1/callback",
      },
    });

    if (error) console.error("Error al iniciar sesión:", error.message);
  };

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    console.error(error);
  }

  //     return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  if (!session) {
    return (
      <button type="button" onClick={signInWithGoogle}>
        Iniciar sesión con Google
      </button>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { error } = await supabase
      .from(LIFE_HISTORY_TABLE)
      .insert({ event_text: text });

    console.error(error);
  };

  console.log(text);
  return (
    <main className="flex flex-col items-center justify-center h-screen min-h-full gap-8 py-20">
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
            <button className="p-4 bg-green-500" onClick={handleSubmit}>
              Save changes
            </button>
          </section>
        </dialog>
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
