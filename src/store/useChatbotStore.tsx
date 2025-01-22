// stores/useChatbotStore.ts
import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { persist } from "zustand/middleware";
import { AccessRole } from "@/navconfig";

export interface Chatbot {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  last_trained_at: string | null;
  sources: any[];
  summary: {
    summary: string;
    token_cost: number;
    inputTokens: number;
    outputTokens: number;
    last_updated: string;
  };
  takeOverTimeout: string;
  public_settings: {
    chatBotSettings: {
      theme: "light" | "dark";
      position: string;
      shareIcon: string;
      headerIcon: string;
      accentColor: string;
      backgroundColor: string;
      buttonColor: string;
      respondText: string[];
      greetingText: string;
      launcherIcon: string;
      launcherText: string;
      showProducts: boolean;
      enableSources: boolean;
      hidePoweredBy: boolean;
      initial_messages: string;
      showSmartPrompts: boolean;
      message_placeholder?: string;
      autoScrollToNewMessages: boolean;
    };
  };
  private_settings: {
    model: {
      model: string;
      persona: string;
      streaming: boolean;
      constraints: string;
      instruction: string;
      temperature: number;
      unAvailable: boolean;
      defaultLanguage: string;
      unAvailabilityMessage?: string;
      last_trained?: string;
    };
  };
}
interface ChatbotResponse {
  id: string;
  name: string;
  created_at: string;
  chatbot_id: string;
  user_id: string;
  access: string;
  status: boolean;
  chatbot: Chatbot;
}

interface TranscriptionResponse {
  transcription: string;
}



interface ChatbotStore {
  isLoading: boolean;
  error: string | null;
  chatbots: ChatbotResponse[];
  scrapeProgress: number;
  scannedUrls: string[];
  streamStatus: string;
  currentChatbot: Chatbot | null;
  isTranscribing: boolean;
  transcriptionError: string | null;
  createChatbot: (name: string) => Promise<Chatbot>;
  scrapUrl: (chatbotId: string, url: string) => Promise<string>;
  removeUrl: (url: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  trainChatbot: (
    chatbotId: string,
    scrappingId: string,
    formData?: FormData,
    textData?: { title: string; content: string }
  ) => Promise<void>;
  getChatbots: () => Promise<void>;
  updateChatbot: (id: string, settings: Partial<Chatbot>) => Promise<void>;
  selectedChatbotId: string | null;
  setSelectedChatbotId: (id: string) => void;
  deleteChatbot: (id: string) => Promise<void>;
  generateTranscript: (file: File) => Promise<string>;
  generateYoutubeTranscript: (url: string) => Promise<string>;
  trainLinks: (chatbotId: string, urls: string[]) => Promise<void>;
  userRole: AccessRole;
  setUserRole: (role: AccessRole) => void;
}

interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      chatbots: [],
      scrapeProgress: 0,
      scannedUrls: [],
      streamStatus: "",
      currentChatbot: null,
      selectedChatbotId: null,
      isTranscribing: false,
      transcriptionError: null,
      userRole: "user", // default role
      setUserRole: (role: AccessRole) => set({ userRole: role }),

      
      createChatbot: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = useAuthStore.getState().session;

          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chatbots`,
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
            const errorData = (await response.json()) as ApiError;
            throw new Error(errorData.message || "Failed to create chatbot");
          }

          const chatbot = (await response.json()) as Chatbot;

          const newChatbotResponse: ChatbotResponse = {
            id: String(Date.now()),
            name: chatbot.name,
            created_at: new Date().toISOString(),
            chatbot_id: chatbot.id,
            user_id: chatbot.created_by,
            access: "owner",
            status: true,
            chatbot: chatbot,
          };

          set((state) => ({
            chatbots: [...state.chatbots, newChatbotResponse],
            isLoading: false,
            error: null,
          }));

          return chatbot;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create chatbot";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      removeUrl: (url: string) => {
        set((state) => ({
          scannedUrls: state.scannedUrls.filter((u) => u !== url),
        }));
      },

      scrapUrl: async (chatbotId: string, url: string) => {
        set({
          isLoading: true,
          error: null,
          scannedUrls: [],
          scrapeProgress: 0,
          streamStatus: "🔍 Initializing website scan...",
        });

        let streamTimeout: NodeJS.Timeout | null = null;
        let totalUrls = 0;
        let processedUrls = 0;
        let scrappingId = "";

        // Cleanup function for the streaming timeout
        const cleanup = () => {
          if (streamTimeout) {
            clearTimeout(streamTimeout);
            streamTimeout = null;
          }
        };

        try {
          const session = useAuthStore.getState().session;

          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          set({ streamStatus: "🌐 Connecting to your website..." });
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const response = await fetch(
            `https://chatbuddy-v1.up.railway.app/scraping?url=${encodeURIComponent(
              url
            )}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                Accept: "text/event-stream",
              },
            }
          );

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Failed to read response");
          }

          set({
            streamStatus:
              "📡 Website connection established! Starting analysis...",
          });
          await new Promise((resolve) => setTimeout(resolve, 800));

          let buffer = "";
          const textDecoder = new TextDecoder();

          const getRandomScanMessage = () => {
            const messages = [
              "🔍 Analyzing page content...",
              "📝 Extracting valuable information...",
              "🔎 Discovering website structure...",
              "📊 Processing website data...",
              "🌐 Mapping website architecture...",
            ];
            return messages[Math.floor(Math.random() * messages.length)];
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              cleanup();
              break;
            }

            buffer += textDecoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              if (trimmedLine.startsWith("event: ")) {
                const event = trimmedLine.substring(7);
                const nextLine = lines.find((l) =>
                  l.trim().startsWith("data: ")
                );

                if (nextLine) {
                  try {
                    const data = JSON.parse(nextLine.trim().substring(6));

                    switch (event.trim()) {
                      case "init":
                        if (data.total) {
                          totalUrls = data.total;
                          set({
                            streamStatus: `🎯 Found ${totalUrls} pages to analyze!`,
                            scrapeProgress: 5,
                          });
                        }
                        break;

                      case "url_processed":
                        if (data.processed && data.results) {
                          processedUrls = data.processed;
                          const progress = Math.floor(
                            (processedUrls / totalUrls) * 100
                          );

                          const result = data.results[0];
                          if (result && result.link) {
                            set((state) => ({
                              scannedUrls: [...state.scannedUrls, result.link],
                              scrapeProgress: progress,
                              streamStatus:
                                processedUrls === totalUrls
                                  ? "✨ Analysis complete! Processing results..."
                                  : `${getRandomScanMessage()} (${processedUrls}/${totalUrls} pages)`,
                            }));
                          }
                        }
                        break;

                      case "req_completed":
                        if (data.scrapping_id) {
                          scrappingId = data.scrapping_id;
                        }
                        set({
                          scrapeProgress: 90,
                          streamStatus:
                            "🎉 Almost there! Finalizing analysis...",
                        });
                        break;

                      case "complete":
                        cleanup();
                        set({
                          isLoading: false,
                          scrapeProgress: 100,
                          streamStatus:
                            "✅ Website analysis complete! Ready for training.",
                        });
                        break;
                    }
                  } catch (e) {
                    console.error("Error parsing data:", e);
                  }
                }
              }
            }
          }
        } catch (error) {
          cleanup();
          const message =
            error instanceof Error ? error.message : "Failed to fetch links";
          set({
            error: message,
            isLoading: false,
            streamStatus: "❌ Error occurred during scan",
          });
          throw error;
        }
        return scrappingId;
      },

      trainChatbot: async (
        chatbotId: string,
        scrappingId: string,
        formData?: FormData,
        textData?: { title: string; content: string }
      ) => {
        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          if (textData) {
            const response = await fetch(
              `https://chatbuddy-v1.up.railway.app/${chatbotId}/training?type=text`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  data: {
                    title: textData.title,
                    content: textData.content,
                  },
                }),
              }
            );

            if (!response.ok) {
              const errorData = (await response.json()) as ApiError;
              throw new Error(
                errorData.message || "Failed to train chatbot with text"
              );
            }

            set({ streamStatus: "Text training initiated successfully" });
            return;
          }

          // If formData is provided, handle file training
          if (formData) {
            const response = await fetch(
              `https://chatbuddy-v1.up.railway.app/${chatbotId}/training?type=file`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: formData,
              }
            );

            if (!response.ok) {
              const errorData = (await response.json()) as ApiError;
              throw new Error(
                errorData.message || "Failed to train chatbot with files"
              );
            }

            set({ streamStatus: "File training initiated successfully" });
            return;
          }

          // Handle website training
          const urls = get().scannedUrls;
          const response = await fetch(
            `https://chatbuddy-v1.up.railway.app/${chatbotId}/training?type=website`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                data: urls,
                scrappingId: scrappingId,
              }),
            }
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ApiError;
            throw new Error(errorData.message || "Failed to train chatbot");
          }

          set({ streamStatus: "Training initiated successfully" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to train chatbot";
          set({ error: message });
          throw error;
        }
      },

      getChatbots: async () => {
        set({ isLoading: true, error: null });
        try {
          const session = useAuthStore.getState()?.session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URLL}/v1/chatbots`,
            {
              headers: {
                Authorization: `Bearer ${session?.access_token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch chatbots");
          }

          const data = (await response.json()) as ChatbotResponse[];

          if (!Array.isArray(data)) {
            console.error("Expected array of chatbots, got:", data);
            throw new Error("Invalid response format");
          }

          // Set user role based on access property from the first chatbot
          if (data.length > 0) {
            const accessRole = data[0].access as AccessRole;
            set({ userRole: accessRole });
          }

          // Store the complete ChatbotResponse array
          set({
            chatbots: data,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch chatbots";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateChatbot: async (id: string, settings: Partial<Chatbot>) => {
        set({ isLoading: true, error: null });
        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chatbots/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify(settings),
            }
          );
          console.log(settings);
          if (!response.ok) {
            throw new Error("Failed to update chatbot");
          }

          const data = (await response.json()) as ChatbotResponse;

          set((state) => ({
            chatbots: state.chatbots.map((bot) =>
              bot.id === id ? { ...bot, chatbot: data.chatbot } : bot
            ),
            currentChatbot: data.chatbot,
            isLoading: false,
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update chatbot";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      setSelectedChatbotId: (id: string) => {
        set({ selectedChatbotId: id });
      },

      deleteChatbot: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chatbots/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete chatbot");
          }

          set((state) => ({
            chatbots: state?.chatbots?.filter((bot) => bot?.id !== id),
            selectedChatbotId:
              state?.selectedChatbotId === id ? null : state?.selectedChatbotId,
            isLoading: false,
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to delete chatbot";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      generateTranscript: async (file: File) => {
        set({ isTranscribing: true, transcriptionError: null });

        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URLLL}/translation/audio`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.statusText}`);
          }

          const data = (await response.json()) as TranscriptionResponse;

          if (!data.transcription) {
            throw new Error("No transcription in response");
          }

          return data.transcription;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          set({ transcriptionError: message });
          throw error;
        } finally {
          set({ isTranscribing: false });
        }
      },

      generateYoutubeTranscript: async (url: string) => {
        set({ isLoading: true, error: null });

        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URLLL}/translation/youtube`,
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
            throw new Error(`Transcription failed: ${response.statusText}`);
          }

          const data = (await response.json()) as TranscriptionResponse;

          if (!data.transcription) {
            throw new Error("No transcription in response");
          }

          return data.transcription;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      trainLinks: async (chatbotId: string, urls: string[]) => {
        set({ isLoading: true, error: null });
        try {
          const session = useAuthStore.getState().session;
          if (!session?.access_token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URLLL}/${chatbotId}/training/v1/web/Links`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ urls }),
            }
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ApiError;
            throw new Error(errorData.message || "Failed to train URLs");
          }

          set({ isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to train URLs";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "chatbot-storage",
      partialize: (state) => ({
        selectedChatbotId: state.selectedChatbotId,
        chatbots: state.chatbots,
      }),
    }
  )
);

export default useChatbotStore;
