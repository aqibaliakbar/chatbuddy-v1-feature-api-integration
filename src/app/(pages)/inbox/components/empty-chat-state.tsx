import React from "react";
import { MessageSquare, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import logo from "../../../../../public/logo.svg";

const EmptyChatState = () => {
  return (
    <div className="flex h-full lg:h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image
            src={logo}
            alt="ChatBuddy"
            width={48}
            height={48}
            className="rounded-xl dark:invert"
          />
          <h2 className="text-2xl font-bold">ChatBuddy</h2>
        </div>
        <p className="text-muted-foreground">
          Your intelligent conversation companion
        </p>
      </div>

      <div className="relative mb-12">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/5 animate-pulse" />
        <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/3" />

        <div className="relative bg-card rounded-xl p-8 shadow-lg border max-w-md">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Start Chatting</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Select Contact</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/20" />
              <div className="h-2 w-32 rounded-full bg-primary/20" />
            </div>
            <div className="flex gap-2 justify-end">
              <div className="h-2 w-40 rounded-full bg-primary/10" />
              <div className="h-2 w-2 rounded-full bg-primary/10" />
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/20" />
              <div className="h-2 w-24 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>Select a conversation from the sidebar to begin</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>Access chat history and user information</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>Experience seamless conversations with AI assistance</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
