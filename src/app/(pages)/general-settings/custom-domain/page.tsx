"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface DnsRecord {
  host: string;
  value: string;
  status: string;
}

interface DnsRecords {
  cname: DnsRecord;
  txt: DnsRecord;
}

export default function CustomDomainPage() {
  const { toast } = useToast();
  const [domain, setDomain] = React.useState<string>("");
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [copiedField, setCopiedField] = React.useState<string>("");
  const [dnsRecords, setDnsRecords] = React.useState<DnsRecords | null>(null);

  const generateMockDnsRecords = (domain: string): DnsRecords => {
    const baseDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

    return {
      cname: {
        host: `chat.${baseDomain}`,
        value: "app.chatbuddy.io",
        status: "Not verified",
      },
      txt: {
        host: "@",
        value: `_chatbuddy=${generateRandomString(36)}`,
        status: "Connected",
      },
    };
  };

  const generateRandomString = (length: number): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  };

  const mockApiCall = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const records = generateMockDnsRecords(domain);
    setDnsRecords(records);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!domain) {
      toast({
        variant: "destructive",
        description: "Please enter a domain.",
      });
      return;
    }
    await mockApiCall();
  };

  const handleCopy = (text: string | undefined, fieldName: string): void => {
    if (!text) return;

    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
    toast({
      description: "Copied to clipboard",
    });
  };

  if (!isSubmitted) {
    return (
      <div className="w-full max-w-4xl px-4 sm:px-6 py-6">
        <h1 className="text-xl font-semibold mb-6 break-words">
          Custom domains for script, iframe, and chatbot
        </h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Domain</label>
            <Input
              type="text"
              value={domain}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDomain(e.target.value)
              }
              placeholder="example.com"
              className="w-full sm:max-w-xl"
            />
            <p className="text-sm w-full sm:max-w-xl text-muted-foreground">
              For the domain &quot;example.com,&quot; consider using &quot;chat.example.com&quot; as
              a custom subdomain. You can replace &quot;chat&quot; with any valid
              subdomain of your choice. Please add a CNAME Record to your
              Service Provider with the Value of app.chatbuddy.io
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Connecting..." : "Connect domain"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 py-6">
      <h1 className="text-xl font-semibold mb-6 break-words">
        Custom domains for script, iframe, and chatbot
      </h1>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-background rounded-lg px-3 py-2 border gap-2 sm:gap-0">
          <Badge
            variant="secondary"
            className="gap-2 px-2 py-1 h-7 text-sm font-normal bg-muted/50 hover:bg-muted/50 w-fit"
          >
            {domain}
            <span
              onClick={() => setIsSubmitted(false)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-sm font-normal w-fit"
          >
            Check status
          </Button>
        </div>

        <div className="overflow-auto -mx-4 sm:mx-0 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[90px] font-medium">Type</TableHead>
                <TableHead className="w-[180px] font-medium">Host</TableHead>
                <TableHead className="font-medium">Value</TableHead>
                <TableHead className="w-[130px] text-right pr-4 font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="align-middle">CNAME</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate">{dnsRecords?.cname.host}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() =>
                            handleCopy(dnsRecords?.cname.host, "cname-host")
                          }
                        >
                          {copiedField === "cname-host" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedField === "cname-host"
                          ? "Copied!"
                          : "Copy to clipboard"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate">{dnsRecords?.cname.value}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() =>
                            handleCopy(dnsRecords?.cname.value, "cname-value")
                          }
                        >
                          {copiedField === "cname-value" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedField === "cname-value"
                          ? "Copied!"
                          : "Copy to clipboard"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="text-sm whitespace-nowrap">
                      {dnsRecords?.cname.status}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="align-middle">TXT</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate">{dnsRecords?.txt.host}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() =>
                            handleCopy(dnsRecords?.txt.host, "txt-host")
                          }
                        >
                          {copiedField === "txt-host" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedField === "txt-host"
                          ? "Copied!"
                          : "Copy to clipboard"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate">{dnsRecords?.txt.value}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() =>
                            handleCopy(dnsRecords?.txt.value, "txt-value")
                          }
                        >
                          {copiedField === "txt-value" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedField === "txt-value"
                          ? "Copied!"
                          : "Copy to clipboard"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm whitespace-nowrap">
                      {dnsRecords?.txt.status}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Please add these records to your domain&apos;s DNS settings and wait
          for propagation (up to 24 hours).
        </p>
      </div>
    </div>
  );
}
