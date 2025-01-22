// stores/useConversation.ts
import { create } from "zustand";

export interface Conversation {
  id: string; 
  name: string;
  avatar: string;
  message: string;
  time: string;
  status: "open" | "close";
  isRead: boolean;
  platform: string; 
  email: string | null;
  phone: string | null;
  country: string;
  msgs: any[];
  takeOverAsHuman: boolean;
}

interface ConversationStore {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
