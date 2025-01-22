import React from "react";
import {
  MessageSquare,
  ArrowRight,
  Globe,
  Settings,
  BookOpen,
  SwatchBook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

const EmptyLeadsState = () => {
  const router = useRouter();
  const navigationLinks = [
    {
      title: "Quick Setup",
      icon: Settings,
      path: "/general-settings/modal",
      description: "Configure your chatbot",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Add Knowledge",
      icon: BookOpen,
      path: "/knowledge",
      description: "Import your content",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Customize",
      icon: SwatchBook,
      path: "/appearance",
      description: "Personalize the appearance",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
    },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col items-center p-4">
        {/* Icons Group */}
        <div className="relative flex justify-center mb-6 mt-8">
          <div className="absolute left-0 top-0">
            <Globe className="h-5 w-5 text-muted-foreground opacity-20" />
          </div>
          <div className="mx-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground opacity-30" />
          </div>
          <div className="absolute right-0 bottom-0">
            <Globe className="h-5 w-5 text-muted-foreground opacity-20" />
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
          Once your chatbot starts engaging with visitors, their conversations
          will appear here. Let&apos;s get your chatbot ready to connect with
          your audience.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3 mb-6">
          <Button
            variant="outline"
            className="w-full justify-between group"
            onClick={() => router.push("/knowledge")}
          >
            <span>View Setup Guide</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            className="w-full justify-between"
            onClick={() => router.push("/general-settings/modal")}
          >
            <span>Test Your Chatbot</span>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Links */}
        <div className="w-full space-y-2">
          {navigationLinks.map((link) => (
            <Button
              key={link.title}
              variant="outline"
              className="w-full p-3 h-auto hover:bg-accent/50"
              onClick={() => router.push(link.path)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`rounded-lg p-2 ${link.bgColor}`}>
                  <link.icon className={`h-4 w-4 ${link.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{link.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {link.description}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>

        {/* Documentation Link */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>
            Need help? Check our{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => router.push("/knowledge")}
            >
              documentation
            </Button>
          </span>
        </div>
      </div>
    </ScrollArea>
  );
};

export default EmptyLeadsState;
