// stores/useTeamStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface TeamMember {
  user_id: string;
  email: string;
  access: "owner" | "admin" | "support" | "maintainer";
	status: boolean;
	
  customer?: {
    email: string;
  };
}

interface TeamStore {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  getTeamMembers: (chatbotId: string) => Promise<void>;
  addTeamMember: (
    chatbotId: string,
    emailOrUserId: string,
    access: string
  ) => Promise<void>;
  updateTeamMember: (
    chatbotId: string,
    userId: string,
    access: string
  ) => Promise<void>;
  removeTeamMember: (chatbotId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

const useTeamStore = create<TeamStore>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  getTeamMembers: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/team/${chatbotId}/members`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = (await response.json()) as TeamMember[];
      set({ members: data, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error fetching team members";
      set({ error: message, isLoading: false });
    }
  },

  addTeamMember: async (
    chatbotId: string,
    emailOrUserId: string,
    access: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      // Determine if the input is an email (contains @) or userId
      const isEmail = emailOrUserId.includes("@");
      const requestBody = isEmail
        ? { email: emailOrUserId, access }
        : { userId: emailOrUserId, access };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/team/${chatbotId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add team member");
      }

      // Refresh team members list
      await useTeamStore.getState().getTeamMembers(chatbotId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error adding team member";
      set({ error: message, isLoading: false });
    }
  },

  // Rest of the store implementation remains the same
  updateTeamMember: async (
    chatbotId: string,
    userId: string,
    access: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/team/${chatbotId}/members/${userId}/${access}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update team member");
      }

      await useTeamStore.getState().getTeamMembers(chatbotId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error updating team member";
      set({ error: message, isLoading: false });
    }
  },

  removeTeamMember: async (chatbotId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/team/${chatbotId}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove team member");
      }

      set((state) => ({
        members: state.members.filter((member) => member.user_id !== userId),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error removing team member";
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useTeamStore;
