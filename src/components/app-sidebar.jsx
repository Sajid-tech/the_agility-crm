import {
  LayoutGrid,
  Mail,
  MessageSquare,
  FileText,
  HeartHandshake,
  Inbox,
  Image,
  Settings,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
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
  const company = Cookies.get("company");
  const [openItem, setOpenItem] = useState(null);
  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `${company}`,
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
        icon: LayoutGrid,
        isActive: false,
      },
      {
        title: "Enquiry",
        url: "/enquiry",
        icon: MessageSquare, 
        isActive: false,
      },
      {
        title: "Blog",
        url: "/blog",
        icon: FileText, 
        isActive: false,
      },
      {
        title: "Sponsor",
        url: "/sponsor",
        icon: HeartHandshake, 
        isActive: false,
      },
      {
        title: "Subscribe Email",
        url: "/subscribe-email",
        icon: Mail,
        isActive: false,
      },
      {
        title: "Gallery",
        url: "/gallery",
        icon: Image, 
        isActive: false,
      },
    ],
    navMainReport: [

      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
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