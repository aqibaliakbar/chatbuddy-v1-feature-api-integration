import {
  Inbox,
  ChartColumnIncreasingIcon,
  SwatchBook,
  Users,
  BookOpen,
  Settings,
  ShoppingBag,
} from "lucide-react";

export type AccessRole = "owner" | "admin" | "support" | "user";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  allowedAccess: AccessRole[];
}

export const navItems: NavItem[] = [
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
    allowedAccess: ["owner", "admin", "support"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: ChartColumnIncreasingIcon,
    allowedAccess: ["owner", "admin", "support"],
  },
  {
    title: "Appearance",
    url: "/appearance",
    icon: SwatchBook,
    allowedAccess: ["owner", "admin", "support", "user"],
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
    allowedAccess: ["owner", "admin", "support", "user"],
  },
  {
    title: "Knowledge",
    url: "/knowledge",
    icon: BookOpen,
    allowedAccess: ["owner", "admin", "support", "user"],
  },
  {
    title: "Settings",
    url: "/general-settings/modal",
    icon: Settings,
    allowedAccess: ["owner", "admin"],
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: ShoppingBag,
    allowedAccess: ["owner", "admin"],
  },
];

export function getAuthorizedNavItems(access: AccessRole | null): NavItem[] {
  if (!access) return [];
  return navItems.filter((item) => item.allowedAccess.includes(access));
}