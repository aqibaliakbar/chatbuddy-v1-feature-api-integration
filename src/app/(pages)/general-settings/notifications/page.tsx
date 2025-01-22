"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/store/useAuthStore";

export default function NotificationsPage() {
  const { toast } = useToast();
  const session = useAuthStore((state) => state.session);
  const [additionalEmails, setAdditionalEmails] = React.useState<string[]>([]);
  const [showInput, setShowInput] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [startedChat, setStartedChat] = React.useState(true);
  const [takeover, setTakeover] = React.useState(true);
  const limitMessage =
    "I cannot receive messages, please contact me another way.";

  const handleAddEmail = () => {
    if (!showInput) {
      setShowInput(true);
      return;
    }

    if (newEmail && /\S+@\S+\.\S+/.test(newEmail)) {
      const updatedEmails: string[] = [...additionalEmails, newEmail];
      setAdditionalEmails(updatedEmails);
      setNewEmail("");
      setShowInput(false);
      toast({
        description: "Email address added successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        description: "Please enter a valid email address.",
      });
    }
  };

  const handleUpdateNotifications = () => {
    toast({
      description: "Your notification settings have been updated.",
    });
  };

  const primaryEmail = session?.user?.email || "";

  return (
    <div className="w-full max-w-3xl">
      <h1 className="text-xl font-medium mb-6">Email Notifications</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={primaryEmail}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
          {additionalEmails.map((email, index) => (
            <Input
              key={index}
              type="email"
              value={email}
              readOnly
              className="bg-background"
            />
          ))}
          {showInput && (
            <div className="flex gap-2 items-center">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-background"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddEmail();
                  } else if (e.key === "Escape") {
                    setShowInput(false);
                    setNewEmail("");
                  }
                }}
              />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-sm font-normal"
            onClick={handleAddEmail}
          >
            <PlusCircle className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        <div>
          <Separator className="my-6" />
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Show this message to show when limit is hit
              </label>
              <Input
                value={limitMessage}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">Started a Chat</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ve been notified because a visitor on the website
                  initiated a chat.
                </p>
              </div>
              <Switch checked={startedChat} onCheckedChange={setStartedChat} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">Takeover by humans</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A visitor has asked for support from a team member.
                </p>
              </div>
              <Switch checked={takeover} onCheckedChange={setTakeover} />
            </div>
          </Card>
        </div>

        <Button onClick={handleUpdateNotifications} className="mt-6">
          Update notifications
        </Button>
      </div>
    </div>
  );
}
