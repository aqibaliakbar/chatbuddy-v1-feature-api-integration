// stores/useInstructionsStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface Instruction {
  id: string;
  message: string;
  created_at: string;
}

interface InstructionsStore {
  instructions: Instruction[];
  isLoading: boolean;
  error: string | null;
  getInstructions: (chatbotId: string) => Promise<void>;
  updateInstruction: (
    chatbotId: string,
    id: string,
    message: string
  ) => Promise<void>;
  createInstruction: (chatbotId: string, message: string) => Promise<void>;
  deleteInstruction: (chatbotId: string, id: string) => Promise<void>;
  clearError: () => void;
}

// Type guard to validate instruction data
function isInstruction(value: any): value is Instruction {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.message === "string" &&
    typeof value.created_at === "string"
  );
}

// Type guard to validate instruction array
function isInstructionArray(value: any): value is Instruction[] {
  return Array.isArray(value) && value.every(isInstruction);
}

const useInstructionsStore = create<InstructionsStore>((set) => ({
  instructions: [],
  isLoading: false,
  error: null,

  getInstructions: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/instruction`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch instructions");
      }

      const data = await response.json();

      if (!isInstructionArray(data)) {
        throw new Error("Invalid instruction data received from server");
      }

      set({ instructions: data, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error fetching instructions";
      set({ error: message, isLoading: false });
    }
  },

  createInstruction: async (chatbotId: string, message: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/instruction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create instruction");
      }

      const data = await response.json();

      if (!isInstruction(data)) {
        throw new Error("Invalid instruction data received from server");
      }

      set((state) => ({
        instructions: [...state.instructions, data],
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating instruction";
      set({ error: message, isLoading: false });
    }
  },

  updateInstruction: async (chatbotId: string, id: string, message: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/instruction/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update instruction");
      }

      set((state) => ({
        instructions: state.instructions.map((inst) =>
          inst.id === id ? { ...inst, message } : inst
        ),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error updating instruction";
      set({ error: message, isLoading: false });
    }
  },

  deleteInstruction: async (chatbotId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/instruction/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete instruction");
      }

      set((state) => ({
        instructions: state.instructions.filter((inst) => inst.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error deleting instruction";
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useInstructionsStore;
