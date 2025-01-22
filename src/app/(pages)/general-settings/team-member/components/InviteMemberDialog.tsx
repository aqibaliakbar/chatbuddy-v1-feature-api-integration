"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plus, PlusCircle, X } from "lucide-react";
import team from "../../../../../../public/team.svg";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import useTeamStore from "@/store/useTeamStore";
import useChatbotStore from "@/store/useChatbotStore";

export function InviteMemberDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [responsibilities, setResponsibilities] = React.useState<string[]>([
    "Customer Service",
  ]);
  const [showResponsibilityInput, setShowResponsibilityInput] =
    React.useState(false);
  const [newResponsibility, setNewResponsibility] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<string>("support");

  const rolePermissions = [
    "Access all settings",
    "Manage training sources",
    "Customize the chatbot",
  ];

  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const addTeamMember = useTeamStore((state) => state.addTeamMember);

  const removeResponsibility = (responsibility: string) => {
    setResponsibilities(responsibilities.filter((r) => r !== responsibility));
  };

  const handleAddResponsibility = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility("");
      setShowResponsibilityInput(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedChatbotId || !email || !role) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create the request body with email (not userId)
      await addTeamMember(selectedChatbotId, email, role);

      toast({
        title: "Success",
        description: "Team member invited successfully",
      });
      setIsOpen(false);
      setEmail("");
      setRole("support");
      setResponsibilities(["Customer Service"]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to invite team member",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 " />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <div className="flex justify-start my-6">
          <Image
            src={team}
            width={240}
            height={160}
            alt="Team collaboration illustration"
            className="dark:invert"
          />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter team member's email"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="maintainer">Maintainer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the appropriate role for the team member
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Assign Responsibilities
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {responsibilities.map((responsibility) => (
                  <Badge
                    key={responsibility}
                    variant="secondary"
                    className="gap-1 h-7 pl-2 pr-1"
                  >
                    {responsibility}
                    <span
                      onClick={() => removeResponsibility(responsibility)}
                      className="ml-1 hover:bg-muted rounded p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
                {!showResponsibilityInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setShowResponsibilityInput(true)}
                  >
                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              {showResponsibilityInput && (
                <Input
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyDown={handleAddResponsibility}
                  placeholder="Type and press Enter"
                  autoFocus
                  className="mt-2"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Enter keywords for your role to help route inquiries to the right
              contact.
            </p>
          </div>

          <div className="grid gap-2 mt-4">
            <label className="text-sm font-medium">Role Permissions:</label>
            <div className="space-y-2">
              {rolePermissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-green-500" />
                  {permission}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-fit mt-2"
            onClick={handleInvite}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              "Invite"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
