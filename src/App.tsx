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

  //   if (!session) {
  //     return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  //   }

  return (
    <div>
      {!session && (
        <button type="button" onClick={signInWithGoogle}>
          Iniciar sesión con Google
        </button>
      )}
    </div>
  );
}

export default App;
