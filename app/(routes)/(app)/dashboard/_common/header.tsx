"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoonIcon, SunIcon } from "lucide-react";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({
  userName = "User",
  userEmail = "user@example.com",
}) => {
  const { theme, setTheme } = useTheme();
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
                <AvatarImage src={""} alt={""} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {userName?.charAt(0)}
                  {userName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="font-medium text-sm text-foreground">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
