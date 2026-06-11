import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/login/actions";
import { LogOut } from "lucide-react";
import { SidebarNav } from "./_components/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: screens } = await supabase
    .from("screens")
    .select("id, name, description")
    .order("name");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-lg font-bold text-gray-900">InsureApp</span>
          </div>
        </div>

        <SidebarNav screens={screens ?? []} />

        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3 py-1 text-xs text-gray-500 truncate mb-1">
            {user.email}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
