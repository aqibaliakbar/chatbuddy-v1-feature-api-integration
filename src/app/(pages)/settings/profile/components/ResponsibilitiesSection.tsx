import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CirclePlus, X } from "lucide-react";
import { useState } from "react";

export default function ResponsibilitiesSection({
  selectedResponsibilities,
  onRemove,
  onAdd,
}: {
  selectedResponsibilities: string[];
  onRemove: (responsibility: string) => void;
  onAdd: (responsibility: string) => void;
}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResponsibility, setNewResponsibility] = useState("");

  const handleAddResponsibility = () => {
    if (!newResponsibility.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a responsibility before adding.",
      });
      return;
    }

    if (selectedResponsibilities.includes(newResponsibility.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate Responsibility",
        description: "This responsibility has already been added.",
      });
      return;
    }

    onAdd(newResponsibility.trim());
    setNewResponsibility("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Assign Responsibilities</Label>
      <div className="flex flex-wrap items-center gap-2">
        {selectedResponsibilities.map((responsibility) => (
          <Badge
            key={responsibility}
            variant="secondary"
            className="h-8 pl-3 pr-2 flex items-center gap-1"
          >
            {responsibility}
            <X
              className="h-4 w-4 ml-1 cursor-pointer hover:text-destructive"
              onClick={() => onRemove(responsibility)}
            />
          </Badge>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsDialogOpen(true)}
        >
          <CirclePlus className="h-8 w-8" />
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Assign Responsibilities</DialogTitle>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Enter role or responsibility"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddResponsibility();
                  }
                }}
              />
              <Button
                onClick={handleAddResponsibility}
                className="bg-primary hover:bg-primary/90"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
