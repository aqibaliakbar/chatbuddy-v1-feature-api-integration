// stores/useApiTokenStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface ApiToken {
  id: number;
  name: string;
  token: string;
}

interface ApiTokenResponse {
  id: number;
  name: string;
  token: string;
}

interface ApiTokenStore {
  tokens: ApiToken[];
  isLoading: boolean;
  error: string | null;
  createToken: (name: string) => Promise<void>;
  getTokens: () => Promise<void>;
  deleteToken: (id: number) => Promise<void>;
}

const useApiTokenStore = create<ApiTokenStore>((set) => ({
  tokens: [],
  isLoading: false,
  error: null,

  createToken: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/api-tokens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create token");
      }

      const newToken = (await response.json()) as ApiTokenResponse;

      set((state) => ({
        tokens: [
          ...state.tokens,
          {
            id: newToken.id,
            name: newToken.name,
            token: newToken.token,
          },
        ],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create token",
        isLoading: false,
      });
      throw error;
    }
  },

  getTokens: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/api-tokens`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }

      const data = (await response.json()) as ApiTokenResponse[];

      set({
        tokens: data.map((token) => ({
          id: token.id,
          name: token.name,
          token: token.token,
        })),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch tokens",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteToken: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/api-tokens?token_id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete token");
      }

      set((state) => ({
        tokens: state.tokens.filter((token) => token.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete token",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useApiTokenStore;
