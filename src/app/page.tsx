"use client";
import { withAuth } from "@/lib/withAuth";
import CreateAgentPage from "./create-agent/page";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useChatbotStore from "@/store/useChatbotStore";
import LoadingScreen from "@/components/loading-screen";


function Home() {
  const router = useRouter();
  const { chatbots, getChatbots, isLoading } = useChatbotStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeChatbots() {
      try {
        await getChatbots();
        // If there are chatbots, redirect to home page
        if (chatbots && chatbots.length > 0) {
          router.push("/home");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch chatbots:", error);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeChatbots();
  }, [ chatbots, router]);

  // Show loading state while initializing or loading
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
       <LoadingScreen/>
      </div>
    );
  }

  // If no chatbots, show create agent page
  return (
    <>
      <CreateAgentPage />
    </>
  );
}

export default withAuth(Home);
