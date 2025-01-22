// stores/useWordPressStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface WordPressConnection {
  url: string;
  lastTrained: string;
  status: "connected" | "disconnected";
}

interface WordPressStore {
  isLoading: boolean;
  error: string | null;
  connection: WordPressConnection | null;

  // Connect to WordPress site
  connectToSite: (chatbotId: string, url: string) => Promise<void>;

  // Disconnect from WordPress site
  disconnectSite: (chatbotId: string) => Promise<void>;

  // Clear store
  reset: () => void;
}

const useWordPressStore = create<WordPressStore>((set) => ({
  isLoading: false,
  error: null,
  connection: null,

  connectToSite: async (chatbotId: string, url: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/${chatbotId}/product/wordpress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to connect to WordPress site"
        );
      }

      set({
        connection: {
          url,
          lastTrained: new Date().toLocaleString(),
          status: "connected",
        },
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to WordPress",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  disconnectSite: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/${chatbotId}/product/wordpress`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to disconnect WordPress site");
      }

      set({ connection: null });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect WordPress",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      connection: null,
      error: null,
      isLoading: false,
    });
  },
}));

export default useWordPressStore;
