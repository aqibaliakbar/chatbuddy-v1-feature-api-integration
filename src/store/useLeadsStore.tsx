import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import axios from "axios";

export interface Lead {
  lead_id: string;
  submitted_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  chatbot_id: string;
  last_message_at: string;
  notification: boolean;
  bot_opened_count: number | null;
  country_name: string;
  takeOverAsHuman: boolean;
  takeOverTimeout: string | null;
  is_notification_sent: boolean;
  is_open: boolean;
  lead_source: string | null;
  msgs: any[];
}

interface LeadsState {
  leads: Lead[];
  filteredLeads: Lead[];
  isLoading: boolean;
  error: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  selectedLeads: string[];
  currentPage: number;
  rowsPerPage: number;
  searchQuery: string;
  sortConfig: {
    key: keyof Lead | null;
    direction: "asc" | "desc";
  };

  fetchLeads: (chatbotId: string) => Promise<void>;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setSelectedLeads: (leadIds: string[]) => void;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (key: keyof Lead | null, direction: "asc" | "desc") => void;
  filterLeads: () => void;
}

const initialDateRange = {
  from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  to: new Date(),
};

const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  filteredLeads: [],
  isLoading: false,
  error: null,
  dateRange: initialDateRange,
  selectedLeads: [],
  currentPage: 1,
  rowsPerPage: 10,
  searchQuery: "",
  sortConfig: {
    key: null,
    direction: "asc",
  },

  fetchLeads: async (chatbotId: string) => {
    if (!chatbotId) {
      set({ error: "No chatbot selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get<Lead[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/leads`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      set({
        leads: response.data,
        isLoading: false,
      });

      get().filterLeads();
    } catch (error) {
      let errorMessage = "Failed to fetch leads";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setDateRange: (from: Date | null, to: Date | null) => {
    set({ dateRange: { from, to } });
    get().filterLeads();
  },

  setSelectedLeads: (leadIds: string[]) => {
    set({ selectedLeads: leadIds });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setRowsPerPage: (rows: number) => {
    set({ rowsPerPage: rows, currentPage: 1 });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().filterLeads();
  },

  setSortConfig: (key: keyof Lead | null, direction: "asc" | "desc") => {
    set({ sortConfig: { key, direction } });
    get().filterLeads();
  },

  filterLeads: () => {
    const { leads, searchQuery, dateRange, sortConfig } = get();

    let filtered = leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        lead.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        false ||
        lead.email?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        false ||
        lead.phone?.includes(searchQuery) ||
        false ||
        lead.country_name.toLowerCase().includes(searchQuery.toLowerCase());

      const submittedAt = new Date(lead.submitted_at);
      const matchesDateRange =
        !dateRange.from ||
        !dateRange.to ||
        (submittedAt >= dateRange.from && submittedAt <= dateRange.to);

      return matchesSearch && matchesDateRange;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        if (aValue < bValue) return -direction;
        if (aValue > bValue) return direction;
        return 0;
      });
    }

    set({ filteredLeads: filtered });
  },
}));

export default useLeadsStore;
