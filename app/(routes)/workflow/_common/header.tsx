"use client";

import { useState } from "react";
import {
  LogoutLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";
import { LogOut, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();

  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-muted bg-background">
      <div className="w-full px-4 lg:px-0 mx-auto max-w-6xl h-11  flex items-center justify-between">
        <div>
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full h-8 w-8"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <SunIcon
              className={cn(
                "absolute h-5 w-5 transition",
                isDark ? "scale-100" : "scale-0"
              )}
            />
            <MoonIcon
              className={cn(
                "absolute h-5 w-5 transition",
                isDark ? "scale-0" : "scale-100"
              )}
            />
          </Button>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger>
              <Avatar
                className="h-8 w-8
                  shrink-0 rounded-full"
              >
                <AvatarImage
                  src={user?.picture || ""}
                  alt={user?.given_name || ""}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.given_name?.charAt(0)}
                  {user?.family_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <LogoutLink className="w-full flex items-center gap-1 text-destructive ">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </LogoutLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
