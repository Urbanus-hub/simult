import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex sticky top-0 bg-background/80 backdrop-blur-md h-16 shrink-0 items-center gap-2 px-4 z-10">
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border/50 mx-2" />
      <h1 className="text-base font-medium">Dashboard</h1>
    </header>
  );
}
