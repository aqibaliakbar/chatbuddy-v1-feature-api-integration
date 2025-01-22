import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useChatbotStore from "@/store/useChatbotStore";
import React, { useEffect } from "react";


type ContactField = "name" | "phone" | "email";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { chatbots, selectedChatbotId, updateChatbot } = useChatbotStore();
  const [title, setTitle] = React.useState("Let us know how to contact you");
  const [enabledFields, setEnabledFields] = React.useState<ContactField[]>([]);
  const [showLeadForm, setShowLeadForm] = React.useState(true);

  useEffect(() => {
    if (selectedChatbotId && chatbots.length > 0) {
      const currentChatbot = chatbots.find(
        (bot) => bot.chatbot_id === selectedChatbotId
      );
      if (currentChatbot) {
        const leadForm = currentChatbot.chatbot.public_settings.leadForm;
        setTitle(leadForm.title);
        setShowLeadForm(leadForm.showLeadForm);
        const fields: ContactField[] = [];
        if (leadForm.name) fields.push("name");
        if (leadForm.phone) fields.push("phone");
        if (leadForm.email) fields.push("email");
        setEnabledFields(fields);
      }
    }
  }, [selectedChatbotId, chatbots]);

  const toggleField = (field: ContactField) => {
    setEnabledFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSave = async () => {
    if (selectedChatbotId) {
      try {
        await updateChatbot(selectedChatbotId, {
          public_settings: {
            leadForm: {
              title,
              showLeadForm,
              name: enabledFields.includes("name"),
              phone: enabledFields.includes("phone"),
              email: enabledFields.includes("email"),
            },
          },
        });
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update lead form settings:", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lead Form Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showLeadForm">Enable Lead Form</Label>
            <Switch checked={showLeadForm} onCheckedChange={setShowLeadForm} />
          </div>

          {showLeadForm && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Name</Label>
                  <Switch
                    checked={enabledFields.includes("name")}
                    onCheckedChange={() => toggleField("name")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Phone</Label>
                  <Switch
                    checked={enabledFields.includes("phone")}
                    onCheckedChange={() => toggleField("phone")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>E-Mail</Label>
                  <Switch
                    checked={enabledFields.includes("email")}
                    onCheckedChange={() => toggleField("email")}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#0f172a] text-white hover:bg-[#0f172a]/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
