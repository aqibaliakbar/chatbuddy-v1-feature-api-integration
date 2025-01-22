import * as React from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus, Book } from "lucide-react";
import { useRouter } from "next/navigation";

const SourcesEmptyState = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center mt-60 px-4">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Book className="h-12 w-12 text-primary" />
      </div>

      <h3 className="text-lg font-semibold mb-2">No sources added yet</h3>

      <p className="text-muted-foreground text-center max-w-sm mb-8">
        Train your chatbot by adding different types of sources like websites,
        files, or documents. Your chatbot will learn from these sources to
        provide better responses.
      </p>

      <div className="flex flex-col gap-2 items-center">
        <Button
          onClick={() => router.push("/add-sources/website")}
          className="gap-2"
        >
          <CirclePlus className="h-4 w-4" />
          Add Your First Source
        </Button>

        <div className="flex flex-col items-center gap-2 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span>Add websites and web pages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span>Upload documents and files</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span>Import from various platforms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesEmptyState;
