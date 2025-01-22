"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import {
  Lightbulb,
  Sparkles,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Upload,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import liveChat from "../../../public/Livechat.png";
import Image from "next/image";
import ChatbotIframe from "@/components/chatbot-iframe";
import ColorInput from "@/components/color-input";
import { useRouter } from "next/navigation";
import useChatbotStore, { Chatbot } from "@/store/useChatbotStore";

// Valid top-level domains definition
const validTLDs = [
  ".com",
  ".io",
  ".org",
  ".net",
  ".edu",
  ".gov",
  ".co",
  ".app",
  ".dev",
  ".ai",
  ".me",
  ".info",
];

// Type definitions
interface URLValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
}

interface ChatbotSettings {
  chatbotName: string;
  businessName: string;
  accentColor: string;
  theme: "light" | "dark";
  language: string;
  headerIcon: File | null;
}

// URL validation function
const validateUrl = (urlString: string): URLValidationResult => {
  const result: URLValidationResult = {
    isValid: false,
    normalizedUrl: "",
  };

  // Trim whitespace
  let normalizedUrl = urlString.trim();

  // Check for empty URL
  if (!normalizedUrl) {
    result.error = "URL cannot be empty";
    return result;
  }

  // Add https:// if no protocol is specified
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const url = new URL(normalizedUrl);

    // Validate protocol (only http or https allowed)
    if (!["http:", "https:"].includes(url.protocol)) {
      result.error = "URL must use HTTP or HTTPS protocol";
      return result;
    }

    // Validate hostname
    if (!url.hostname) {
      result.error = "Invalid hostname";
      return result;
    }

    // Check for valid TLD
    if (!validTLDs.some((tld) => url.hostname.toLowerCase().endsWith(tld))) {
      result.error = `Domain must end with one of the following TLDs: ${validTLDs.join(
        ", "
      )}`;
      return result;
    }

    // Check for IP addresses
    const ipAddressRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipAddressRegex.test(url.hostname)) {
      result.error = "IP addresses are not allowed";
      return result;
    }

    // Check for minimum length of hostname (excluding TLD)
    const hostnameWithoutTLD = url.hostname.split(".")[0];
    if (hostnameWithoutTLD.length < 2) {
      result.error = "Domain name is too short";
      return result;
    }

    // Check for valid characters in hostname
    const validHostnameRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validHostnameRegex.test(url.hostname)) {
      result.error = "Domain contains invalid characters";
      return result;
    }

    // All validation passed
    result.isValid = true;
    result.normalizedUrl = normalizedUrl;
    return result;
  } catch (error) {
    result.error = "Invalid URL format";
    return result;
  }
};

// Main component
export default function CreateAgentPage() {
  const createChatbot = useChatbotStore((state) => state.createChatbot);
  const scrapUrl = useChatbotStore((state) => state.scrapUrl);
  const scrapeProgress = useChatbotStore((state) => state.scrapeProgress);
  const scannedUrls = useChatbotStore((state) => state.scannedUrls);
  const streamStatus = useChatbotStore((state) => state.streamStatus);
  const updateChatbot = useChatbotStore((state) => state.updateChatbot);
  const getChatbots = useChatbotStore((state) => state.getChatbots);
  const chatbots = useChatbotStore((state) => state.chatbots);
  const [chatbotId, setChatbotId] = useState<string>("");
  const isLoading = useChatbotStore((state) => state.isLoading);
  const error = useChatbotStore((state) => state.error);
  const { toast } = useToast();
  const router = useRouter();
  // State declarations
  const [chatbotName, setChatbotName] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [scrappingId, setScrappingId] = useState<string>("");
  const [url, setUrl] = useState("");

  console.log(url);

  const [currentDomain, setCurrentDomain] = useState("");
  const [mockError, setMockError] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings>({
    chatbotName: "",
    businessName: "",
    accentColor: "#000000",
    theme: "light",
    language: "English",
    headerIcon: null,
  });

  useEffect(() => {
    const loadChatbotsData = async () => {
      if (showPersonalize && chatbotId) {
        await getChatbots();
      }
    };
    loadChatbotsData();
  }, [showPersonalize, chatbotId, getChatbots]);

  useEffect(() => {
    const loadChatbotSettings = async () => {
      if (!chatbotId) return;

      try {
        await getChatbots();
        const selectedBot = chatbots.find(
          (bot) => bot.chatbot.id === chatbotId || bot.chatbot_id === chatbotId
        );

        if (selectedBot?.chatbot) {
          setChatbotSettings({
            chatbotName: selectedBot.chatbot.name,
            businessName: selectedBot.chatbot.name,
            accentColor:
              selectedBot.chatbot.public_settings.chatBotSettings.accentColor,
            theme: selectedBot.chatbot.public_settings.chatBotSettings.theme as
              | "light"
              | "dark",
            language:
              selectedBot.chatbot.private_settings.model.defaultLanguage ===
              "auto"
                ? "English"
                : selectedBot.chatbot.private_settings.model.defaultLanguage
                    .charAt(0)
                    .toUpperCase() +
                  selectedBot.chatbot.private_settings.model.defaultLanguage.slice(
                    1
                  ),
            headerIcon: null,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chatbot settings",
        });
      }
    };

    loadChatbotSettings();
  }, [chatbotId]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);
  // Keyboard event handlers
  const handleChatbotNameKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleChatbotNameSubmit();
    }
  };

  const handleUrlKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (scannedUrls.length === 0) {
        handleFetchLinks();
      } else {
        handleTrainBot();
      }
    }
  };

  const handleBusinessNameKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateAgent();
    }
  };

  // Form submission handlers
  const handleChatbotNameSubmit = async () => {
    if (!chatbotName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a chatbot name",
      });
      return;
    }

    try {
      const result = await createChatbot(chatbotName);
      setChatbotId(result.id);

      setChatbotSettings((prev) => ({
        ...prev,
        chatbotName: chatbotName,
      }));

      setShowUrlInput(true);
    } catch (error) {
      // Error is already handled in the store and shown via useEffect
      return;
    }
  };

  const handleFetchLinks = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a website URL",
      });
      return;
    }

    const validation = validateUrl(url);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: validation.error || "Please enter a valid website URL",
      });
      return;
    }

    try {
      setCurrentDomain(validation.normalizedUrl);
      const scrappingId = await scrapUrl(chatbotId, validation.normalizedUrl);
      setScrappingId(scrappingId); // Store scrappingId for later use
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch links",
      });
    }
  };

  const handleChangeDomain = () => {
    setUrl("");
    useChatbotStore.setState({ scannedUrls: [], scrapeProgress: 0 });
  };
  const handleRemoveLink = (linkToRemove: string) => {
    useChatbotStore.getState().removeUrl(linkToRemove);
    toast({
      title: "Link Removed",
      description: "Link has been removed from training data.",
    });
  };

  const handleTrainBot = async () => {
    if (!scrappingId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No scraping ID found. Please try again.",
      });
      return;
    }

    setIsTraining(true);
    try {
      // Get the trainChatbot function from store
      const trainChatbot = useChatbotStore.getState().trainChatbot;

      // Call training endpoint
      await trainChatbot(chatbotId, scrappingId);

      // If successful, show personalization
      setShowPersonalize(true);
      setChatbotSettings((prev) => ({
        ...prev,
        businessName: chatbotName,
        chatbotName: chatbotName,
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize training. Please try again.",
      });
    } finally {
      setIsTraining(false);
    }
  };
  function notifyFrontendAboutChange() {
    const iframe = document.getElementById(
      "chatbuddyIframe"
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          action: "someChangeOccurred",
          isSomethingChange: true,
        },
        "*"
      );
    }
  }

  const handleCreateAgent = async () => {
    if (!chatbotSettings.businessName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a business name",
      });
      return;
    }

    setIsCreating(true);
    try {
      const nameHasChanged =
        chatbotSettings.businessName !== chatbotSettings.chatbotName;

      const updatedSettings: Partial<Chatbot> = {
        name: chatbotSettings.businessName,
        public_settings: {
          chatBotSettings: {
            theme: chatbotSettings.theme,
            position: "Bottom Right",
            shareIcon: "",
            headerIcon: chatbotSettings.headerIcon ? "" : "",
            accentColor: chatbotSettings.accentColor,
            respondText: ["responds directly 24/7"],
            greetingText: "How can I assist you today? 👋🏻",
            launcherIcon: "",
            launcherText: "Hello 👋",
            showProducts: false,
            enableSources: false,
            hidePoweredBy: false,
            initial_messages: "Hello! 👋 How can I assist you today?",
            showSmartPrompts: true,
            message_placeholder: "Ask a question...",
            autoScrollToNewMessages: true,
            backgroundColor: "",
            buttonColor: "",
            leadForm: {
              enabled: false,
              title: "",
              description: "",
              submitButtonText: "Submit",
              successMessage: "Thank you for your submission!",
              fields: [],
            },
          },
        },
        private_settings: {
          model: {
            defaultLanguage: chatbotSettings.language.toLowerCase(),
            model: "gpt-4o-mini",
            streaming: false,
            temperature: 0.6,
            unAvailable: false,
            persona: "",
            constraints: "",
            instruction: "",
          },
        },
      };

      await updateChatbot(chatbotId, updatedSettings);

      // Fetch updated chatbots list
      await getChatbots();

      notifyFrontendAboutChange();

      toast({
        title: "Success",
        description: nameHasChanged
          ? "Your AI agent has been created and chatbot name updated successfully!"
          : "Your AI agent has been created successfully!",
      });

      router.push("/home");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update chatbot settings. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    router.push("/home");
  };

  const handleIconUpload = async (file: File) => {
    // You'll need to implement file upload logic here
    // This might involve creating a separate API endpoint for file uploads
    // For now, we'll just update the local state
    setChatbotSettings((prev) => ({
      ...prev,
      headerIcon: file,
    }));
  };

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Image size should be less than 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload an image file",
        });
        return;
      }

      await handleIconUpload(file);
    }
  };

  useEffect(() => {
    if (scannedUrls.length > 0) {
      console.log("URLs updated:", scannedUrls);
    }
  }, [scannedUrls]);

  // Personalization View
  if (showPersonalize) {
    return (
      <AppLayout showLoginButton={false} showUserMenu={true} fullWidth>
        <Toaster />
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-104px)]">
          <div className="hidden lg:block lg:w-1/2 bg-cmuted border-r p-4 lg:p-8 mt-[-80px] mb-[-22px]">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-[374px] h-[620px]">
                <ChatbotIframe userId={chatbotId} chatbotId={chatbotId} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center lg:w-1/2 p-4 lg:p-8">
            <div className="max-w-md mx-auto w-full">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">
                  Personalize {chatbotSettings.chatbotName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize how your chatbot looks and behaves
                </p>
              </div>

              <div className="space-y-6 mt-6">
                {/* Icon Upload */}
                <div className="space-y-4">
                  <Label>Header Icon</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center text-white relative overflow-hidden"
                      style={{ backgroundColor: chatbotSettings.accentColor }}
                    >
                      {chatbotSettings.headerIcon ? (
                        <img
                          src={URL.createObjectURL(chatbotSettings.headerIcon)}
                          alt="Header icon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        chatbotSettings.chatbotName?.charAt(0) || "B"
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        document.getElementById("icon-upload")?.click()
                      }
                    >
                      {chatbotSettings.headerIcon ? "Change" : "Upload"}
                    </Button>
                    {chatbotSettings.headerIcon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() =>
                          setChatbotSettings((prev) => ({
                            ...prev,
                            headerIcon: null,
                          }))
                        }
                      >
                        Remove
                      </Button>
                    )}
                    <Input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconChange}
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input
                    value={chatbotSettings.businessName}
                    onChange={(e) =>
                      setChatbotSettings((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    onKeyPress={handleBusinessNameKeyPress}
                    placeholder="Enter your business name"
                  />
                </div>

                {/* Color and Theme */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Accent Color</Label>
                    <ColorInput
                      value={chatbotSettings.accentColor}
                      onChange={(value) =>
                        setChatbotSettings((prev) => ({
                          ...prev,
                          accentColor: value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Theme</Label>
                    <Select
                      value={chatbotSettings.theme}
                      onValueChange={(value: "light" | "dark") =>
                        setChatbotSettings((prev) => ({
                          ...prev,
                          theme: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue>
                          {chatbotSettings.theme === "light" ? (
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Light
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Dark
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Dark
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={chatbotSettings.language}
                    onValueChange={(value) =>
                      setChatbotSettings((prev) => ({
                        ...prev,
                        language: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This language will be used when the chatbot replies to a
                    user
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full"
                    onClick={handleCreateAgent}
                    disabled={isCreating || !chatbotSettings.businessName}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating agent...
                      </>
                    ) : (
                      "Create Agent"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-gray-700 hover:bg-transparent h-11 dark:hover:text-white"
                    onClick={handleSkip}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Initial Name Input View
  if (!showUrlInput) {
    return (
      <AppLayout showLoginButton={false} showUserMenu={true} fullWidth>
        <Toaster />
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
          <div className="hidden lg:block lg:w-1/2 bg-cmuted border-r lg:p-8 mt-[-80px] mb-[-20px]">
            <div className="relative w-full flex justify-center items-center h-full">
              <Image
                src={liveChat}
                alt="livechat-img"
                height={520}
                width={360}
                className="object-contain "
                priority
              />
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center lg:w-1/2 p-4 lg:p-8">
            <div className="max-w-md mx-auto w-full">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Create your AI Agent
                  </h1>
                  <p className="text-sm text-muted-foreground mb-6">
                    Give your chatbot a name that reflects its purpose or
                    personality
                  </p>
                  <Label className="block text-sm font-medium mb-2">
                    Chatbot Name
                  </Label>
                  <Input
                    placeholder="Enter chatbot name (e.g., Sales Assistant)"
                    value={chatbotName}
                    onChange={(e) => setChatbotName(e.target.value)}
                    onKeyPress={handleChatbotNameKeyPress}
                    className="bg-background mb-4"
                  />
                  <Button
                    onClick={handleChatbotNameSubmit}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold w-full"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  That&apos;s how it works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // URL Input View
  if (showUrlInput) {
    return (
      <AppLayout showLoginButton={false} showUserMenu={true} fullWidth>
        <Toaster />
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
          <div className="hidden lg:block lg:w-1/2 bg-cmuted border-r lg:p-8 mt-[-80px] mb-[-20px]">
            <div className="relative w-full flex justify-center items-center h-full">
              <Image
                src={liveChat}
                alt="livechat-img"
                height={520}
                width={360}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center lg:w-1/2 p-4 lg:p-8">
            <div className="max-w-md mx-auto w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Train {chatbotName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Let&apos;s train your chatbot with your website content
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Your Website
                  </label>
                  <Input
                    placeholder="Enter your website URL (e.g., example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleUrlKeyPress}
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>

                {/* Loading State with URL Streaming */}
                {isLoading && (
                  <div className="space-y-4">
                    <Progress value={scrapeProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {streamStatus || "Fetching links from your website..."}
                    </p>
                    {scannedUrls.length > 0 && (
                      <ScrollArea className="h-[400px] rounded-md border p-4">
                        <div className="space-y-2">
                          {scannedUrls.map((link, index) => (
                            <div
                              key={`${link}-${index}`}
                              className="flex items-center justify-between bg-muted/50 p-3 rounded-lg animate-fadeIn"
                            >
                              <span className="text-sm truncate flex-1 mr-4">
                                {link}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:text-destructive"
                                onClick={() => handleRemoveLink(link)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {/* URLs List (When not loading) */}
                {!isLoading && scannedUrls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm truncate max-w-[200px]">
                        {currentDomain}
                      </span>
                      <Button variant="ghost" onClick={handleChangeDomain}>
                        Change domain
                      </Button>
                    </div>
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-2">
                        {scannedUrls.map((link, index) => (
                          <div
                            key={`${link}-${index}`}
                            className="flex items-center justify-between bg-muted/50 p-3 rounded-lg"
                          >
                            <span className="text-sm truncate flex-1 mr-4">
                              {link}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-destructive"
                              onClick={() => handleRemoveLink(link)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={scannedUrls.length === 0 || isTraining}
                      onClick={handleTrainBot}
                    >
                      {isTraining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Training {chatbotName}...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Train {chatbotName}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Initial State - No URLs yet */}
                {!isLoading && scannedUrls.length === 0 && (
                  <>
                    <Button
                      onClick={handleFetchLinks}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={!url || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fetching links...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Fetch Links
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      Enter your website URL and click fetch links
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}
