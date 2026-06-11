import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Shield } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: usersData }, { data: screensData }] = await Promise.all([
    admin.auth.admin.listUsers(),
    supabase.from("screens").select("id"),
  ]);

  const stats = [
    {
      label: "Total Users",
      value: usersData?.users.length ?? 0,
      icon: Users,
      href: "/dashboard/users",
    },
    {
      label: "Insurance Screens",
      value: screensData?.length ?? 0,
      icon: Shield,
      href: "/dashboard",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Overview</h1>
      <p className="text-gray-500 mb-8">Welcome to the InsureApp admin panel.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
