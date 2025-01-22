import { create } from "zustand";
import useAuthStore from "./useAuthStore";

export interface PromptData {
  id?: string;
  name: string;
  type: string;
  prompt: string;
  action: string;
  is_highlighted: boolean;
  highlight_color: string;
  text_color: string;
  position: number;
}

interface PromptsStore {
  isLoading: boolean;
  error: string | null;
  prompts: PromptData[];
  createPrompt: (chatbotId: string, promptData: PromptData) => Promise<void>;
  updatePrompt: (
    chatbotId: string,
    promptId: string,
    promptData: PromptData
  ) => Promise<void>;
  deletePrompt: (chatbotId: string, promptId: string) => Promise<void>;
  getPrompts: (chatbotId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

const usePromptsStore = create<PromptsStore>((set, get) => ({
  isLoading: false,
  error: null,
  prompts: [],

  createPrompt: async (chatbotId: string, promptData: PromptData) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(promptData),
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to create prompt");
      }

      await get().getPrompts(chatbotId);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create prompt";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updatePrompt: async (
    chatbotId: string,
    promptId: string,
    promptData: PromptData
  ) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/prompt/${promptId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(promptData),
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to update prompt");
      }

      await get().getPrompts(chatbotId);
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update prompt";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deletePrompt: async (chatbotId: string, promptId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/prompt/${promptId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to delete prompt");
      }

      // Update local state by removing the deleted prompt
      set((state) => ({
        prompts: state.prompts.filter((prompt) => prompt.id !== promptId),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete prompt";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getPrompts: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/prompt`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message || "Failed to fetch prompts");
      }

      const data = await response.json();

      // Type guard to validate the response data
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array");
      }

      // Less strict validation that checks if essential properties exist
      const validatedPrompts: PromptData[] = data.map((prompt) => {
        if (!prompt || typeof prompt !== "object") {
          console.error("Invalid prompt object:", prompt);
          throw new Error("Invalid prompt data format: not an object");
        }

        // Create a validated prompt with default values for missing fields
        const validatedPrompt: PromptData = {
          id: prompt.id?.toString() || undefined,
          name: prompt.name?.toString() || "",
          type: prompt.type?.toString() || "text",
          prompt: prompt.prompt?.toString() || "",
          action: prompt.action?.toString() || "send",
          is_highlighted: Boolean(prompt.is_highlighted),
          highlight_color: prompt.highlight_color?.toString() || "#000000",
          text_color: prompt.text_color?.toString() || "#FFFFFF",
          position: Number(prompt.position) || 0,
        };

        return validatedPrompt;
      });

      set({ prompts: validatedPrompts, isLoading: false });
    } catch (error) {
      console.error("Error in getPrompts:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch prompts";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default usePromptsStore;
