"use client";

import * as React from "react";
import {
  BookOpen,
  ChartColumnIncreasingIcon,
  Inbox,
  Settings,
  SwatchBook,
  Users,
  User,
  Lock,
  CreditCard,
  Key,
  Palette,
  Bell,
  Pin,
  PinOff,
  Search,
  X,
  CalendarIcon,
  FileText,
  Globe,
  Users2,
  Component,
  Link,
  FileType,
  ShoppingBag,
  Code2,
  LucideIcon,
  Youtube,
  SlackIcon,
  TwitterIcon,
  MessageCircle,
  MessageSquareMore,
  FileAudio,
  FolderOpen,
  NetworkIcon,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import logo from "../../public/logo.svg";
import wordpress from "../../public/wordpress1.svg";
import notion from "../../public/notion-src.svg";
import shopify from "../../public/shopify1.svg";
import product from "../../public/product.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Conversation,
  useConversationStore,
} from "@/store/useConversationStore";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { useSidebarStore } from "@/store/useSidebarStore";
import useLeadsStore, { Lead } from "@/store/useLeadsStore";
import useChatbotStore from "@/store/useChatbotStore";
import EmptyLeadsState from "./empty-leads-state";
import { AccessRole, getAuthorizedNavItems } from "@/navconfig";

interface AppSidebarProps {
  userRole: AccessRole;
  
}



interface IconRendererProps {
  icon: LucideIcon | string;
  className?: string;
}

const IconRenderer = ({ icon, className }: IconRendererProps) => {
  if (typeof icon === "string") {
    return (
      <Image
        src={icon}
        alt="icon"
        width={16}
        height={16}
        className={`${className} dark:invert`}
      />
    );
  }

  const IconComponent = icon;
  return <IconComponent className={className} />;
};

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon | string;
  type?: never;
}

interface SeparatorItem {
  type: "separator";
  label: string;
  title?: never;
  url?: never;
  icon?: never;
}

type SourceNavItem = NavItem | SeparatorItem;

const navMain = [
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: ChartColumnIncreasingIcon,
  },
  {
    title: "Appearance",
    url: "/appearance",
    icon: SwatchBook,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Knowledge",
    url: "/knowledge",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/general-settings/modal",
    icon: Settings,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: ShoppingBag,
  },
];

const settingsNav = [
  {
    title: "Profile",
    url: "/settings/profile",
    icon: User,
  },
  {
    title: "Password",
    url: "/settings/password",
    icon: Lock,
  },
  {
    title: "My plan",
    url: "/settings/plan",
    icon: CreditCard,
  },
  {
    title: "API Token",
    url: "/settings/api-tokens",
    icon: Key,
  },
  {
    title: "Appearance",
    url: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Notifications",
    url: "/settings/notifications",
    icon: Bell,
  },
];

const generalSettingsNav = [
  {
    title: "Modal",
    url: "/general-settings/modal",
    icon: Component,
  },
  {
    title: "Instructions",
    url: "/general-settings/instructions",
    icon: FileText,
  },
  {
    title: "Notifications",
    url: "/general-settings/notifications",
    icon: Bell,
  },
  {
    title: "Custom Domain",
    url: "/general-settings/custom-domain",
    icon: Globe,
  },
  {
    title: "Team member",
    url: "/general-settings/team-member",
    icon: Users2,
  },
];

const addSourcesNav: SourceNavItem[] = [
  {
    title: "Website",
    url: "/add-sources/website",
    icon: Globe,
  },
  {
    title: "Links",
    url: "/add-sources/links",
    icon: Link,
  },
  {
    title: "Sitemap",
    url: "/add-sources/sitemap",
    icon: NetworkIcon,
  },
  {
    title: "Files",
    url: "/add-sources/files",
    icon: FolderOpen,
  },
  {
    title: "Text",
    url: "/add-sources/text",
    icon: FileType,
  },
  {
    title: "Audio",
    url: "/add-sources/audio",
    icon: FileAudio,
  },
  {
    title: "Youtube",
    url: "/add-sources/youtube",
    icon: Youtube,
  },
  {
    type: "separator",
    label: "Externe Apps",
  },
  {
    title: "Notion",
    url: "/add-sources/notion",
    icon: notion.src,
  },
  {
    title: "Google Doc",
    url: "/add-sources/google-doc",
    icon: FileText,
  },
  {
    type: "separator",
    label: "E-Commerce",
  },
  {
    title: "Shopify",
    url: "/add-sources/shopify",
    icon: shopify.src,
  },
  {
    title: "Wordpress",
    url: "/add-sources/wordpress",
    icon: wordpress.src,
  },
  {
    title: "Add Products",
    url: "/add-sources/add-products",
    icon: product.src,
  },
  {
    title: "Custom Website",
    url: "/add-sources/custom-website",
    icon: Code2,
  },
];

export function AppSidebar({ ...props }) {
  const router = useRouter();
  const { userRole } = useChatbotStore();

  const pathname = usePathname();
  const [showMobileSecondarySidebar, setShowMobileSecondarySidebar] =
    React.useState(false);
  const [showMobileSearchInput, setShowMobileSearchInput] =
    React.useState(false);
  // Get chatbot access from store
  const selectedChatbot = useChatbotStore((state) =>
    state.chatbots.find(
      (bot) =>
        bot.chatbot_id === state.selectedChatbotId ||
        bot.chatbot.id === state.selectedChatbotId
    )
  );
  const access = (selectedChatbot?.access as AccessRole) || null;
  const authorizedNavItems = getAuthorizedNavItems(access);
  const [activeItem, setActiveItem] = React.useState<NavItem | null>(() => {
    const exactMatch = authorizedNavItems.find((item) => pathname === item.url);
    if (exactMatch) return exactMatch;
    return (
      authorizedNavItems.find(
        (item) =>
          pathname.startsWith(item.url) &&
          !authorizedNavItems.some(
            (other) =>
              other !== item &&
              pathname.startsWith(other.url) &&
              other.url.length > item.url.length
          )
      ) || null
    );
  });

  const [activeSourceItem, setActiveSourceItem] = React.useState<NavItem>(
    () => {
      const sourceItems = addSourcesNav.filter(
        (item): item is NavItem => !("type" in item)
      );
      const exactMatch = sourceItems.find((item) => pathname === item.url);
      if (exactMatch) return exactMatch;
      const partialMatch = sourceItems.find((item) =>
        pathname.startsWith(item.url)
      );
      return partialMatch || sourceItems[0];
    }
  );

  const [activeSettingItem, setActiveSettingItem] = React.useState(() => {
    const exactMatch = settingsNav.find((item) => pathname === item.url);
    if (exactMatch) return exactMatch;
    const partialMatch = settingsNav.find((item) =>
      pathname.startsWith(item.url)
    );
    return partialMatch || settingsNav[0];
  });

  const [activeGeneralSettingItem, setActiveGeneralSettingItem] =
    React.useState<(typeof generalSettingsNav)[0] | null>(() => {
      const exactMatch = generalSettingsNav.find(
        (item) => pathname === item.url
      );
      if (exactMatch) return exactMatch;
      const partialMatch = generalSettingsNav.find((item) =>
        pathname.startsWith(item.url)
      );
      return partialMatch || null;
    });

  const [date, setDate] = React.useState<Date>();
  const { open, setOpen } = useSidebar();
  const isSettingsPage = pathname.includes("/settings");
  const isInboxPage = pathname === "/" || pathname === "/inbox";
  const isGeneralSettingsPage = pathname.includes("/general-settings");
  const isSourcesPage = pathname.includes("/add-sources");
  const [selectedFilter, setSelectedFilter] = React.useState("All");
  const mainSidebarTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { selectedChatbotId } = useChatbotStore();
  const { leads, fetchLeads } = useLeadsStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const {
    isMainHovered,
    setIsMainHovered,
    isPinned,
    setIsPinned,
    showMobileInbox,
    setShowMobileInbox,
  } = useSidebarStore();

  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  // Mobile Secondary Sidebar Effects
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileSecondarySidebar(false);
        setShowMobileSearchInput(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setShowMobileSecondarySidebar(false);
    setShowMobileSearchInput(false);
  }, [pathname]);

  React.useEffect(() => {
    // Update main nav active state
    const newActiveItem =
      authorizedNavItems.find((item) => {
        if (pathname === item.url) return true;
        return (
          pathname.startsWith(item.url) &&
          !authorizedNavItems.some(
            (other) =>
              other !== item &&
              pathname.startsWith(other.url) &&
              other.url.length > item.url.length
          )
        );
      }) || null;
    setActiveItem(newActiveItem);

    // Update source nav active state
    if (isSourcesPage) {
      const sourceItems = addSourcesNav.filter(
        (item): item is NavItem => !("type" in item)
      );
      const newActiveSourceItem =
        sourceItems.find((item) => pathname.startsWith(item.url)) ||
        sourceItems[0];
      setActiveSourceItem(newActiveSourceItem);
    }

    // Update settings nav active state
    if (isSettingsPage) {
      const newActiveSettingItem =
        settingsNav.find((item) => pathname.startsWith(item.url)) ||
        settingsNav[0];
      setActiveSettingItem(newActiveSettingItem);
    }

    // Update general settings nav active state
    if (isGeneralSettingsPage) {
      const newActiveGeneralSettingItem =
        generalSettingsNav.find((item) => pathname.startsWith(item.url)) ||
        null;
      setActiveGeneralSettingItem(newActiveGeneralSettingItem);
    }
  }, [
    pathname,
    isSourcesPage,
    isSettingsPage,
    isGeneralSettingsPage,
    
  ]);

  React.useEffect(() => {
    const isInitialNavigation =
      (isSettingsPage ||
        isInboxPage ||
        isGeneralSettingsPage ||
        isSourcesPage) &&
      open;

    if (isInitialNavigation && !isPinned) {
      setOpen(false);
    }

    if (isPinned) {
      setOpen(true);
    }
  }, []);

  React.useEffect(() => {
    if (selectedChatbotId) {
      fetchLeads(selectedChatbotId);
    }
  }, [selectedChatbotId, fetchLeads]);

  const handleMainSidebarMouseEnter = React.useCallback(() => {
    if (isPinned) return;

    if (mainSidebarTimerRef.current) {
      clearTimeout(mainSidebarTimerRef.current);
    }
    setIsMainHovered(true);
    if (!open && !isDropdownOpen) {
      setOpen(true);
    }
  }, [open, setOpen, setIsMainHovered, isDropdownOpen, isPinned]);

  const handleMainSidebarMouseLeave = React.useCallback(() => {
    if (isPinned) return;

    if (mainSidebarTimerRef.current) {
      clearTimeout(mainSidebarTimerRef.current);
    }
    setIsMainHovered(false);
    if (!isDropdownOpen) {
      mainSidebarTimerRef.current = setTimeout(() => {
        if (!isDropdownOpen) {
          setOpen(false);
        }
      }, 300);
    }
  }, [isDropdownOpen, setOpen, setIsMainHovered, isPinned]);

  const handleCloseMobileSecondary = () => {
    setShowMobileSecondarySidebar(false);
    setShowMobileSearchInput(false);
  };

  const handleSearchIconClick = () => {
    setShowMobileSearchInput(!showMobileSearchInput);
  };

  const handleMainNavClick = (item: (typeof navMain)[0]) => {
    setActiveItem(item);
    router.push(item.url);
  };

  const handleSourceNavClick = (item: NavItem) => {
    setActiveSourceItem(item);
    router.push(item.url);
    if (window.innerWidth < 1024) {
      handleCloseMobileSecondary();
    }
  };

  const handleSettingsNavClick = (item: (typeof settingsNav)[0]) => {
    setActiveSettingItem(item);
    router.push(item.url);
    if (window.innerWidth < 1024) {
      handleCloseMobileSecondary();
    }
  };

  const handleGeneralSettingsNavClick = (
    item: (typeof generalSettingsNav)[0]
  ) => {
    setActiveGeneralSettingItem(item);
    router.push(item.url);
    if (window.innerWidth < 1024) {
      handleCloseMobileSecondary();
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
  };

  const togglePin = React.useCallback(() => {
    setIsPinned(!isPinned);
    if (isPinned) {
      setOpen(true);
    }
  }, [isPinned, setIsPinned, setOpen]);

  const handleCloseMobileInbox = () => {
    setOpen(false);
    setShowMobileInbox(false);
  };

  const getUnreadCount = (leads: Lead[], status: string): number => {
    return leads.filter(
      (lead) =>
        lead.is_open === (status.toLowerCase() === "open") &&
        lead.notification &&
        !lead.is_notification_sent
    ).length;
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLatestMessage = (msgs: any[]): string => {
    if (msgs.length === 0) return "No messages yet";
    const lastMsg = msgs[msgs.length - 1];
    return lastMsg.message || "No message content";
  };

 

  const renderSecondaryContent = () => {
    const renderSearchInput = () => (
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Type to search..."
          className="w-full bg-muted pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus={showMobileSearchInput}
        />
      </div>
    );

    if (isSettingsPage) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleSearchIconClick}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleCloseMobileSecondary}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {(showMobileSearchInput || window.innerWidth >= 1024) && (
            <div className="border-b p-4">{renderSearchInput()}</div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-2 p-6">
              {settingsNav
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    onClick={() => handleSettingsNavClick(item)}
                    className={`w-full justify-start gap-3 px-4 py-6 font-medium text-base ${
                      pathname.startsWith(item.url)
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {/* <item.icon className="h-4 w-4 mr-2" /> */}
                    <span>{item.title}</span>
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (isGeneralSettingsPage) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">General Settings</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleSearchIconClick}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleCloseMobileSecondary}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {(showMobileSearchInput || window.innerWidth >= 1024) && (
            <div className="border-b p-4">{renderSearchInput()}</div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-2 p-6">
              {generalSettingsNav
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    onClick={() => handleGeneralSettingsNavClick(item)}
                    className={`w-full justify-start gap-3 px-4 py-6 font-medium text-base ${
                      pathname.startsWith(item.url)
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {/* <item.icon className="h-4 w-4 mr-2" /> */}
                    <span>{item.title}</span>
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (isSourcesPage) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Add Sources</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleSearchIconClick}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleCloseMobileSecondary}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {(showMobileSearchInput || window.innerWidth >= 1024) && (
            <div className="border-b p-4">{renderSearchInput()}</div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-2 px-6 py-4">
              {addSourcesNav
                .filter((item) => {
                  if ("type" in item) return true;
                  return (
                    !searchQuery ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                })
                .map((item, index) => {
                  if ("type" in item && item.type === "separator") {
                    return (
                      <div key={index} className="mt-6 mb-2">
                        <p className="px-4 py-4 text-sm font-medium text-muted-foreground">
                          {item.label}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={item.title}
                      variant="ghost"
                      onClick={() => handleSourceNavClick(item)}
                      className={`w-full justify-start gap-3 px-4 py-4 font-medium text-base ${
                        pathname.startsWith(item.url)
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <IconRenderer icon={item.icon} className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Button>
                  );
                })}
            </div>
          </ScrollArea>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`flex ${
        isPinned
          ? "w-auto"
          : isInboxPage ||
            isSettingsPage ||
            isGeneralSettingsPage ||
            isSourcesPage
          ? "lg:w-[368px]"
          : "lg:w-[48px]"
      }`}
    >
      <div
        onMouseEnter={handleMainSidebarMouseEnter}
        onMouseLeave={handleMainSidebarMouseLeave}
      >
        <Sidebar
          collapsible="icon"
          className="fixed left-0 top-0 lg:z-50 h-screen border-r bg-background transition-all duration-300"
          {...props}
        >
          <SidebarHeader>
            <div className="flex items-center justify-between py-2">
              <SidebarMenu className="hover:bg-transparent">
                <SidebarMenuItem className="hover:bg-transparent">
                  <SidebarMenuButton
                    size="lg"
                    onClick={() => router.push("/")}
                    className="md:h-12 md:p-0 hover:bg-transparent hover:no-underline"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
                      <Image
                        src={logo}
                        alt="logo"
                        width={60}
                        height={60}
                        className="object-contain dark:invert"
                      />
                    </div>
                    <div className="grid flex-1 text-left text-lg leading-tight">
                      <span className="truncate font-semibold select-none">
                        Chatbuddy
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              {open && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={togglePin}
                    >
                      {isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPinned ? "Unpin sidebar" : "Pin sidebar"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent >
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent className="px-1.5 md:px-0 font-medium py-2">
                  <SidebarMenu>
                    {authorizedNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={{
                            children: item.title,
                            hidden: !open,
                          }}
                          onClick={() => handleMainNavClick(item)}
                          isActive={
                            activeItem?.url === item.url ||
                            pathname.startsWith(item.url)
                          }
                          className="px-2.5 md:px-2 py-6 text-base"
                        >
                          <item.icon className="h-8 w-8 mr-3" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </SidebarContent>

          <SidebarFooter>
            <NavUser
              onOpenChange={handleDropdownOpenChange}
              isPinned={isPinned}
            />
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Desktop Secondary Sidebar */}
      {(isSettingsPage || isGeneralSettingsPage || isSourcesPage) && (
        <div
          className={`${
            isPinned ? "sticky" : "fixed"
          } hidden lg:flex left-0 lg:left-[48px] top-[-4px] z-30 h-screen w-80 border-r bg-background`}
        >
          {renderSecondaryContent()}
        </div>
      )}

      {/* Mobile Secondary Sidebar */}
      {showMobileSecondarySidebar && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
            onClick={handleCloseMobileSecondary}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[320px] bg-background shadow-lg transition-transform duration-300 ease-in-out transform lg:hidden">
            {renderSecondaryContent()}
          </div>
        </>
      )}

      {/* Mobile Secondary Sidebar Toggle */}
      {(isSettingsPage || isGeneralSettingsPage || isSourcesPage) && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 bottom-4 z-50 rounded-full shadow-lg lg:hidden"
          onClick={() => setShowMobileSecondarySidebar(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Inbox Sidebar (Preserved from original) */}
      {isInboxPage && (
        <div
          className={`
            ${isPinned ? "sticky" : "fixed"}
      flex z-50 lg:z-40 h-screen border-r bg-background transition-all duration-300
      ${
        showMobileInbox
          ? "left-0 lg:left-[48px]"
          : "-left-[320px] lg:left-[48px]"
      }
      w-[320px]
    `}
        >
          <div className="flex h-full w-[320px] flex-col">
            <div className="border-b p-4 flex items-center justify-between lg:justify-start">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleCloseMobileInbox}
              >
                <X className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold px-2">Inbox</h2>
            </div>

            <div className="border-b p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type to search..."
                  className="w-full bg-muted pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 border-b p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter("All")}
                className={`rounded-full ${
                  selectedFilter === "All" ? "font-bold" : "font-normal"
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter("Open")}
                className={`rounded-full flex items-center gap-1 ${
                  selectedFilter === "Open" ? "font-bold" : "font-normal"
                }`}
              >
                Open
                {getUnreadCount(leads, "open") > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 rounded-full text-xs"
                  >
                    {getUnreadCount(leads, "open")}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter("Close")}
                className={`rounded-full ${
                  selectedFilter === "Close" ? "font-bold" : "font-normal"
                }`}
              >
                Close
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <ScrollArea className="flex-1">
              {leads.length === 0 ? (
                <EmptyLeadsState />
              ) : (
                <div className="space-y-0.5 p-2 w-[320px]">
                  {leads
                    .filter((lead) => {
                      const searchMatch =
                        searchQuery === "" ||
                        lead.name
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        lead.email
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        lead.phone?.includes(searchQuery) ||
                        lead.country_name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());

                      if (selectedFilter === "All") return searchMatch;
                      return (
                        lead.is_open ===
                          (selectedFilter.toLowerCase() === "open") &&
                        searchMatch
                      );
                    })
                    .map((lead) => (
                      <Button
                        key={lead.lead_id}
                        variant="ghost"
                        className={`w-full justify-start p-3 h-auto ${
                          selectedConversation?.id === lead.lead_id
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => {
                          const conversation: Conversation = {
                            id: lead.lead_id,
                            name: lead.name || "Anonymous",
                            avatar: (lead.name || "AN")
                              .substring(0, 2)
                              .toUpperCase(),
                            message: getLatestMessage(lead.msgs),
                            time: formatTime(lead.last_message_at),
                            status: lead.is_open ? "open" : "close",
                            isRead: !lead.notification,
                            platform: lead.lead_source || "website",
                            email: lead.email,
                            phone: lead.phone,
                            country: lead.country_name,
                            msgs: lead.msgs,
                            takeOverAsHuman: lead.takeOverAsHuman,
                          };
                          setSelectedConversation(conversation);
                          if (window.innerWidth < 1024) {
                            handleCloseMobileInbox();
                          }
                        }}
                      >
                        <div className="flex w-full gap-3">
                          <div className="relative">
                            <Avatar>
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                {(lead.name || "AN")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                            </Avatar>
                          </div>
                          <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-2">
                                {lead.name || "Anonymous"}{" "}
                                {lead.notification && (
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                {lead.lead_source === "slack" && (
                                  <SlackIcon className="h-4 w-4 text-violet-500" />
                                )}
                                {lead.lead_source === "twitter" && (
                                  <TwitterIcon className="h-4 w-4 text-blue-400" />
                                )}
                                {lead.lead_source === "whatsapp" && (
                                  <MessageCircle className="h-4 w-4 text-green-500" />
                                )}
                                {lead.lead_source === "discord" && (
                                  <MessageSquareMore className="h-4 w-4 text-indigo-500" />
                                )}
                                {lead.lead_source === "website" && (
                                  <Globe className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(lead.last_message_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-start text-muted-foreground truncate">
                              {getLatestMessage(lead.msgs)}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Mobile Overlay for Inbox */}
      {showMobileInbox && isInboxPage && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={handleCloseMobileInbox}
        />
      )}
    </div>
  );
}
