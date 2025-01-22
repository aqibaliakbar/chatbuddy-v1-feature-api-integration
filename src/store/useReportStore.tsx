import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import useChatbotStore from "./useChatbotStore";
import axios from "axios";

interface Stat {
  value: number;
  percentChange: number;
}

interface LinkClick {
  url: string;
  clicks: number;
}

interface ReportData {
  conversations: Stat;
  messages: Stat;
  messageLinkClicks: {
    links: LinkClick[];
  };
  positiveFeedback: Stat;
  negativeFeedback: Stat;
  countryCounts: {
    [key: string]: number;
  };
}

interface ReportState {
  data: ReportData | null;
  filteredData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  fetchReport: (chatbotId: string) => Promise<void>;
  setDateRange: (from: Date | null, to: Date | null) => void;
  filterDataByDate: () => void;
}

const initialDateRange = {
  from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
  to: new Date(),
};

const useReportStore = create<ReportState>((set, get) => ({
  data: null,
  filteredData: null,
  isLoading: false,
  error: null,
  dateRange: initialDateRange,

  setDateRange: (from: Date | null, to: Date | null) => {
    set({ dateRange: { from, to } });
    get().filterDataByDate();
  },

  filterDataByDate: () => {
    const { data, dateRange } = get();
    if (!data || !dateRange.from || !dateRange.to) return;

    const filterFactor = Math.random() * 0.5 + 0.5;

    const filteredData: ReportData = {
      conversations: {
        value: Math.floor(data.conversations.value ),
        percentChange: data.conversations.percentChange,
      },
      messages: {
        value: Math.floor(data.messages.value ),
        percentChange: data.messages.percentChange,
      },
      messageLinkClicks: {
        links: data.messageLinkClicks.links.map((link) => ({
          ...link,
          clicks: Math.floor(link.clicks ),
        })),
      },
      positiveFeedback: {
        value: Math.floor(data.positiveFeedback.value ),
        percentChange: data.positiveFeedback.percentChange,
      },
      negativeFeedback: {
        value: Math.floor(data.negativeFeedback.value ),
        percentChange: data.negativeFeedback.percentChange,
      },
      countryCounts: Object.fromEntries(
        Object.entries(data.countryCounts).map(([country, count]) => [
          country,
          Math.floor(count ),
        ])
      ),
    };

    set({ filteredData });
  },

  fetchReport: async (chatbotId: string) => {
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

      const response = await axios.get<ReportData>(
        `${process.env.NEXT_PUBLIC_API_URLLL}/v1/${chatbotId}/report`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      set({ data: response.data });
      get().filterDataByDate(); 
    } catch (error) {
      let errorMessage = "Failed to fetch report data";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useReportStore;
