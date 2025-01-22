"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useChatbotStore from "@/store/useChatbotStore";

interface WebsiteLink {
  id: string;
  status: "Success" | "Processing" | "Failed";
  link: string;
  size: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  let variant: "outline" | "secondary" | "destructive" = "outline";
  let icon = null;

  switch (status) {
    case "Processing":
      variant = "secondary";
      icon = <Loader2 className="h-3 w-3 animate-spin mr-1" />;
      break;
    case "Failed":
      variant = "destructive";
      break;
    case "Success":
      variant = "outline";
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status}
    </Badge>
  );
};

export default function WebsitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [activeUrl, setActiveUrl] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [scrappingId, setScrappingId] = useState<string>("");
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const scrapUrl = useChatbotStore((state) => state.scrapUrl);
  const trainChatbot = useChatbotStore((state) => state.trainChatbot);
  const chatbots = useChatbotStore((state) => state.chatbots);
  const scannedUrls = useChatbotStore((state) => state.scannedUrls);
  const scrapeProgress = useChatbotStore((state) => state.scrapeProgress);
  const streamStatus = useChatbotStore((state) => state.streamStatus);
  const getChatbots = useChatbotStore((state) => state.getChatbots);

  useEffect(() => {
    getChatbots();
  }, [getChatbots]);

  useEffect(() => {
    if (isLoading && streamStatus) {
      if (toastId) {
        toast({
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {streamStatus}
              </div>
              {scrapeProgress > 0 && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${scrapeProgress}%` }}
                  />
                </div>
              )}
            </div>
          ),
          duration: 100000,
        });
      } else {
        const id = toast({
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {streamStatus}
              </div>
              {scrapeProgress > 0 && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${scrapeProgress}%` }}
                  />
                </div>
              )}
            </div>
          ),
          duration: 100000,
        });
      }
    }

    if (scrapeProgress === 100) {
      toast({
        description: "Website crawling completed successfully!",
        duration: 3000,
      });
      setToastId(null);
    }
  }, [streamStatus, scrapeProgress, isLoading, toast, toastId]);

  useEffect(() => {
    if (scannedUrls.length > 0) {
      const newLinks: WebsiteLink[] = scannedUrls.map((link, index) => ({
        id: String(index + 1),
        status: "Success",
        link: link,
        size: `${Math.floor(Math.random() * 1000)}KB`,
      }));
      setLinks(newLinks);
    }
  }, [scannedUrls]);

  const selectedChatbot = chatbots.find(
    (bot) =>
      bot.chatbot.id === selectedChatbotId ||
      bot.chatbot_id === selectedChatbotId
  )?.chatbot;

  const handleCrawl = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    if (!selectedChatbot?.id) {
      toast({
        title: "Error",
        description: "No chatbot selected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setActiveUrl(url);
    setLinks([]);

    try {
      const scrappingId = await scrapUrl(selectedChatbot.id, url);
      setScrappingId(scrappingId);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to crawl website",
        variant: "destructive",
      });
      setToastId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainBot = async () => {
    if (selectedLinks.length === 0 || !selectedChatbot?.id || !scrappingId) {
      toast({
        title: "Error",
        description: "Please select links to train",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);

    const updatedLinks = links.map((link) => ({
      ...link,
      status: selectedLinks.includes(link.id) ? "Processing" : link.status,
    }));
    setLinks(updatedLinks);

    try {
      const selectedUrls = updatedLinks
        .filter((link) => selectedLinks.includes(link.id))
        .map((link) => link.link);

      useChatbotStore.setState({ scannedUrls: selectedUrls });

      const trainingToastId = toast({
        description: (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Training selected URLs...
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedLinks.length} URLs are being processed
            </div>
          </div>
        ),
        duration: 100000,
      });

      await trainChatbot(selectedChatbot.id, scrappingId);
      await getChatbots();

      toast({
        description: "Training completed successfully!",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/knowledge");
      }, 2000);
    } catch (error) {
      setLinks((prevLinks) =>
        prevLinks.map((link) => ({
          ...link,
          status: selectedLinks.includes(link.id) ? "Failed" : link.status,
        }))
      );

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to train bot",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedLinks = [...links].sort((a, b) => {
    const aValue = parseFloat(a.size.replace("KB", ""));
    const bValue = parseFloat(b.size.replace("KB", ""));
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const filteredLinks = sortedLinks.filter((link) =>
    link.link.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:max-w-[72%]">
      <div className="space-y-4 p-4 md:p-0">
        {!links.length ? (
          <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4 2xl:gap-2 ">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-nowrap">
                Add New Sources
              </h2>
              <Badge
                variant="secondary"
                className="rounded-md bg-[#E2E8F0] text-black hover:bg-[#E2E8F0] hover:text-black"
              >
                Website
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-[400px]">
                <Input
                  placeholder="Insert a URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCrawl}
                disabled={isLoading}
                className="gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    Crawl
                    <CornerDownLeft />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-nowrap">
                Add New Sources
              </h2>
              <Badge className="rounded-md bg-[#E2E8F0] text-black">
                Website
              </Badge>
              {activeUrl && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">
                    /
                  </span>
                  <Badge variant="outline" className="rounded-md">
                    {activeUrl}
                    <button
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveUrl("")}
                    >
                      ×
                    </button>
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showSearch ? (
                <Input
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleTrainBot}
                disabled={selectedLinks.length === 0 || isTraining}
                className="whitespace-nowrap"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Training...
                  </>
                ) : (
                  "Train bot"
                )}
              </Button>
            </div>
          </div>
        )}

        {links.length > 0 && (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedLinks.length === links.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLinks(links.map((link) => link.id));
                        } else {
                          setSelectedLinks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={toggleSort}
                      className="h-8 flex items-center gap-1"
                    >
                      Size
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="p-2">
                      <Checkbox
                        checked={selectedLinks.includes(link.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLinks([...selectedLinks, link.id]);
                          } else {
                            setSelectedLinks(
                              selectedLinks.filter((id) => id !== link.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <StatusBadge status={link.status} />
                    </TableCell>
                    <TableCell className="p-2 break-all">{link.link}</TableCell>
                    <TableCell className="p-2 text-center">
                      {link.size}
                    </TableCell>
                    <TableCell className="p-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {selectedLinks.length} of {links.length} links selected.
        </div>
      </div>
    </div>
  );
}
