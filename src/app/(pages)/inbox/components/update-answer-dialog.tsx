"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";

interface UpdateAnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnswer: string;
  messageId: string;
}

export function UpdateAnswerDialog({
  isOpen,
  onClose,
  currentAnswer,
  messageId,
}: UpdateAnswerDialogProps) {
  const [newAnswer, setNewAnswer] = React.useState(currentAnswer);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const updateChatbot = useChatbotStore((state) => state.trainChatbot);

  const handleUpdateAnswer = async () => {
    if (!selectedChatbotId || !newAnswer.trim()) return;

    setIsLoading(true);
    try {
      await updateChatbot(selectedChatbotId, "", undefined, {
        title: `Updated Answer ${messageId}`,
        content: newAnswer.trim(),
      });

      toast({
        title: "Success",
        description: "Answer has been updated successfully",
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the answer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0" />
        {/* Changed overlay background */}
        <DialogContent className="sm:max-w-[500px] border ">
          <DialogHeader>
            <DialogTitle>Update Answer</DialogTitle>
            <DialogDescription>
              Provide a better answer to improve the chatbot&apos;s response.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter the improved answer..."
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAnswer}
              disabled={isLoading || !newAnswer.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Answer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
