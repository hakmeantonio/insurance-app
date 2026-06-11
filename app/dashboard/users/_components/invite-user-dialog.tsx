"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser } from "../actions";
import type { UserRole } from "@/lib/types";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("role", role);
    const result = await inviteUser(fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setEmail("");
      setRole("employee");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4 mr-2" />
        Invite User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending invite..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
