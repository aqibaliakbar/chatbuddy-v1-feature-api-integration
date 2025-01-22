// stores/useNotionStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { persist } from "zustand/middleware";

interface NotionPage {
  id: string;
  name: string;
  selected?: boolean;
}

interface NotionStore {
  isLoading: boolean;
  error: string | null;
  state: string | null;
  accessCode: string | null;
  selectedPages: NotionPage[];

  // Get auth URL and initiate OAuth
  getAuthUrl: (chatbotId: string) => Promise<void>;
  // Fetch access token using code
  fetchWithCode: (chatbotId: string, code: string) => Promise<void>;
  // Store selected pages
  setSelectedPages: (pages: NotionPage[]) => void;
  // Set access code
  setAccessCode: (code: string) => void;
  // Train selected pages
  trainPages: (chatbotId: string) => Promise<void>;
  // Toggle page selection
  togglePageSelection: (pageId: string) => void;
  // Clear store
  reset: () => void;
}

const useNotionStore = create<NotionStore>()((set, get) => ({
  isLoading: false,
  error: null,
  state: null,
  accessCode: null,
  selectedPages: [],

  getAuthUrl: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      // Get the current origin for the redirect URI
      const origin = window.location.origin;
      const redirectUri = `${origin}/add-sources/notion`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/apps/notion/auth`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get auth URL");

      const data = await response.json();
      set({ state: data.state });

      // Redirect to Notion OAuth page
      window.location.href = data.authUrl;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to get auth URL",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWithCode: async (chatbotId: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      // Get the current origin for the redirect URI
      const redirectUri =
        "https://app.chatbuddy.io/dashboard/data-sources/apps";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/v1/${chatbotId}/apps/notion/fetch?code=${code}&redirectUri=${redirectUri}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch Notion data");
      }

      const data = await response.json();

      // Update selected pages from the response
      if (data.pages) {
        set({
          selectedPages: data.pages.map((page: any) => ({
            id: page.id,
            name: page.name,
            selected: false,
          })),
          accessCode: code,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Notion data",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setAccessCode: (code: string) => {
    set({ accessCode: code });
  },

  setSelectedPages: (pages: NotionPage[]) => {
    set({ selectedPages: pages.map((page) => ({ ...page, selected: false })) });
  },

  togglePageSelection: (pageId: string) => {
    set((state) => ({
      selectedPages: state.selectedPages.map((page) =>
        page.id === pageId ? { ...page, selected: !page.selected } : page
      ),
    }));
  },

  trainPages: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const selectedPages = get().selectedPages.filter((page) => page.selected);
      if (selectedPages.length === 0) {
        throw new Error("No pages selected");
      }

      const userId = session.user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/apps/notion/train`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            access_token: get().accessCode,
            pages: selectedPages.map((page) => ({
              id: page.id,
              name: page.name,
            })),
            notion_training_name: "test notion",
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to train pages");
      }

      // If successful, leave isLoading as false
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to train pages",
        isLoading: false,
      });
      throw error;
    }
  },
  reset: () => {
    set({
      state: null,
      accessCode: null,
      selectedPages: [],
      error: null,
      isLoading: false,
    });
  },
}));

export default useNotionStore;
