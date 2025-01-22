"use client";

import React, { useRef, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bell, Sparkles, Share, Loader2, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { InstallChatbotDialog } from "@/components/install-chatbot-dialog";
import { SourcesInstruction } from "@/components/sources-instructions";
import { useTheme } from "next-themes";
import { useSidebarStore } from "@/store/useSidebarStore";
import useChatbotStore from "@/store/useChatbotStore";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { toast } = useToast();
  const [selectedBot, setSelectedBot] = useState("default");
  const [isUploading, setIsUploading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const chatbots = useChatbotStore((state) => state?.chatbots);
  const [chatbotToDelete, setChatbotToDelete] = useState<string | null>(null);
  const deleteChatbot = useChatbotStore((state) => state.deleteChatbot);

  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const setSelectedChatbotId = useChatbotStore(
    (state) => state.setSelectedChatbotId
  );
  const getChatbots = useChatbotStore((state) => state.getChatbots);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const shouldHideSidebarTrigger = [
    "/reports",
    "/appearance",
    "/knowledge",
    "/contacts",
  ].includes(pathname);

  React.useEffect(() => {
    const fetchAndSelectChatbot = async () => {
      try {
        await getChatbots();
        const currentChatbots = useChatbotStore?.getState()?.chatbots;

        console.log("Current chatbots:", currentChatbots);

        if (currentChatbots?.length > 0) {
          const currentSelectedId =
            useChatbotStore.getState().selectedChatbotId;

          if (
            !currentSelectedId ||
            !currentChatbots.find(
              (bot) =>
                bot.chatbot_id === currentSelectedId ||
                bot.chatbot.id === currentSelectedId
            )
          ) {
            setSelectedChatbotId(currentChatbots[0].chatbot.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch chatbots:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chatbots. Please refresh the page.",
        });
      }
    };

    fetchAndSelectChatbot();
  }, [getChatbots, toast]);

  const selectedChatbot = chatbots?.find(
    (bot) =>
      bot.chatbot.id === selectedChatbotId ||
      bot.chatbot_id === selectedChatbotId
  );
  const accentColor =
    selectedChatbot?.chatbot.public_settings?.chatBotSettings?.accentColor ||
    "#22C55E";

  const handleBotChange = (value: string) => {
    setSelectedChatbotId(value);
    toast({
      title: "Chatbot Selected",
      description: `Switched to ${
        chatbots?.find((bot) => bot?.id === value)?.name || "Default Chatbot"
      }`,
    });
  };
  const handleDelete = async () => {
    if (!chatbotToDelete) return;

    try {
      await deleteChatbot(chatbotToDelete);
      setChatbotToDelete(null);
      toast({
        title: "Success",
        description: "Chatbot deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chatbot",
      });
    }
  };

  const handleUploadClick = () => {
    setInstallDialogOpen(true);
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Upgrade Started",
        description: "Redirecting to upgrade flow...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: "There was an error starting the upgrade process.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <header
      className={`sticky z-40 top-0 flex shrink-0 items-center justify-between border-b bg-background p-4 `}
    >
      <div className="flex items-center gap-2">
        <div
          className={
            shouldHideSidebarTrigger
              ? "lg:hidden flex justify-center items-center"
              : "flex justify-center items-center"
          }
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
        <Select
          value={selectedChatbotId || ""}
          onValueChange={handleBotChange}
          disabled={useChatbotStore((state) => state.isLoading)}
        >
          <SelectTrigger className="w-[200px]">
            {useChatbotStore((state) => state.isLoading) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <SelectValue placeholder="Select a chatbot">
                  {selectedChatbot?.chatbot.name || "Select a chatbot"}
                </SelectValue>
              </div>
            )}
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-[300px] overflow-y-auto">
              {chatbots?.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  No chatbots found
                </div>
              ) : (
                chatbots?.map((bot) => (
                  <div key={bot.chatbot.id} className="flex items-center group">
                    <SelectItem
                      value={bot.chatbot.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              bot.chatbot.public_settings?.chatBotSettings
                                ?.accentColor || "#22C55E",
                          }}
                        />
                        <span>{bot.chatbot.name}</span>
                      </div>
                    </SelectItem>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/90 hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setChatbotToDelete(bot.chatbot.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SelectContent>
        </Select>
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={chatbotToDelete !== null}
          onOpenChange={(open) => !open && setChatbotToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chatbot? This action cannot
                be undone and will permanently remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setChatbotToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 p-2"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Share className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
          suppressHydrationWarning
        >
          {theme === "dark" ? (
            <Moon className="h-8 w-8" />
          ) : (
            <Sun className="h-8 w-8" />
          )}
        </Button>
        <Button
          size="sm"
          className="gap-2 h-10 bg-primary hover:bg-primary/90"
          onClick={handleUpgrade}
          disabled={isUpgrading}
        >
          {isUpgrading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Upgrade
            </>
          )}
        </Button>
      </div>

      <InstallChatbotDialog
        open={installDialogOpen}
        onOpenChange={setInstallDialogOpen}
        selectedBot={selectedBot}
      />
    </header>
  );
}

interface LayoutContentProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isSourcesPage = pathname.includes("/add-sources");
  const isHomePage = pathname === "/home";
  const isInboxPage = pathname === "/inbox";
  const isIntegrationPage = pathname === "/integrations";

  const isAddSources = pathname === "/add-sources/";

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div
          className={`flex flex-1 flex-col gap-4 ${
            isHomePage || isIntegrationPage || isInboxPage || isAddSources
              ? ""
              : "md:p-14 p-4"
          }`}
        >
          {children}
          {isSourcesPage && <SourcesInstruction />}
        </div>
      </SidebarInset>
    </>
  );
}

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: SettingsLayoutProps) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "220px",
          "--collapsed-width": "64px",
        } as React.CSSProperties
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
