"use client";

import * as React from "react";
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
  MoreHorizontal,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Plus,
  X,
  Pencil,
  Trash,
  ListFilter,
  CirclePlus,
  Loader2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import useSourcesStore, { Source } from "@/store/useSourcesStore";
import useChatbotStore from "@/store/useChatbotStore";
import { EditSourceDialog } from "./components/edit-source";
import LoadingScreen from "@/components/loading-screen";
import SourcesEmptyState from "./components/empty-sources-state";

type SourceType =
  | "website"
  | "file"
  | "audio"
  | "notion"
  | "links"
  | "google_doc"
  | "text"
  | "youtube"
  | "sitemap";

type SortableFields = "size" | "auto" | "lastTrained";

const SOURCE_TYPES: SourceType[] = [
  "website",
  "file",
  "audio",
  "notion",
  "links",
  "google_doc",
  "text",
  "youtube",
  "sitemap",
];

export default function KnowledgePage() {
  const { toast } = useToast();
  const router = useRouter();

  // Store states
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const { sources, isLoading, getSources, updateSource, deleteSource } =
    useSourcesStore();

  // Local states
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [editingSource, setEditingSource] = React.useState<Source | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedTypes, setSelectedTypes] = React.useState<SourceType[]>([]);
  const [typeFilterOpen, setTypeFilterOpen] = React.useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [sourceToDelete, setSourceToDelete] = React.useState<string | null>(
    null
  );
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortableFields | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Load sources when chatbot is selected
  React.useEffect(() => {
    if (selectedChatbotId) {
      getSources(selectedChatbotId);
    }
  }, [selectedChatbotId, getSources]);

  const handleSort = (key: SortableFields) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (data: Partial<Source>) => {
    if (!selectedChatbotId || !editingSource) return;

    try {
      await updateSource(selectedChatbotId, editingSource.id, data);
      await getSources(selectedChatbotId);
      toast({
        description: "Source updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update source",
      });
    }
  };

  const handleDelete = (sourceId: string) => {
    setSourceToDelete(sourceId);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChatbotId || !sourceToDelete) return;

    try {
      await deleteSource(selectedChatbotId, sourceToDelete);
      setSelectedRows((prev) => prev.filter((id) => id !== sourceToDelete));
      toast({
        description: "Source deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to delete source",
      });
    } finally {
      setDeleteAlertOpen(false);
      setSourceToDelete(null);
    }
  };

  // Filtered sources
  const filteredSources = React.useMemo(() => {
    return sources.filter((source) => {
      const matchesSearch = source.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(source.source_type as SourceType);
      return matchesSearch && matchesType;
    });
  }, [sources, searchQuery, selectedTypes]);

  // Sorted sources
  const sortedSources = React.useMemo(() => {
    const sorted = [...filteredSources];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "size") {
          const aNum = parseFloat(a.size || "0");
          const bNum = parseFloat(b.size || "0");
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }
        if (sortConfig.key === "auto") {
          const autoOrder: any = { daily: 1, weekly: 2, monthly: 3, none: 4 };
          const aOrder = autoOrder[a.auto_sync_interval || "none"];
          const bOrder = autoOrder[b.auto_sync_interval || "none"];
          return sortConfig.direction === "asc"
            ? aOrder - bOrder
            : bOrder - aOrder;
        }
        if (sortConfig.key === "lastTrained") {
          const aDate = new Date(a.last_modified).getTime();
          const bDate = new Date(b.last_modified).getTime();
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredSources, sortConfig]);

  // Paginated sources
  const paginatedSources = React.useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return sortedSources.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, rowsPerPage, sortedSources]);

  const totalPages = Math.ceil(sortedSources.length / rowsPerPage);

  const getSourceBadgeStyle = (type: string) => {
    const styles: Record<string, string> = {
      website: "bg-[#E2E8F0] text-black hover:bg-[#E2E8F0] hover:text-black",
      file: "bg-[#E0D2EE] text-black hover:bg-[#E0D2EE] hover:text-black",
      audio: "bg-[#D0E5E4] text-black hover:bg-[#D0E5E4] hover:text-black",
      notion: "bg-black text-white",
      links: "bg-[#E2E8F0] text-black hover:bg-[#E2E8F0] hover:text-black",
      google_doc: "bg-[#FFF3DD] text-black hover:bg-[#FFF3DD] hover:text-black",
      text: "bg-[#F5F5F5] text-black hover:bg-[#F5F5F5] hover:text-black",
      youtube: "bg-[#FDD8D3] text-black hover:bg-[#FDD8D3] hover:text-black",
      sitemap: "bg-[#E2E8F0] text-black hover:bg-[#E2E8F0] hover:text-black",
    };
    return styles[type] || styles.website;
  };
  const getDisplayStatus = (status: "done" | "pending" | "failed"): string => {
    switch (status) {
      case "done":
        return "Trained";
      case "pending":
        return "Training";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-[calc(100vh-200px)]">
         <LoadingScreen />
       </div>
     );
   }


   if (sources.length === 0) {
     return <SourcesEmptyState />;
   }
 
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {selectedTypes.length > 0 ? (
            <div className="flex items-center gap-2">
              <span>{sortedSources.length} Current Sources</span>
              <div className="flex items-center gap-1">
                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={`gap-2 ${getSourceBadgeStyle(type)}`}
                  >
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setSelectedTypes((prev) =>
                          prev.filter((t) => t !== type)
                        );
                      }}
                    />
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTypes([])}
              >
                Reset
              </Button>
            </div>
          ) : (
            `${sortedSources.length} Current Sources`
          )}
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2 lg:flex-1">
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Popover open={typeFilterOpen} onOpenChange={setTypeFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ListFilter className="h-4 w-4" />
                Type
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" align="start">
              <div className="space-y-1">
                {SOURCE_TYPES.map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground rounded-sm"
                  >
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        setSelectedTypes((prev) =>
                          checked
                            ? [...prev, type]
                            : prev.filter((t) => t !== type)
                        );
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <div className="flex flex-1 items-center justify-between py-2 px-1">
                      <Badge
                        variant="secondary"
                        className={`${getSourceBadgeStyle(type)} border-none`}
                      >
                        {type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sources.filter((s) => s.source_type === type).length}
                      </span>
                    </div>
                  </div>
                ))}
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => {
                    setSelectedTypes([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {selectedRows.length > 0 && (
            <div className="flex items-start gap-2">
              <Button variant="outline" size="sm">
                Auto Sync
              </Button>
              <Button variant="outline" size="sm">
                Retrain
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => router.push("/add-sources/website")}
        >
          <CirclePlus className="h-4 w-4" />
          Add Sources
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedRows.length === paginatedSources.length &&
                    paginatedSources.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(paginatedSources.map((s) => s.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-transparent p-0 font-medium"
                  onClick={() => handleSort("size")}
                >
                  Size
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      sortConfig.key === "size" &&
                        sortConfig.direction === "desc" &&
                        "transform rotate-180"
                    )}
                  />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-transparent p-0 font-medium"
                  onClick={() => handleSort("auto")}
                >
                  Auto
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      sortConfig.key === "auto" &&
                        sortConfig.direction === "desc" &&
                        "transform rotate-180"
                    )}
                  />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-transparent p-0 font-medium"
                  onClick={() => handleSort("lastTrained")}
                >
                  Last Trained
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      sortConfig.key === "lastTrained" &&
                        sortConfig.direction === "desc" &&
                        "transform rotate-180"
                    )}
                  />
                </Button>
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(source.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRows([...selectedRows, source.id]);
                      } else {
                        setSelectedRows(
                          selectedRows.filter((id) => id !== source.id)
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getSourceBadgeStyle(source.source_type)}
                    >
                      {source.source_type}
                    </Badge>
                    {source.name}
                  </div>
                </TableCell>
                <TableCell>{source.size || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        source.status === "done"
                          ? "bg-green-500"
                          : source.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {getDisplayStatus(source.status)}
                  </div>
                </TableCell>
                <TableCell>{source.auto_sync_interval || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {source.last_modified}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => handleEdit(source)}>
                      
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(source.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {selectedRows.length} of {sortedSources.length} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
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
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <EditSourceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        source={editingSource}
        onSave={handleSaveEdit}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              source and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
