"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { supabase } from "./supabase";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(session);
        setSession(session);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
      console.log("Auth initialized");
      setIsLoading(false);
      setIsInitialized(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // if (!isInitialized && window.location.pathname !== "/") {
  //   return <FullLoader />;
  // }

  return children;
}
