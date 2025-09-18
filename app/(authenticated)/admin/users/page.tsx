'use client';
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '@/lib/supabase/data-fetching';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getAllUsers().then((users) => {
      setUsers(users || []);
      setLoading(false);
    });
  }, []);

  const handleRoleChange = async (
    userId: string,
    newRole: 'applicant' | 'recruiter' | 'admin'
  ) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      toast({
        title: 'Role updated',
        description: `User role changed to ${newRole}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.register_no?.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === 'all' || (u.role && u.role.toLowerCase() === roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-4 sm:p-8 text-center text-base sm:text-lg">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">User Management</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        <Input
          placeholder="Search by name, email, or register no."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 text-sm sm:text-base"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 text-sm sm:text-base">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="applicant">Applicant</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <Table className="min-w-full">
        <TableHeader>
          <TableRow>
              <TableHead className="text-xs sm:text-sm">Name</TableHead>
              <TableHead className="text-xs sm:text-sm">Email</TableHead>
              <TableHead className="text-xs sm:text-sm">Role</TableHead>
              <TableHead className="text-xs sm:text-sm">Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((u) => (
            <TableRow key={u.id}>
                <TableCell className="text-xs sm:text-sm">{u.full_name || '-'}</TableCell>
                <TableCell className="text-xs sm:text-sm">{u.email || '-'}</TableCell>
                <TableCell className="text-xs sm:text-sm">{u.role || '-'}</TableCell>
              <TableCell>
                <select
                  value={u.role}
                  onChange={(e) =>
                    handleRoleChange(
                      u.id,
                      e.target.value as 'applicant' | 'recruiter' | 'admin'
                    )
                  }
                    className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <option value="applicant">applicant</option>
                  <option value="recruiter">recruiter</option>
                  <option value="admin">admin</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
} 