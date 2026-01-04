"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2, WorkflowIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Logo from "@/components/logo";

const navItems = [
  {
    title: "Workflows",
    url: "/workflow",
    icon: WorkflowIcon,
  },
  {
    title: "Settings",
    url: "/workflow/settings",
    icon: Settings2,
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-primary/10 ">
      <SidebarHeader className="flex flex-row items-center justify-between px-4">
        <Logo />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/10 transition-colors"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* <CreditUsageCard /> */}
        <div className="mt-4 text-[10px] text-center text-muted-foreground font-medium uppercase">
          © 2025 Flow.ai
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

// const CreditUsageCard = () => {
//   return (
//     <>
//       <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-3">
//         <div className="flex items-center gap-2 text-primary">
//           <Lightning size={18} weight="fill" />
//           <span className="text-xs font-bold uppercase tracking-wider">
//             Credits
//           </span>
//         </div>
//         <div className="space-y-1">
//           <div className="flex justify-between text-xs font-medium">
//             <span>Usage</span>
//             <span>75%</span>
//           </div>
//           <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
//             <div className="h-full bg-primary w-[75%]" />
//           </div>
//         </div>
//         <button className="w-full py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
//           Upgrade Plan
//         </button>
//       </div>
//     </>
//   );
// };

export default AppSidebar;
