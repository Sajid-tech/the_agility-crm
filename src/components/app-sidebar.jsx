import {
  AudioWaveform,
  Blocks,
  Command,
  Frame,
  GalleryVerticalEnd,
  Package,
  Settings2,
  ShoppingBag,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { NavMainReport } from "./nav-main-report";
import { useState } from "react";

export function AppSidebar({ ...props }) {
  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");
  const [openItem, setOpenItem] = useState(null);
  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `THE AGILITY DEV`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Category",
        url: "/category",
        icon: Frame,
        isActive: false,
      },
     
      {
        title: "Enquiry",
        url: "/enquiry",
        icon: Frame,
        isActive: false,
      },
     
      {
        title: "Blog",
        url: "/blog",
        icon: Frame,
        isActive: false,
      },
      {
        title: "Sponsor",
        url: "/sponsor",
        icon: Frame,
        isActive: false,
      },
     
      
   

     
     
    ],
    navMainReport: [

      {
        title: "Settings",
        url: "/settings",
        icon: Blocks,
        isActive: false,
      },
     
     
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />

        {/* <NavMainUser projects={initialData.schoolManagement} /> */}
        <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
        {/* <NavMainUser projects={initialData.schoolManagement} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

//changes