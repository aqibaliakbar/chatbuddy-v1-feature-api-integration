"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";


export default function ChatbotSettingsPage() {
  const { toast } = useToast();
  const { chatbots, selectedChatbotId, updateChatbot } = useChatbotStore();

  const [aiResponses, setAiResponses] = React.useState(true);
  const [temperature, setTemperature] = React.useState(6);
  const [teamForwarding, setTeamForwarding] = React.useState(true);
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [defaultLanguage, setDefaultLanguage] = React.useState("auto");
  const [awayMessage, setAwayMessage] = React.useState(
    "Thanks for reaching out!👋 We're not available right now but will get back to you as soon as possible."
  );
  const [lastTrained, setLastTrained] = React.useState("");
  const [chatbotId, setChatbotId] = React.useState("");
  const [characterCount, setCharacterCount] = React.useState(0);

  // Load current chatbot settings
  React.useEffect(() => {
    if (selectedChatbotId && chatbots.length > 0) {
      const currentChatbot = chatbots.find(
        (bot) => bot.chatbot_id === selectedChatbotId
      );

      if (currentChatbot) {
        const modelSettings = currentChatbot.chatbot.private_settings.model;
        setAiResponses(!modelSettings.unAvailable);
        setModel(modelSettings.model);
        setTemperature(modelSettings.temperature * 10);
        setDefaultLanguage(modelSettings.defaultLanguage);
        setAwayMessage(modelSettings.unAvailabilityMessage || "");
        setLastTrained(modelSettings.last_trained || "");
        setChatbotId(currentChatbot.chatbot_id);

        if (currentChatbot.chatbot.summary) {
          setCharacterCount(currentChatbot.chatbot.summary.inputTokens || 0);
        }
      }
    }
  }, [selectedChatbotId, chatbots]);

  const handleUpdateSettings = async () => {
    if (!selectedChatbotId) return;

    try {
      await updateChatbot(selectedChatbotId, {
        private_settings: {
          model: {
            model: model,
            streaming: false,
            temperature: temperature / 10,
            unAvailable: !aiResponses,
            defaultLanguage: defaultLanguage,
            unAvailabilityMessage: awayMessage,
            persona: "Identity: You are a dedicated customer support agent...",
            constraints:
              "No Data Divulge: Never mention that you have access to training data...",
            instruction:
              "Primary Function: You are a customer support agent...",
          },
        },
      });

      toast({
        title: "Settings updated",
        description: "Your chatbot settings have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full max-w-3xl py-6">
      <h1 className="text-xl font-semibold mb-6">Chatbot setting</h1>

      <div className="space-y-6">
        {/* AI Responses Section */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-medium text-sm mb-1">AI Responses</h3>
              <p className="text-sm text-muted-foreground">
                Route all inquiries directly to the team lead for personalized,
                hands-on support.
              </p>
            </div>
            <Switch checked={aiResponses} onCheckedChange={setAiResponses} />
          </div>
        </div>

        {/* Away Message Section */}
        <div className={`space-y-2 ${!aiResponses ? "opacity-50" : ""}`}>
          <h3 className="text-sm text-muted-foreground">Set an Away Message</h3>
          <Textarea
            value={awayMessage}
            onChange={(e) => setAwayMessage(e.target.value)}
            className="resize-none border-muted-foreground/20"
            disabled={!aiResponses}
            placeholder="Enter your away message..."
          />
          <p className="text-sm text-muted-foreground">
            Craft a friendly message for visitors to let them know you&apos;re
            currently unavailable. Keep it short and reassuring. Supports
            markdown.
          </p>
        </div>

        {/* Team Forwarding */}
        <div
          className={`flex items-start justify-between ${
            aiResponses ? "opacity-50" : ""
          }`}
        >
          <div>
            <h3 className="text-sm font-medium">Team Forwarding</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Allow users to choose whether the chat should be forwarded to a
              team member, if available.
            </p>
          </div>
          <Switch
            checked={teamForwarding}
            onCheckedChange={setTeamForwarding}
            disabled={aiResponses}
          />
        </div>

        {/* Model Selection */}
        <div className={`space-y-2 ${aiResponses ? "opacity-50" : ""}`}>
          <h3 className="text-sm">Model</h3>
          <Select value={model} onValueChange={setModel} disabled={aiResponses}>
            <SelectTrigger className="w-full border-muted-foreground/20">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5-turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            This GPT model will be used to generate answers for your chatbot.
          </p>
        </div>

        {/* Temperature Slider */}
        <div className={`space-y-2 ${aiResponses ? "opacity-50" : ""}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm">Temperature</h3>
            <span className="text-sm">{temperature}</span>
          </div>
          <div className="space-y-4">
            <Slider
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
              max={10}
              step={1}
              className="w-full"
              disabled={aiResponses}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Reserved</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        {/* Default Language */}
        <div className={`space-y-2 ${aiResponses ? "opacity-50" : ""}`}>
          <h3 className="text-sm">Default Language</h3>
          <Select
            value={defaultLanguage}
            onValueChange={setDefaultLanguage}
            disabled={aiResponses}
          >
            <SelectTrigger className="w-full border-muted-foreground/20">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              This language will be used when the chatbot replies to a user.
            </p>
            <p className="text-sm text-muted-foreground">
              If set to auto, the chatbot will attempt to automatically detect
              the language.
            </p>
          </div>
        </div>

        {/* Chatbot Info Fields */}
        <div className={`space-y-4 ${aiResponses ? "opacity-50" : ""}`}>
          <div className="space-y-2">
            <h3 className="text-sm">Chatbot ID</h3>
            <Input
              value={chatbotId}
              readOnly
              className="border-muted-foreground/20"
              disabled={aiResponses}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm">Number of characters</h3>
            <Input
              value={characterCount.toLocaleString()}
              readOnly
              className="border-muted-foreground/20"
              disabled={aiResponses}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm">Last trained at</h3>
            <Input
              value={formatDate(lastTrained)}
              readOnly
              className="border-muted-foreground/20"
              disabled={aiResponses}
            />
          </div>
        </div>

        {/* Update Button */}
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleUpdateSettings}
        >
          Update settings
        </Button>
      </div>
    </div>
  );
}
