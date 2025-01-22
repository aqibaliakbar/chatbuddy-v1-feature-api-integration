// stores/useGoogleDocStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface GoogleDocFile {
  id: string;
  name: string;
  mimetype: string;
  selected?: boolean;
}

interface GoogleDocStore {
  isLoading: boolean;
  error: string | null;
  accessCode: string | null;
	selectedFiles: GoogleDocFile[];
	
	

  // Get auth URL and initiate OAuth
  getAuthUrl: (chatbotId: string) => Promise<void>;

  // Fetch files using code
  fetchWithCode: (chatbotId: string, code: string) => Promise<void>;

  // Store selected files
  setSelectedFiles: (files: GoogleDocFile[]) => void;

  // Set access code
  setAccessCode: (code: string) => void;

  // Train selected files
  trainFiles: (chatbotId: string) => Promise<void>;

  // Toggle file selection
  toggleFileSelection: (fileId: string) => void;

  // Clear store
  reset: () => void;
}

interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

const useGoogleDocStore = create<GoogleDocStore>((set, get) => ({
  isLoading: false,
  error: null,
  accessCode: null,
  selectedFiles: [],

  getAuthUrl: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const redirectUri = `${window.location.origin}/add-sources/google`;

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URLL
        }/v1/${chatbotId}/apps/google/auth?redirectUri=${encodeURIComponent(
          redirectUri
        )}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get auth URL");

      const data: any = await response.json();

      // Redirect to Google OAuth page
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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URLL}/v1/${chatbotId}/apps/google/files?code=${code}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch Google Doc data");
    }

    const data = await response.json();
    console.log("API Response:", data);  // Add this log

    // Transform the data to match your interface
    const transformedFiles = data.files.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimetype: file.mimeType,  // Note the case change here
      selected: false
    }));

    console.log("Transformed files:", transformedFiles);  // Add this log
    
    set({
      selectedFiles: transformedFiles,
      accessCode: code,
    });
    
    return transformedFiles;  // Return for debugging
  } catch (error) {
    console.error("Store error:", error);
    set({
      error: error instanceof Error ? error.message : "Failed to fetch files",
    });
    throw error;
  } finally {
    set({ isLoading: false });
  }
},

  setAccessCode: (code: string) => {
    set({ accessCode: code });
  },

  setSelectedFiles: (files: GoogleDocFile[]) => {
    set({ selectedFiles: files.map((file) => ({ ...file, selected: false })) });
  },

  toggleFileSelection: (fileId: string) => {
    set((state) => ({
      selectedFiles: state.selectedFiles.map((file) =>
        file.id === fileId ? { ...file, selected: !file.selected } : file
      ),
    }));
  },

  trainFiles: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const selectedFiles = get().selectedFiles.filter((file) => file.selected);

      if (selectedFiles.length === 0) {
        throw new Error("No files selected");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/v1/${chatbotId}/apps/google/train`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            token: get().accessCode,
            fileIds: selectedFiles.map((file) => ({
              id: file.id,
              mimetype: file.mimetype,
              name: file.name,
            })),
            userId: session.user.id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to train files");
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to train files",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      accessCode: null,
      selectedFiles: [],
      error: null,
      isLoading: false,
    });
  },
}));

export default useGoogleDocStore;
