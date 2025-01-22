"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Menu,
  ChevronLeft,
  User,
  ChevronRight,
  Check,
  Slack,
  TwitterIcon,
  MessageCircle,
  MessageSquareMore,
  Globe,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConversationStore } from "@/store/useConversationStore";
import ChatInput from "./components/chat-input";
import { useSidebar } from "@/components/ui/sidebar";
import EmptyChatState from "./components/empty-chat-state";
import { Conversation } from "@/store/useConversationStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebarStore } from "@/store/useSidebarStore";
import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/useAuthStore";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import useChatbotStore from "@/store/useChatbotStore";
import { ScrollArea } from "@/components/ui/custom-scroll-area";
import { UpdateAnswerDialog } from "./components/update-answer-dialog";

interface ChatComponentProps {
  conversation: Conversation | null;
  isCollapsed?: boolean;
}

export default function InboxPage() {
  const { selectedConversation } = useConversationStore();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setShowMobileInbox } = useSidebarStore();
  return (
    <div className="relative bg-background">
      {/*  Header - Mobile Only */}
      <div className="fixed top-20 left-0 right-0 h-16 border-b bg-background px-4 flex items-center md:hidden z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileInbox(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center justify-between gap-3">
          {selectedConversation ? (
            <>
              <div className="flex gap-2 justify-center items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{selectedConversation.avatar}</AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {selectedConversation.name}
                    </span>
                  </div>
                </div>
              </div>
              <User
                className={`h-4 w-4 transition-transform cursor-pointer ${
                  showUserInfo ? "rotate-180" : ""
                }`}
                onClick={() => setShowUserInfo(!showUserInfo)}
              />
            </>
          ) : (
            <span className="text-muted-foreground">Select a conversation</span>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col  pt-20 lg:pt-28   lg:mt-[-121px] ">
        <div className={`flex flex-1`}>
          {/* Chat area */}
          <div className="relative flex-1 flex flex-col">
            <ChatArea
              conversation={selectedConversation}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* User info sidebar */}
          <div
            className={`
              fixed right-0 top-0 bottom-0 lg:static
              bg-background border-l 
              transition-all duration-300 ease-in-out
              lg:translate-x-0 lg:z-10 z-40
              ${showUserInfo ? "translate-x-0" : "translate-x-full"}
              ${selectedConversation ? "lg:block" : "lg:hidden"}
              w-80 lg:w-80
              ${isCollapsed ? "lg:w-[0px] hover:lg:w-80" : "lg:w-80"}
              pt-16 lg:pt-0
            `}
          >
            {/* Toggle button - Desktop only */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-80 transform -translate-x-full hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile User Info Header */}
            <div className="lg:hidden fixed top-0 right-0 h-16 w-80 border-b bg-background border-2 px-4 flex items-center z-40">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserInfo(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-medium ml-2">Contact Info</span>
            </div>

            {/* UserInfo container with overflow handling */}
            <div className="relative w-full h-full overflow-hidden">
              {/* Collapsed View - Desktop only */}
              <div
                className={`
                absolute inset-0 lg:flex flex-col items-center pt-4
                ${isCollapsed ? "lg:flex" : "lg:hidden"}
                ${isCollapsed ? "hover:opacity-0" : "opacity-0"}
                transition-opacity duration-200
              `}
              ></div>

              {/* Full UserInfo View */}
              <div
                className={`
                w-full
                ${
                  isCollapsed
                    ? "lg:opacity-0 hover:lg:opacity-100"
                    : "opacity-100"
                }
                transition-opacity duration-200
              `}
              >
                <UserInfo conversation={selectedConversation} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay for UserInfo */}
      {showUserInfo && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setShowUserInfo(false)}
        />
      )}
    </div>
  );
}
const ChatArea: React.FC<ChatComponentProps> = ({
  conversation,
  isCollapsed,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [takeOverAsHuman, setTakeOverAsHuman] = useState(false);
  const [updateDialogState, setUpdateDialogState] = React.useState<{
    isOpen: boolean;
    message: string;
    messageId: string;
  }>({
    isOpen: false,
    message: "",
    messageId: "",
  });
  const { session } = useAuthStore();
  const { selectedChatbotId: chatbotId } = useChatbotStore();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URLLL;
  const socket = io(BACKEND_URL);

  useEffect(() => {
    if (!conversation) return;

    setMessages(conversation.msgs || []);
    setTakeOverAsHuman(conversation.takeOverAsHuman || false);
  }, [conversation?.id]);

  useEffect(() => {}, [conversation, messages, takeOverAsHuman]);

  useEffect(() => {
    if (!chatbotId || !conversation?.id) return;

    // Handler for receiving messages from lead
    const handleLeadReceiveMessage = (data: any) => {
      if (data?.leadId === conversation.id) {
        const newMessages = Array.isArray(data?.newMessage)
          ? data?.newMessage
          : [data?.newMessage];

        setMessages((prev) => {
          const filteredMessages = newMessages.filter(
            (newMsg: any) => !prev.some((prevMsg) => prevMsg.id === newMsg.id)
          );
          return [...prev, ...filteredMessages];
        });
      }
    };

    // Handler for message updates from other devices
    const handleOwnerReceiveMessageUpdate = (data: any) => {
      if (data?.leadId === conversation.id) {
        const newMessages = Array.isArray(data?.messageData)
          ? data?.messageData
          : [data?.messageData];

        setMessages((prev) => {
          const filteredMessages = newMessages.filter(
            (newMsg: any) => !prev.some((prevMsg) => prevMsg.id === newMsg.id)
          );
          return [...prev, ...filteredMessages];
        });
      }
    };

    // Connect to socket
    const connectPayload = {
      chatbotId,
      userId: session?.user?.id,
      deviceType: navigator.userAgent,
      deviceId: conversation.id,
    };

    socket.emit("connect_as_owner", connectPayload);
    socket.on("owner_receive_message_from_lead", handleLeadReceiveMessage);
    socket.on("owner_receive_message_update", handleOwnerReceiveMessageUpdate);

    return () => {
      socket.off("owner_receive_message_from_lead", handleLeadReceiveMessage);
      socket.off(
        "owner_receive_message_update",
        handleOwnerReceiveMessageUpdate
      );
    };
  }, [chatbotId, conversation?.id, session?.user?.id]);

  const handleTakeoverToggle = async (value: boolean) => {
    setTakeOverAsHuman(value);
    if (conversation?.id) {
      const takeOverTimeout = value ? Date.now().toString() : null;

      try {
        const { error } = await supabase
          .from("leads")
          .update({
            takeOverAsHuman: value,
            takeOverTimeout,
          })
          .eq("lead_id", conversation.id)
          .eq("chatbot_id", chatbotId);

        if (error) throw error;

        socket.emit("handover_send", {
          chatbotId,
          leadId: conversation.id,
          takeOverAsHuman: value,
        });
      } catch (err) {
        console.error("Error updating takeover status:", err);
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  const handleSendMessage = () => {
    if (!conversation?.id || !newMessage.trim()) return;

    const messageData = {
      id: uuidv4(),
      sender_type: "bot",
      created_at: new Date().toISOString(),
      message: newMessage,
      user_id: session?.user?.id,
      chatbot_id: chatbotId,
      lead_id: conversation.id,
      is_read: true,
      reaction: null,
      sources: null,
      products: null,
    };

    console.log("Sending message:", messageData);

    const sentData = {
      chatbotId,
      leadId: conversation.id,
      leadEmail: conversation.email,
      messageData,
      isFirstMessageWithUserImage: !messages.some((msg) => msg?.owner_name),
    };

    setNewMessage("");
    setMessages((prev) => [...prev, messageData]);
    socket.emit("owner_send_message_to_lead", sentData);
  };

  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <div
      className={`flex h-[calc(100vh-12rem)] lg:h-[calc(100vh-4rem)] px-4  ${
        isCollapsed ? "md:px-40" : "md:px-20 lg:pt-8 lg:pb-4"
      } flex-col`}
    >
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 py-4 scrollbar-hide no-scrollbar "
      >
        <div className="space-y-6 py-4 scrollbar-hide">
          {messages.map((msg, index) => {
            console.log("Rendering message:", msg);
            return (
              <div key={msg.id || index}>
                {msg.sender_type === "user" ? (
                  // User message
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(conversation?.name || "AN")
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className="w-auto rounded-lg bg-muted p-3">
                        <p className="w-auto">
                          {msg.message || "No message content"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {msg.created_at
                          ? new Date(msg.created_at)
                              .toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .toLowerCase()
                          : "No timestamp"}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Bot message
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="w-auto rounded-lg border p-3 text-primary">
                          <p>{msg.message || "No message content"}</p>
                        </div>

                        <div className="flex items-center gap-4 ">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground"
                            onClick={() =>
                              setUpdateDialogState({
                                isOpen: true,
                                message: msg.message,
                                messageId: msg.id,
                              })
                            }
                          >
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Not correct? Update this answer
                            </span>
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {msg.created_at
                              ? new Date(msg.created_at)
                                  .toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  .toLowerCase()
                              : "No timestamp"}
                          </span>
                        </div>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          ME
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Add the UpdateAnswerDialog component */}
      <UpdateAnswerDialog
        isOpen={updateDialogState.isOpen}
        onClose={() =>
          setUpdateDialogState({
            isOpen: false,
            message: "",
            messageId: "",
          })
        }
        currentAnswer={updateDialogState.message}
        messageId={updateDialogState.messageId}
      />

      <div className="mt-auto">
        <ChatInput
          message={newMessage}
          setMessage={setNewMessage}
          onSend={handleSendMessage}
          isHuman={takeOverAsHuman}
          setIsHuman={handleTakeoverToggle}
        />
      </div>
    </div>
  );
};
// UserInfo component
const UserInfo: React.FC<ChatComponentProps> = ({ conversation }) => {
  const [currentStatus, setCurrentStatus] = useState(
    conversation?.status || "open"
  );

  if (!conversation) return null;

  // Function to get platform icon and text
  const getPlatformInfo = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "slack":
        return {
          icon: <Slack className="h-4 w-4" />,
          bgColor: "bg-violet-500",
          text: "Slack",
        };
      case "twitter":
        return {
          icon: <TwitterIcon className="h-4 w-4" />,
          bgColor: "bg-blue-400",
          text: "Twitter",
        };
      case "whatsapp":
        return {
          icon: <MessageCircle className="h-4 w-4" />,
          bgColor: "bg-green-500",
          text: "WhatsApp",
        };
      case "discord":
        return {
          icon: <MessageSquareMore className="h-4 w-4" />,
          bgColor: "bg-indigo-500",
          text: "Discord",
        };
      default:
        return {
          icon: <Globe className="h-4 w-4" />,
          bgColor: "bg-gray-500",
          text: "Website",
        };
    }
  };

  const platformInfo = getPlatformInfo(conversation.platform);

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="p-6">
        {/* UserInfo content */}
        <div className="mb-6 mt-6">
          <Avatar className="mb-2 h-12 w-12">
            <div className="flex h-full w-full items-center justify-center bg-[#F1DCCF] dark:bg-muted text-xl">
              {conversation.avatar}
            </div>
          </Avatar>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Name
            </h4>
            <p className="font-medium">{conversation.name}</p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Email
            </h4>
            {conversation.email ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <p className="font-medium">{conversation.email}</p>
                  <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not provided</p>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Phone
            </h4>
            <p className="font-medium">
              {conversation.phone || (
                <span className="text-sm text-muted-foreground">
                  Not provided
                </span>
              )}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
              Status
            </h4>
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  <Badge
                    variant="outline"
                    className={`rounded-sm px-3 py-1 ${
                      currentStatus === "open"
                        ? "bg-[#077FE7] text-white hover:bg-[#077FE7]/90"
                        : "bg-[#FFAE10] text-black hover:bg-[#FFAE10]/90"
                    }`}
                  >
                    {currentStatus === "open" ? "Open" : "Close"}
                  </Badge>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="start">
                <div className="flex flex-col">
                  <button
                    className={`flex items-center justify-between px-3 py-2 hover:bg-muted text-sm ${
                      currentStatus === "open" ? "bg-muted" : ""
                    }`}
                    onClick={() => setCurrentStatus("open")}
                  >
                    <span>Open</span>
                    {currentStatus === "open" && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    className={`flex items-center justify-between px-3 py-2 hover:bg-muted text-sm ${
                      currentStatus === "close" ? "bg-muted" : ""
                    }`}
                    onClick={() => setCurrentStatus("close")}
                  >
                    <span>Close</span>
                    {currentStatus === "close" && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Conversation via
            </h4>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className={`rounded-sm ${platformInfo.bgColor} text-white hover:${platformInfo.bgColor}/90`}
              >
                {platformInfo.icon}
                <span className="">{platformInfo.text}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
