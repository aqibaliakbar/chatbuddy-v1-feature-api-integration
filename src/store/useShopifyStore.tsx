import { create } from "zustand";
import useAuthStore from "./useAuthStore";

interface ShopifyConnection {
  shop: string;
  lastTrained: string;
  code?: string;
}

interface ShopifyStore {
  isLoading: boolean;
  error: string | null;
  connection: ShopifyConnection | null;
  getAuthUrl: (chatbotId: string, shop: string) => Promise<void>;
  connectWithCode: (
    chatbotId: string,
    shop: string,
    code: string
  ) => Promise<void>;
  disconnectStore: (chatbotId: string) => Promise<void>;
  reset: () => void;
}

const useShopifyStore = create<ShopifyStore>((set) => ({
  isLoading: false,
  error: null,
  connection: null,

  getAuthUrl: async (chatbotId: string, shop: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const redirectUri = `http://localhost:5173/dashboard/products`;
      const encodedRedirectUri = redirectUri;
      const encodedShop = shop;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/${chatbotId}/product/shopify/auth?shop=${encodedShop}&redirectUri=${encodedRedirectUri}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to get auth URL");
      }

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        const authUrl = data.authUrl || data.url;
        if (!authUrl) {
          throw new Error("No auth URL received");
        }
        window.location.href = authUrl;
      } catch (e) {
        if (responseText.startsWith("http")) {
          window.location.href = responseText;
        } else {
          throw new Error("Invalid response format");
        }
      }
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

  connectWithCode: async (chatbotId: string, shop: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URLL}/${chatbotId}/product/shopify/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            shop,
            code,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to connect to Shopify");
      }

      set({
        connection: {
          shop,
          lastTrained: new Date().toLocaleString(),
        },
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Shopify",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  disconnectStore: async (chatbotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = useAuthStore.getState().session;
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${chatbotId}/product/shopify`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to disconnect Shopify store");
      }

      set({ connection: null });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Shopify",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      connection: null,
      error: null,
      isLoading: false,
    });
  },
}));

export default useShopifyStore;
