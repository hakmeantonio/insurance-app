"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Globe,
} from "lucide-react";
import { type Screen, INTL_SCREENS } from "@/lib/types";

export function SidebarNav({ screens, isAdmin }: { screens: Screen[]; isAdmin: boolean }) {
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

      {isAdmin && (
        <Link href="/dashboard/users" className={navLinkClass("/dashboard/users")}>
          <Users className="w-4 h-4 shrink-0" />
          User Management
        </Link>
      )}

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

      <div className="pt-3">
        <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          International Policies
        </p>
        {Object.entries(INTL_SCREENS).map(([slug, name]) => {
          const href = `/dashboard/international/${slug}`;
          return (
            <Link key={slug} href={href} className={navLinkClass(href)}>
              <Globe className="w-4 h-4 shrink-0" />
              <span className="truncate">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
