import { apiClient } from "../utils/api";

export const useAuth = () => {

  const signInWithGoogle = async () => {
    const { error } = await apiClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://hckzsirtpkhuupdqcfia.supabase.co/auth/v1/callback",
      },
    });

    if (error) console.error("Error al iniciar sesión:", error.message);
  };

  function signOut() {
    apiClient.auth
      .signOut()
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error signing out:', error.message);
      });
  }

  return { signInWithGoogle, signOut };

}