// SourcesInstruction.tsx
"use client";

import { ExternalLink, Lightbulb } from "lucide-react";
import Image from "next/image";
import sources from "../../public/sources.svg";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { MobileInstructions } from "./mobile-instructions";


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

export function SourcesInstruction() {
  const pathname = usePathname();
  const sourceType = pathname
    ? pathname.split("/").pop() || "website"
    : "website";

  const currentInstructions = sourceInstructions[sourceType] || {
    description:
      "Select a source type from the left to get started with training your chatbot.",
  };

  return (
    <>
      <MobileInstructions />
      <div className="fixed inset-y-0 right-0 hidden 2xl:flex">
        <Separator orientation="vertical" className="h-full" />
        <div className="w-80 p-6 mt-24">
          <div className="flex justify-start">
            <Image
              src={sources}
              alt="How it works illustration"
              width={160}
              height={160}
              className="dark:invert"
              priority
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mt-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border ml-1">
                <span className="text-sm">
                  <Lightbulb className="h-4 w-4" />
                </span>
              </div>
              <h3 className="font-medium">That&apos;s how it works</h3>
            </div>
            <p className="text-sm text-muted-foreground py-4">
              {currentInstructions.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              Help center
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
