import { useRouter } from "next/navigation";
import { Users, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  chatbotId?: string;
}

const EmptyState = ({ chatbotId }: EmptyStateProps) => {
  const router = useRouter();

  const handleNavigateToSettings = () => {
    if (chatbotId) {
      router.push(`/appearance`);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center lg:mt-60 px-4">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Users className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Once your chatbot starts collecting leads, they will appear here. You
        can then manage and analyze them easily.
      </p>
      <Button
        variant="outline"
        onClick={handleNavigateToSettings}
        className="hover:bg-primary/5 transition-colors"
      >
        <Link2 className="h-4 w-4 mr-2" />
        View Chatbot Settings
      </Button>
    </div>
  );
};

export default EmptyState;
