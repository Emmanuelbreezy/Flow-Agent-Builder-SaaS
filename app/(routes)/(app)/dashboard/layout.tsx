import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_common/app-sidebar";
import Header from "./_common/header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full flex-1">
          <Header />
          <div className="w-full px-4 lg:px-0 mx-auto max-w-6xl ">
            {" "}
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
