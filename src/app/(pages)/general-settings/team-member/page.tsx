"use client";
import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import { useToast } from "@/hooks/use-toast";
import useTeamStore from "@/store/useTeamStore";
import useChatbotStore from "@/store/useChatbotStore";
import { Loader2, Trash2 } from "lucide-react";
import LoadingScreen from "@/components/loading-screen";

export default function TeamMembersPage() {
  const { toast } = useToast();
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const {
    members,
    isLoading,
    getTeamMembers,
    updateTeamMember,
    removeTeamMember,
  } = useTeamStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [memberToDelete, setMemberToDelete] = React.useState<{
    id: string;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    if (selectedChatbotId) {
      getTeamMembers(selectedChatbotId);
    }
  }, [selectedChatbotId, getTeamMembers]);

  const getInitials = (email: string) => {
    return email?.split("@")[0].slice(0, 2).toUpperCase();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!selectedChatbotId) return;

    try {
      await updateTeamMember(selectedChatbotId, userId, newRole);
      toast({
        title: "Success",
        description: "Team member role updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team member role",
      });
    }
  };

  const handleDeleteClick = (userId: string, email: string) => {
    setMemberToDelete({ id: userId, email });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedChatbotId || !memberToDelete) return;

    try {
      await removeTeamMember(selectedChatbotId, memberToDelete.id);
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  if (!selectedChatbotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Chatbot Selected</h2>
          <p className="text-muted-foreground">
            Please select a chatbot from the header to manage team members.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <LoadingScreen/>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Roles and Permissions</h1>
          <InviteMemberDialog />
        </div>
        <div className="bg-cmuted rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">People with access</h2>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(member.customer?.email || member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.customer?.email || member.email}
                    </p>
                    {/* <p className="text-sm text-muted-foreground">
                      {member.access}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={member.access}
                    onValueChange={(value) =>
                      handleRoleChange(member.user_id, value)
                    }
                  >
                    <SelectTrigger className="w-auto max-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="maintainer">Maintainer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteClick(
                        member.user_id,
                        member.customer?.email || member.email
                      )
                    }
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.email} from the
              team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
