import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface StatusResponse {
  status: "done" | "pending" | "failed";
}

export interface Source {
  id: string;
  name: string;
  source_type: string;
  size?: string;
  status: "done" | "pending" | "failed";
  auto_sync_interval: string | null;
  last_modified: string;
  created_at: string;
  chatbot_id: string;
}

interface SourcesState {
  sources: Source[];
  isLoading: boolean;
  error: string | null;

  getSources: (chatbotId: string) => Promise<Source[]>;
  getSource: (chatbotId: string, sourceId: string) => Promise<Source>;
  updateSource: (
    chatbotId: string,
    sourceId: string,
    data: Partial<Source>
  ) => Promise<Source>;
  deleteSource: (chatbotId: string, sourceId: string) => Promise<void>;
}

interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

const useSourcesStore = create<SourcesState>((set, get) => ({
  sources: [],
  isLoading: false,
  error: null,

  getSources: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/chatbots/${chatbotId}/sources`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to fetch sources");
      }

      const data = (await response.json()) as Source[];
      set({ sources: data, isLoading: false });
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch sources";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getSource: async (chatbotId: string, sourceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/chatbots/${chatbotId}/sources/${sourceId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to fetch source");
      }

      const data = (await response.json()) as Source;
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch source";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateSource: async (
    chatbotId: string,
    sourceId: string,
    data: Partial<Source>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/chatbots/${chatbotId}/sources/${sourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to update source");
      }

      const updatedSource = (await response.json()) as Source;

      set((state) => ({
        sources: state.sources.map((source) =>
          source.id === sourceId ? { ...source, ...updatedSource } : source
        ),
        isLoading: false,
      }));

      return updatedSource;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update source";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteSource: async (chatbotId: string, sourceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbots/${chatbotId}/sources/${sourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to delete source");
      }

      set((state) => ({
        sources: state.sources.filter((source) => source.id !== sourceId),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete source";
      set({ error: message, isLoading: false });
      throw error;
    }
  },
}));

export default useSourcesStore;
