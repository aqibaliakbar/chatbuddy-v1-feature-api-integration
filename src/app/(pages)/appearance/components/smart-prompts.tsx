"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Pencil,
  MoveDown,
  MoveUp,
  Trash2,
  RefreshCcw,
  CirclePlus,
} from "lucide-react";
import ColorInput from "@/components/color-input";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";
import usePromptsStore from "@/store/usePromptsStore";

export interface SmartPrompt {
  id: string;
  text: string;
  type: string;
  prompt: string;
  background: string;
  textColor: string;
  highlightPrompts: boolean;
}

interface SmartPromptsProps {
  prompts: SmartPrompt[];
  onPromptsChange: (prompts: SmartPrompt[]) => void;
}

export function SmartPrompts({ prompts, onPromptsChange }: SmartPromptsProps) {
  const { toast } = useToast();
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const { createPrompt, updatePrompt, deletePrompt, getPrompts, isLoading } =
    usePromptsStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<SmartPrompt | null>(
    null
  );

  const [newPrompt, setNewPrompt] = React.useState<SmartPrompt>({
    id: "",
    text: "Our Discounts",
    type: "AI Response",
    prompt: "What are your discounts?",
    background: "#0641FB",
    textColor: "#FFFFFF",
    highlightPrompts: false,
  });

  const resetNewPrompt = () => {
    setNewPrompt({
      id: "",
      text: "Our Discounts",
      type: "AI Response",
      prompt: "What are your discounts?",
      background: "#0641FB",
      textColor: "#FFFFFF",
      highlightPrompts: false,
    });
  };

  const handleCreatePrompt = async () => {
    if (!selectedChatbotId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No chatbot selected",
      });
      return;
    }

    try {
      const promptData = {
        name: newPrompt.text,
        type: newPrompt.type,
        prompt: newPrompt.prompt,
        action: "AI_RESPONSE",
        is_highlighted: newPrompt.highlightPrompts,
        highlight_color: newPrompt.background,
        text_color: newPrompt.textColor,
        position: prompts.length + 1,
      };

      if (editingPrompt?.id) {
        await updatePrompt(selectedChatbotId, editingPrompt.id, promptData);
        toast({
          title: "Success",
          description: "Prompt updated successfully",
        });
      } else {
        await createPrompt(selectedChatbotId, promptData);
        toast({
          title: "Success",
          description: "Prompt created successfully",
        });
      }

      setIsCreateDialogOpen(false);
      setEditingPrompt(null);
      resetNewPrompt();

      await getPrompts(selectedChatbotId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save prompt",
      });
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!selectedChatbotId) return;

    try {
      await deletePrompt(selectedChatbotId, promptId);
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
      await getPrompts(selectedChatbotId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete prompt",
      });
    }
  };

  const handleMovePrompt = async (currentIndex: number, newIndex: number) => {
    if (newIndex < 0 || newIndex >= prompts.length) return;

    const updatedPrompts = [...prompts];
    const [movedPrompt] = updatedPrompts.splice(currentIndex, 1);
    updatedPrompts.splice(newIndex, 0, movedPrompt);

    // Update positions
    const promptUpdates = updatedPrompts.map((prompt, index) => ({
      ...prompt,
      position: index + 1,
    }));

    onPromptsChange(promptUpdates);

    try {
      await Promise.all(
        promptUpdates.map((prompt) =>
          updatePrompt(selectedChatbotId!, prompt.id, {
            name: prompt.text,
            type: prompt.type,
            prompt: prompt.prompt,
            action: "AI_RESPONSE",
            is_highlighted: prompt.highlightPrompts,
            highlight_color: prompt.background,
            text_color: prompt.textColor,
            position: prompt.position,
          })
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update prompt positions",
      });
    }
  };

  return (
    <div className="space-y-4">
      {prompts.map((prompt, index) => (
        <div key={prompt?.id} className="relative">
          <Input
            value={prompt?.text}
            onChange={(e) => {
              const updatedPrompts = [...prompts];
              updatedPrompts[index] = { ...prompt, text: e.target.value };
              onPromptsChange(updatedPrompts);
            }}
            className="pr-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingPrompt(prompt);
                    setNewPrompt(prompt);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMovePrompt(index, index + 1)}
                  disabled={index === prompts.length - 1}
                >
                  <MoveDown className="mr-2 h-4 w-4" /> Move down
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMovePrompt(index, index - 1)}
                  disabled={index === 0}
                >
                  <MoveUp className="mr-2 h-4 w-4" /> Move up
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      <Button
        variant="secondary"
        size="lg"
        className="rounded-lg  hover:bg-accent"
        onClick={() => {
          resetNewPrompt();
          setIsCreateDialogOpen(true);
        }}
      >
        <CirclePlus className="h-4 w-4" />
        Create SmartPrompt
      </Button>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetNewPrompt();
            setEditingPrompt(null);
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? "Edit SmartPrompt" : "Create SmartPrompt"}
            </DialogTitle>
            <DialogDescription>
              A prompt can generate an AI response, redirect to a link, or send
              an email. Additionally, you can set up follow-up actions that will
              be triggered after the chatbot has responded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="relative">
                <Input
                  value={newPrompt.text}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, text: e.target.value })
                  }
                  placeholder="Our Discounts"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() =>
                    setNewPrompt({ ...newPrompt, text: "Our Discounts" })
                  }
                >
                  <CirclePlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newPrompt.type}
                onValueChange={(value) =>
                  setNewPrompt({ ...newPrompt, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="AI Response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI Response">AI Response</SelectItem>
                  <SelectItem value="Link">Link</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prompt</Label>
              <Input
                value={newPrompt.prompt}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, prompt: e.target.value })
                }
                placeholder="What are your discounts?"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Highlight Prompts</Label>
              <Switch
                checked={newPrompt.highlightPrompts}
                onCheckedChange={(checked) =>
                  setNewPrompt({ ...newPrompt, highlightPrompts: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Background</Label>
              <ColorInput
                value={newPrompt.background}
                onChange={(value) =>
                  setNewPrompt({ ...newPrompt, background: value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Text</Label>
              <ColorInput
                value={newPrompt.textColor}
                onChange={(value) =>
                  setNewPrompt({ ...newPrompt, textColor: value })
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingPrompt(null);
                resetNewPrompt();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreatePrompt}
              disabled={isLoading}
              className="bg-primary text-primary-foreground"
            >
              {editingPrompt ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
