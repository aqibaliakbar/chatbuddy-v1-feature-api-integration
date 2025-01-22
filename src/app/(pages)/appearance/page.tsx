"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";

import ColorInput from "@/components/color-input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import ChatbotIframe from "@/components/chatbot-iframe";
import useChatbotStore from "@/store/useChatbotStore";
import useAuthStore from "@/store/useAuthStore";
import usePromptsStore from "@/store/usePromptsStore";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/loading-screen";
import { SmartPrompt, SmartPrompts } from "./components/smart-prompts";

interface UploadedImage {
  url: string;
  file: File | null;
}

interface ChatbotConfig {
  name: string;
  welcomeMessage: string;
  accentColor: string;
  buttonColor: string;
  backgroundColor: string;
  theme: "light" | "dark";
  headerIcon: UploadedImage | null;
  greetingText: string;
  respondText: string[];
  assistantProfilePicture: UploadedImage | null;
  launcherIcon: UploadedImage | null;
  smartPrompts: {
    enabled: boolean;
    prompts: SmartPrompt[];
  };
  hidePoweredBy: boolean;
  enableSources: boolean;
  autoScroll: boolean;
  position: "bottom-right" | "bottom-left";
  messagePlaceholder: string;
}

function ImageUploadField({
  label,
  value,
  onChange,
  onReset,
  helperText = "Displayed in the launcher button, 100 × 100px recommended.",
}: {
  label: string;
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  onReset: () => void;
  helperText?: string;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ url, file });
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {value?.url ? (
            <Button
              variant="outline"
              className="h-10 w-10 p-0 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={value.url}
                alt={label}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        </div>
      </div>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <p className="text-sm text-muted-foreground">{helperText}</p>
    </div>
  );
}

export default function AppearancePage() {
  const { toast } = useToast();
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const updateChatbot = useChatbotStore((state) => state.updateChatbot);
  const getChatbots = useChatbotStore((state) => state.getChatbots);
  const chatbots = useChatbotStore((state) => state.chatbots);
  const prompts = usePromptsStore((state) => state.prompts);
  const getPrompts = usePromptsStore((state) => state.getPrompts);
  const userId = useAuthStore((state) => state.session?.user?.id);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [initialLoadDone, setInitialLoadDone] = React.useState(false);

  const [config, setConfig] = React.useState<ChatbotConfig>({
    name: "",
    welcomeMessage: "",
    accentColor: "#000000",
    buttonColor: "#000000",
    backgroundColor: "#000000",
    theme: "light",
    headerIcon: null,
    greetingText: "",
    respondText: ["Our AI Agent", "responds directly 24/7"],
    assistantProfilePicture: null,
    launcherIcon: null,
    smartPrompts: {
      enabled: true,
      prompts: [],
    },
    hidePoweredBy: false,
    enableSources: false,
    autoScroll: true,
    position: "bottom-right",
    messagePlaceholder: "Ask a question...",
  });

  const [smartPrompts, setSmartPrompts] = React.useState<SmartPrompt[]>([]);

  // Load initial chatbots
  React.useEffect(() => {
    const loadInitialChatbots = async () => {
      if (!initialLoadDone) {
        try {
          await getChatbots();
          setInitialLoadDone(true);
        } catch (error) {
          console.error("Error loading initial chatbots:", error);
        }
      }
    };

    loadInitialChatbots();
  }, [getChatbots, initialLoadDone]);

  // Load chatbot settings and prompts
  React.useEffect(() => {
    const loadChatbotSettings = async () => {
      if (!selectedChatbotId || chatbots.length === 0) {
        setIsLoading(false);
        return;
      }

    

      try {
        // Find the selected chatbot
        const selectedBot = chatbots.find(
          (bot) =>
            String(bot.id) === String(selectedChatbotId) ||
            bot.chatbot_id === selectedChatbotId ||
            bot.chatbot.id === selectedChatbotId
        );

        if (
          !selectedBot?.chatbot ||
          !selectedBot.chatbot.public_settings?.chatBotSettings
        ) {
          throw new Error("Invalid chatbot data structure");
        }

        const settings = selectedBot.chatbot.public_settings.chatBotSettings;

        // Set basic config
        setConfig({
          name: selectedBot.chatbot.name || "",
          welcomeMessage: settings.initial_messages || "",
          accentColor: settings.accentColor || "#000000",
          buttonColor: settings.buttonColor || "#000000",
          backgroundColor: settings.backgroundColor || "#000000",
          theme: settings.theme || "light",
          headerIcon: settings.headerIcon
            ? {
                url: settings.headerIcon,
                file: null,
              }
            : null,
          greetingText: settings.greetingText || "",
          respondText: [
            settings.respondText?.[0] || "Our AI Agent",
            settings.respondText?.[1] || "responds directly 24/7",
          ],
          assistantProfilePicture: null,
          launcherIcon: settings.launcherIcon
            ? {
                url: settings.launcherIcon,
                file: null,
              }
            : null,
          smartPrompts: {
            enabled: settings.showSmartPrompts ?? true,
            prompts: [],
          },
          hidePoweredBy: settings.hidePoweredBy ?? false,
          enableSources: settings.enableSources ?? false,
          autoScroll: settings.autoScrollToNewMessages ?? true,
          position: (settings.position?.toLowerCase().replace(" ", "-") ||
            "bottom-right") as "bottom-right" | "bottom-left",
          messagePlaceholder:
            settings.message_placeholder || "Ask a question...",
        });

        // Load prompts
        await getPrompts(selectedChatbotId);
      } catch (error) {
        console.error("Error loading chatbot settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chatbot settings",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChatbotSettings();
  }, [selectedChatbotId, chatbots, toast, getPrompts]);

  React.useEffect(() => {
    if (prompts.length > 0) {
      const mappedPrompts = prompts.map((p) => ({
        id: p.id || "",
        text: p.name,
        type: p.type,
        prompt: p.prompt,
        background: p.highlight_color,
        textColor: p.text_color,
        highlightPrompts: p.is_highlighted,
      }));

      setSmartPrompts(mappedPrompts);
    }
  }, [prompts]);

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

  const handleSaveSettings = async () => {
    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a chatbot first",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = {
        name: config.name,
        public_settings: {
          chatBotSettings: {
            theme: config.theme,
            position:
              config.position === "bottom-right"
                ? "Bottom Right"
                : "Bottom Left",
            shareIcon: "",
            headerIcon: config.headerIcon?.url || "",
            accentColor: config.accentColor,
            respondText: config.respondText,
            greetingText: config.greetingText,
            launcherIcon: config.launcherIcon?.url || "",
            launcherText: "Hello 👋",
            showProducts: false,
            enableSources: config.enableSources,
            hidePoweredBy: config.hidePoweredBy,
            showSmartPrompts: config.smartPrompts.enabled,
            message_placeholder: config.messagePlaceholder,
            autoScrollToNewMessages: config.autoScroll,
            initial_messages: config.welcomeMessage,
            buttonColor: config.buttonColor,
            backgroundColor: config.backgroundColor,
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
      };

      await updateChatbot(selectedChatbotId, updatedSettings);
      await getChatbots();
      notifyFrontendAboutChange();

      toast({
        title: "Success",
        description: "Chatbot settings updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update chatbot settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedChatbotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Chatbot Selected</h2>
          <p className="text-muted-foreground">
            Please select a chatbot from the header to customize its settings.
          </p>
        </div>
      </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-[calc(100vh-200px)]">
  //       <div className="text-center space-y-4">
  //         <LoadingScreen />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6 p-4= ">
      <div className="w-full lg:w-1/2">
        <div className="space-y-6 pb-12 pr-4">
          <div className="space-y-2">
            <Label>Chatbot name</Label>
            <Input
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Welcome Message(s)</Label>
            <Textarea
              value={config.welcomeMessage}
              onChange={(e) =>
                setConfig({ ...config, welcomeMessage: e.target.value })
              }
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Customize the welcome message(s) that your chatbot will display.
              Separate each message with a new line. Supports markdown.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <ColorInput
                value={config.accentColor}
                onChange={(value) =>
                  setConfig({ ...config, accentColor: value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={config.theme}
                onValueChange={(value: "light" | "dark") =>
                  setConfig({ ...config, theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background</Label>
              <ColorInput
                value={config.backgroundColor}
                onChange={(value) =>
                  setConfig({ ...config, backgroundColor: value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Button</Label>
              <ColorInput
                value={config.buttonColor}
                onChange={(value) =>
                  setConfig({ ...config, buttonColor: value })
                }
              />
            </div>
          </div>
          <ImageUploadField
            label="Your Logo"
            value={config.headerIcon}
            onChange={(image) => setConfig({ ...config, headerIcon: image })}
            onReset={() => setConfig({ ...config, headerIcon: null })}
          />
          <ImageUploadField
            label="Dark Modus Logo"
            value={config.headerIcon}
            onChange={(image) => setConfig({ ...config, headerIcon: image })}
            onReset={() => setConfig({ ...config, headerIcon: null })}
          />

          <div className="space-y-2">
            <Label>Greeting text</Label>
            <Input
              value={config.greetingText}
              onChange={(e) =>
                setConfig({ ...config, greetingText: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              By pressing enter you can add multiple lines of text.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Message </Label>
            <Input
              value={config.messagePlaceholder}
              onChange={(e) =>
                setConfig({ ...config, messagePlaceholder: e.target.value })
              }
              placeholder="Ask a question..."
            />
            <p className="text-sm text-muted-foreground">
              This text will be shown in the chat input field when it&apos;s
              empty.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Respond text</Label>
            <Input
              value={config.respondText[0]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  respondText: [e.target.value, config.respondText[1]],
                })
              }
              placeholder="Our AI Agent"
              className="mb-2"
            />
            <Input
              value={config.respondText[1]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  respondText: [config.respondText[0], e.target.value],
                })
              }
              placeholder="responds directly 24/7"
            />
          </div>

          <ImageUploadField
            label="Assistant Profile Picture"
            value={config.assistantProfilePicture}
            onChange={(image) =>
              setConfig({ ...config, assistantProfilePicture: image })
            }
            onReset={() =>
              setConfig({ ...config, assistantProfilePicture: null })
            }
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={config.smartPrompts.enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    smartPrompts: { ...config.smartPrompts, enabled: checked },
                  })
                }
              />
              <Label>Smart Prompts</Label>
            </div>

            {config.smartPrompts.enabled && (
              <SmartPrompts
                prompts={smartPrompts}
                onPromptsChange={setSmartPrompts}
              />
            )}
          </div>

          <ImageUploadField
            label="Launcher Icon"
            value={config.launcherIcon}
            onChange={(image) => setConfig({ ...config, launcherIcon: image })}
            onReset={() => setConfig({ ...config, launcherIcon: null })}
          />

          <div className="space-y-4 ">
            <div className="flex items-center justify-between">
              <Label>Hide Powered By</Label>
              <Switch
                checked={config.hidePoweredBy}
                onCheckedChange={(checked) => {
                  console.log(
                    "Attempting to change hidePoweredBy to:",
                    checked
                  );
                  setConfig((prevConfig) => {
                    const newConfig = {
                      ...prevConfig,
                      hidePoweredBy: checked,
                    };
                    console.log("New config:", newConfig);
                    return newConfig;
                  });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Sources</Label>
              <Switch
                checked={config.enableSources}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enableSources: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto Scroll To New Messages</Label>
              <Switch
                checked={config.autoScroll}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, autoScroll: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={config.position}
              onValueChange={(value: "bottom-right" | "bottom-left") =>
                setConfig({ ...config, position: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <div className="flex justify-center items-center pt-8">
            <Button
              onClick={handleSaveSettings}
              className="w-full mx-auto md:w-[50%]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <Separator
        orientation="vertical"
        className="hidden lg:block h-auto self-stretch my-[-80px] shadow-lg"
      />
      <div className="w-full xl:w-1/2 2xl:w-1/3 2xl:fixed h-full lg:right-[80px] rounded-lg p-4  lg:mt-10">
        <div className="relative w-full h-full flex items-start justify-center">
          <div
            style={{
              boxShadow: "0px 8px 16px 0px #00000014",
              borderRadius: "12px",
            }}
            className="w-[387px] h-[650px]"
          >
            <ChatbotIframe userId={userId} chatbotId={selectedChatbotId} />
          </div>
        </div>
      </div>
    </div>
  );
}
