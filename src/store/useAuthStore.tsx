import { supabase } from "@/lib/supabase";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
  session: any;
  isLoading: boolean;
  error: string | null;
  setSession: (session: any) => void;
  setIsLoading: (loading: boolean) => void;
  clearError: () => void;
  signIn: (args: { email: string; password: string }) => Promise<any>;
  signUp: (args: { email: string; password: string }) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUser: (args: { username?: string; name?: string }) => Promise<void>;
};

const useAuthStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      setSession: (session) => set({ session }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),

      signIn: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({ session: data.session, isLoading: false });
          return data;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Sign in failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signUp: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/signup-success`,
            },
          });
          if (error) throw error;
          set({ session: data.session, isLoading: false });
          return data;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Sign up failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Google sign in failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ session: null, error: null, isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Sign out failed";
          set({ error: message });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
          });
          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Password reset failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updatePassword: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.updateUser({
            password: password,
          });
          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Password update failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      updateUser: async ({ username, name }) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: {
              username,
              name,
            },
          });

          if (error) throw error;
          set({
            session: {
              ...data.user,
              user_metadata: {
                ...data.user.user_metadata,
                username,
                name,
              },
            },
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Update user failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      skipHydration: false, // Change this to false if you want automatic hydration
      onRehydrateStorage: () => (state) => {
        // Optional: Log when hydration completes
        console.log("Auth store hydrated:", state);
      },
    }
  )
);
export default useAuthStore;
