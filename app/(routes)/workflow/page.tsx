import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "./_common/app-sidebar";
import Header from "./_common/header";
import MainContent from "./_common/main-content";

const Workflows = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex-1">
        <Header />
        <div className="w-full px-4 lg:px-0 mx-auto max-w-6xl ">
          <MainContent />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Workflows;
