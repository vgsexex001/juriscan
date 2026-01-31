"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/Mobile/MobileHeader";
import BottomNav from "@/components/Mobile/BottomNav";
import MobileDrawer from "@/components/Mobile/MobileDrawer";

interface AppShellProps {
  children: React.ReactNode;
  /** Hide bottom nav (e.g. for chat page with its own input area) */
  hideBottomNav?: boolean;
}

export default function AppShell({ children, hideBottomNav = false }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setDrawerOpen(true)} />

      {/* Mobile Drawer with Sidebar inside */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar onItemClick={() => setDrawerOpen(false)} embedded />
      </MobileDrawer>

      {/* Main content area */}
      <div
        className={`lg:ml-60 min-h-screen pt-14 lg:pt-0 ${
          hideBottomNav ? "" : "pb-20 lg:pb-0"
        }`}
      >
        {children}
      </div>

      {/* Bottom Nav */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
