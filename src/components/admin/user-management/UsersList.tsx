// src/components/admin/user-management/UsersList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Calendar, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleIcon, getRoleBadgeColor, getRoleDisplayName } from "@/lib/user-management-utils";
import type { UserData } from "@/hooks/useUserManagement";

interface UsersListProps {
  users: UserData[];
  onUserAction: (userId: string, action: "activate" | "deactivate" | "delete") => void;
}

export function UsersList({ users, onUserAction }: UsersListProps) {
  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users List (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No matching results found
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users List ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <RoleIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined on{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-US")}
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-1">
                          Last login:{" "}
                          {new Date(user.lastLogin).toLocaleDateString("en-US")}
                        </div>
                      )}
                    </div>

                    {user.role === "STUDENT" &&
                      user.enrollmentCount !== undefined && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Enrolled in {user.enrollmentCount} courses
                        </div>
                      )}

                    {user.role === "PROFESSOR" &&
                      user.courseCount !== undefined && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Teaching {user.courseCount} courses
                        </div>
                      )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(`/admin/students/${user.id}`, "_blank")
                      }
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => alert("Edit feature is under development")}
                    >
                      Edit Information
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onUserAction(
                          user.id,
                          user.isActive ? "deactivate" : "activate"
                        )
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate Account"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onUserAction(user.id, "delete")}
                    >
                      Delete Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}