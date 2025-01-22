import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "@/store/useAuthStore";
import {
  Globe,
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import logo from "../../../public/logo.svg";
import Image from "next/image";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  showLanguage?: boolean;
  showLoginButton?: boolean;
  showUserMenu?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function AppLayout({
  children,
  showLanguage = true,
  showLoginButton = true,
  showUserMenu = false,
  fullWidth = false,
  className,
}: AuthLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/auth/login";
  const { session, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const user = session?.user;
  const isMobile = false;
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen w-screen bg-transparent">
      <header className="flex justify-between items-center p-4 bg-transparent">
        <Link href="/" className="flex items-center z-20">
          <Image
            src={logo}
            alt="logo"
            width={40}
            height={40}
            className={"dark:invert"}
          />
        </Link>

        <div className="flex items-center gap-4">
          {showLanguage && (
            <Select defaultValue="en">
              <SelectTrigger className="w-[140px] h-9">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 p-4"
            suppressHydrationWarning
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button> */}

          {showUserMenu && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-center gap-2 px-2 hover:bg-none"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.user_metadata?.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {(user.user_metadata?.name || "User").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
               
                 
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg">
                        {(user.user_metadata?.name || "User").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.user_metadata?.name || "User"}
                      </span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showLoginButton &&
            !showUserMenu &&
            (isLoginPage ? (
              <Link href="/signup">
                <Button variant="outline">Create account</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            ))}
        </div>
      </header>

      <main
        className={cn(
          fullWidth ? "w-full " : "container max-w-md mx-auto px-4",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
