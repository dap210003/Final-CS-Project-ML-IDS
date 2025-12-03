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
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Run Experiment", 
    url: "/", 
    icon: Play,
    description: "Configure and run new experiments"
  },
  { 
    title: "Compare Experiments", 
    url: "/compare", 
    icon: GitCompare,
    description: "Compare two experiments side by side"
  },
  { 
    title: "View Experiments", 
    url: "/experiments", 
    icon: Eye,
    description: "Browse and view experiment results"
  },
  { 
    title: "Datasets", 
    url: "/datasets", 
    icon: Database,
    description: "Manage IDS datasets"
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        {/* Logo and Title */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">IDS-ML</h1>
              <p className="text-xs text-muted-foreground">Research Platform</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
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

        {/* Footer Info */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">LCCDE Framework</p>
            <p>Leader Class and Confidence Decision Ensemble</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}