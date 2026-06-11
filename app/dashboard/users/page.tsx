import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { EditRoleDialog } from "./_components/edit-role-dialog";
import { PermissionsDialog } from "./_components/permissions-dialog";
import { DeleteUserButton } from "./_components/delete-user-button";
import type { AppUser } from "@/lib/types";

export default async function UsersPage() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    supabase.from("profiles").select("id, role"),
  ]);

  const profileMap = new Map(profiles?.map((p) => [p.id, p.role]) ?? []);

  const users: AppUser[] = (authData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: profileMap.get(u.id) ?? null,
    created_at: u.created_at,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} {users.length === 1 ? "user" : "users"}
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-gray-400"
                >
                  No users yet. Invite your first user above.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge
                        variant={
                          user.role === "employee" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EditRoleDialog user={user} />
                      <PermissionsDialog user={user} />
                      <DeleteUserButton userId={user.id} email={user.email} />
                    </div>
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
