"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar as CalendarIcon,
  Download,
  Settings,
  MoreHorizontal,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Link2,
  Users,
  Check,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "./components/settings-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingScreen from "@/components/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useChatbotStore from "@/store/useChatbotStore";
import useLeadsStore, { Lead } from "@/store/useLeadsStore";
import EmptyState from "./components/empty-leads-state";

export default function LeadsPage() {
  const { selectedChatbotId } = useChatbotStore();
  const {
    filteredLeads: leads,
    isLoading,
    error,
    selectedLeads,
    currentPage,
    rowsPerPage,
    dateRange,
    searchQuery,
    sortConfig,
    fetchLeads,
    setSelectedLeads,
    setCurrentPage,
    setRowsPerPage,
    setSearchQuery,
    setDateRange,
    setSortConfig,
  } = useLeadsStore();

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const setCurrentPageSafe = (value: number | ((prev: number) => number)) => {
    if (typeof value === "function") {
      setCurrentPage(value(currentPage));
    } else {
      setCurrentPage(value);
    }
  };

  React.useEffect(() => {
    if (selectedChatbotId) {
      fetchLeads(selectedChatbotId);
    }
  }, [selectedChatbotId, fetchLeads]);

  const currentLeads = React.useMemo(() => {
    return leads.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [leads, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(leads.length / rowsPerPage);

  const handleSort = (key: keyof Lead) => {
    setSortConfig(
      key,
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    );
  };

  const handleDownload = () => {
    const csv = [
      ["Lead ID", "Name", "Email", "Phone", "Country", "Submitted At"],
      ...leads.map((lead) => [
        lead.lead_id,
        lead.name || "Not provided",
        lead.email || "Not provided",
        lead.phone || "Not provided",
        lead.country_name,
        format(new Date(lead.submitted_at), "PPpp"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!selectedChatbotId) {
    return (
      <div className="flex lg:mt-60 items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>

          <h3 className="text-xl font-semibold mb-3">No Chatbot Selected</h3>

          <Alert className="mb-6">
            <AlertDescription className="text-center">
              To view and manage your leads, please select a chatbot from the
              dropdown menu above.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>View all captured leads</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Download lead data</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Manage lead settings</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (leads.length === 0) {
    return <EmptyState chatbotId={selectedChatbotId} />;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold mb-6">{leads.length} leads</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 px-2",
                  dateRange && "bg-accent text-accent-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={{
                  from: dateRange.from || undefined,
                  to: dateRange.to || undefined,
                }}
                onSelect={(range) =>
                  setDateRange(range?.from || null, range?.to || null)
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedLeads.length === currentLeads.length &&
                    currentLeads.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedLeads(
                        currentLeads.map((lead) => lead.lead_id)
                      );
                    } else {
                      setSelectedLeads([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleSort("submitted_at")}
                >
                  Submitted at
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLeads.map((lead) => (
              <TableRow key={lead.lead_id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.lead_id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLeads([...selectedLeads, lead.lead_id]);
                      } else {
                        setSelectedLeads(
                          selectedLeads.filter((id) => id !== lead.lead_id)
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10">
                        {lead.name
                          ? lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    {lead.name || "Anonymous"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                      {lead.email || "Not provided"}
                    </span>
                    {lead.email && <Link2 className="h-3 w-3" />}
                  </div>
                </TableCell>
                <TableCell>{lead.phone || "Not provided"}</TableCell>
                <TableCell>
                  {format(new Date(lead.submitted_at), "PPpp")}
                </TableCell>
                <TableCell className="p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {selectedLeads.length} of {leads.length} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPageSafe(1);
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPageSafe((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPageSafe((prev) => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPageSafe(totalPages)}
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
