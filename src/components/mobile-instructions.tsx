"use client";

import { ExternalLink, Lightbulb } from "lucide-react";
import Image from "next/image";
import sources from "../../public/sources.svg";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { usePathname } from "next/navigation";

interface SourceInstruction {
  description: string;
}

const sourceInstructions: Record<string, SourceInstruction> = {
  website: {
    description:
      "Add a website to train your chatbot. We'll crawl the site and extract text,which may take a minute or two, depending on its size.",
  },
  links: {
    description:
      "Add links to train your chatbot. We'll crawl them, extract text, and separate each link by a new line.",
  },
  sitemap: {
    description:
      " We'll automatically crawl the site to extract its content. The process may take a few minutes, depending on the size of the site.",
  },
  files: {
    description:
      "Upload files like PDFs, PNGs, or JPGs containing text to train your chatbot. We'll extract the text content to enhance its responses.",
  },
  text: {
    description:
      "Train your chatbot by entering plain text directly into the text field. Simply paste or type the content, and we'll use it to enhance your chatbot's responses.",
  },
  audio: {
    description:
      "Upload audio files to train your chatbot. We'll transcribe the content and use the text to improve its responses.",
  },
  youtube: {
    description:
      "Insert a YouTube link to train your chatbot. We'll fetch the transcript and use it to enhance its capabilities.",
  },
  notion: {
    description:
      "Connect your Notion account and select a file. We'll process the content to train your chatbot.",
  },
  "google-doc": {
    description:
      "Connect your Google Docs account and select a file. We'll process the content to train your chatbot.",
  },
  shopify: {
    description:
      "We've developed a dedicated app for Shopify, allowing you to seamlessly integrate your products into ChatBuddy. Simply connect and get started!",
  },
  wordpress: {
    description:
      "Simply paste the link to your shop, and all products will be automatically crawled and synced.",
  },
  "add-products": {
    description:
      "Quickly add and showcase your products in the chatbot. Include product images, descriptions, and other details to provide a seamless customer experience.",
  },
  "custom-website": {
    description:
      "Set up custom crawling rules and API integrations for your specific website needs.",
  },
};

export function MobileInstructions() {
  const pathname = usePathname();
  const sourceType = pathname
    ? pathname.split("/").pop() || "website"
    : "website";

  const currentInstructions = sourceInstructions[sourceType] || {
    description:
      "Select a source type from the left to get started with training your chatbot.",
  };

  return (
    <div className="2xl:hidden absolute right-4 top-[80px]">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border cursor-pointer">
            <Lightbulb className="h-4 w-4" />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-start mb-4">
            <Image
              src={sources}
              alt="How it works illustration"
              width={120}
              height={120}
              className="dark:invert"
              priority
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">That&apos;s how it works</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentInstructions.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-sm cursor-pointer mt-2"
            >
              Help center
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
