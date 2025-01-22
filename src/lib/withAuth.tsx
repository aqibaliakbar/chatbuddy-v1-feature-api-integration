"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { supabase } from "./supabase";
import LoadingScreen from "@/components/loading-screen";

export function withAuth(Component: React.ComponentType) {
  return function WrappedComponent(props: any) {
    const router = useRouter();
    const session = useAuthStore((state) => state.session);
    const isLoading = useAuthStore((state) => state.isLoading);

    console.log("session", session)

    useEffect(() => {
      let isMounted = true;

      async function checkSession() {
        if (isLoading) return;

        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (isMounted) {
            if (data.session) {
              useAuthStore.setState((state) => ({
                ...state,
                session: data.session,
                isLoading: false,
              }));
            } else {
              router.replace("/login");
            }
          }
        } catch (error) {
          console.error("Failed to get session:", error);
          if (isMounted) {
            router.replace("/login");
          }
        }
      }

      if (!session && !isLoading) {
        checkSession();
      }

      return () => {
        isMounted = false;
      };
    }, [session, isLoading, router]);

    if (isLoading || !session) {
      return (
        <div>
          <LoadingScreen />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
