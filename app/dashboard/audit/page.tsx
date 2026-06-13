import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ACTION_STYLES: Record<string, string> = {
  create: "bg-green-100 text-green-800 border-green-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

function describeDetails(details: Record<string, unknown> | null, entityType: string) {
  if (!details) return "—";
  if (entityType === "policy") {
    const parts = [];
    if (details.policy_number) parts.push(String(details.policy_number));
    if (details.client_name) parts.push(String(details.client_name));
    return parts.join(" · ") || "—";
  }
  if (entityType === "international_policy") {
    const parts = [];
    if (details.first_name || details.last_name)
      parts.push([details.first_name, details.last_name].filter(Boolean).join(" "));
    if (details.policy_index != null) parts.push(`Index ${details.policy_index}`);
    return parts.join(" · ") || "—";
  }
  return JSON.stringify(details);
}

function formatScreen(screen: string | null, entityType: string) {
  if (!screen) return "—";
  if (entityType === "international_policy") return screen.toUpperCase().replace(/-/g, " ");
  return screen.replace("insurance/", "Screen #");
}

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const logList = logs ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          All policy create, update, and delete actions — last {logList.length} entries
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Screen</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  No audit entries yet.
                </TableCell>
              </TableRow>
            ) : (
              logList.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {fmt(log.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {log.user_email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${ACTION_STYLES[log.action] ?? ""}`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 capitalize">
                    {log.entity_type === "international_policy"
                      ? "Intl Policy"
                      : "Policy"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatScreen(log.screen, log.entity_type)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {describeDetails(log.details, log.entity_type)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
