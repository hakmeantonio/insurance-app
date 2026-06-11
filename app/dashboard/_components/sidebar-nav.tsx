"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react";
import type { Screen } from "@/lib/types";

export function SidebarNav({ screens }: { screens: Screen[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const navLinkClass = (href: string) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    );

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <Link href="/dashboard" className={navLinkClass("/dashboard")}>
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        Overview
      </Link>

      <Link href="/dashboard/users" className={navLinkClass("/dashboard/users")}>
        <Users className="w-4 h-4 shrink-0" />
        User Management
      </Link>

      {screens.length > 0 && (
        <div className="pt-3">
          <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Insurance
          </p>
          {screens.map((screen) => {
            const href = `/dashboard/insurance/${screen.id}`;
            return (
              <Link key={screen.id} href={href} className={navLinkClass(href)}>
                <Shield className="w-4 h-4 shrink-0" />
                <span className="truncate">{screen.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
