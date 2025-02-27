import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import "./App.css";

const projectUrl: string = import.meta.env.VITE_PROJECT_URL;
const apiKey: string = import.meta.env.VITE_API_KEY;

export const supabase = createClient(projectUrl, apiKey);

function App() {
  const [session, setSession] = useState<Session | null>(null);

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
  return (
    <main className="flex flex-col items-center justify-center h-screen min-h-full">
      <section className="bg-blue-500 grow">
        <button type="button">Click me</button>
      </section>
      <footer className="h-[200px] bg-red-500">
        Estás logeado
        <button type="button" onClick={signOut}>
          Log Out
        </button>
      </footer>
    </main>
  );
}

export default App;
