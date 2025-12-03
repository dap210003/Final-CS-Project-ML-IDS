import { NavLink } from "react-router-dom";
import { Play, GitCompare, Eye, Database, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Navigation menu items
const navigationItems = [
  {
    title: "Run Experiment",
    url: "/",
    icon: Play,
    description: "Configure and execute ML experiments"
  },
  {
    title: "Compare Experiments",
    url: "/compare",
    icon: GitCompare,
    description: "Side-by-side comparison"
  },
  {
    title: "View Experiments",
    url: "/experiments",
    icon: Eye,
    description: "Browse experiment history"
  },
  {
    title: "Datasets",
    url: "/datasets",
    icon: Database,
    description: "Manage training datasets"
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Header - Logo and Title */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-bold text-sidebar-foreground">IDS-ML</h1>
            <p className="text-xs text-sidebar-foreground/70">Research Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Additional Info Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Information</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              <div className="space-y-1">
                <p className="font-medium">LCCDE Ensemble</p>
                <p>Leader Class & Confidence Decision Ensemble for Intrusion Detection</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Version Info */}
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2024 IDS-ML Research</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}