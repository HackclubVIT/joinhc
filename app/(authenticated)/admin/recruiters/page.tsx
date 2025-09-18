'use client';
import { useEffect, useState } from 'react';
import { getAllRecruiters, getAllDepartments, getRecruiterDepartments, assignRecruiterToDepartment, removeRecruiterFromDepartment, updateRecruiterDepartmentRole } from '@/lib/supabase/data-fetching';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedDept, setSelectedDept] = useState<Record<string, string>>({});
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [roleUpdating, setRoleUpdating] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recs, depts] = await Promise.all([
          getAllRecruiters(),
          getAllDepartments(),
        ]);
        setRecruiters(recs);
        setDepartments(depts);
        
        const allAssignments: Record<string, any[]> = {};
        for (const rec of recs) {
          allAssignments[rec.id] = await getRecruiterDepartments(rec.id);
        }
        setAssignments(allAssignments);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleAssign = async (recruiterId: string) => {
    const deptId = selectedDept[recruiterId];
    const role = selectedRole[recruiterId] as 'recruiter' | 'evaluator';
    if (!deptId || !role) return;
    try {
      await assignRecruiterToDepartment(recruiterId, deptId, role);
      const updated = await getRecruiterDepartments(recruiterId);
      setAssignments((prev) => ({ ...prev, [recruiterId]: updated }));
      toast({ title: 'Assigned', description: 'Department assigned successfully' });
      setSelectedDept((prev) => ({ ...prev, [recruiterId]: '' }));
      setSelectedRole((prev) => ({ ...prev, [recruiterId]: '' }));
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to assign', variant: 'destructive' });
    }
  };

  const handleRemove = async (recruiterId: string, departmentId: string) => {
    try {
      await removeRecruiterFromDepartment(recruiterId, departmentId);
      const updated = await getRecruiterDepartments(recruiterId);
      setAssignments((prev) => ({ ...prev, [recruiterId]: updated }));
      toast({ title: 'Removed', description: 'Department removed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to remove', variant: 'destructive' });
    }
  };

  const handleRoleEdit = async (recruiterId: string, departmentId: string, newRole: 'recruiter' | 'evaluator') => {
    setRoleUpdating((prev) => ({ ...prev, [recruiterId + '-' + departmentId]: true }));
    try {
      await updateRecruiterDepartmentRole(recruiterId, departmentId, newRole);
      const updated = await getRecruiterDepartments(recruiterId);
      setAssignments((prev) => ({ ...prev, [recruiterId]: updated }));
      toast({ title: 'Role updated', description: 'Role updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update role', variant: 'destructive' });
    } finally {
      setRoleUpdating((prev) => ({ ...prev, [recruiterId + '-' + departmentId]: false }));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading...</div>;
  }

  const filteredRecruiters = recruiters.filter((rec) => {
    const matchesSearch =
      rec.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      rec.email?.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      deptFilter === 'all' || (assignments[rec.id]?.some((a) => a.department_id === deptFilter));
    const matchesRole =
      roleFilter === 'all' || (assignments[rec.id]?.some((a) => a.role === roleFilter));
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Recruiter Management</h1>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="evaluator">Evaluator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Departments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecruiters.map((rec) => (
            <TableRow key={rec.id}>
              <TableCell>{rec.full_name}</TableCell>
              <TableCell>{rec.email}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded((prev) => ({ ...prev, [rec.id]: !prev[rec.id] }))}
                >
                  {expanded[rec.id] ? 'Hide' : 'Show'}
                </Button>
                {expanded[rec.id] && (
                  <div className="mt-2 space-y-2">
                    {assignments[rec.id]?.length === 0 && <div className="text-muted-foreground text-sm">No departments assigned</div>}
                    {assignments[rec.id]?.map((a) => (
                      <div key={a.department_id} className="flex items-center gap-2">
                        <span className="font-medium">{a.department?.name}</span>
                        <Select
                          value={a.role}
                          onValueChange={(val) => handleRoleEdit(rec.id, a.department_id, val as 'recruiter' | 'evaluator')}
                          disabled={roleUpdating[rec.id + '-' + a.department_id]}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="evaluator">Evaluator</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => handleRemove(rec.id, a.department_id)}>Remove</Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Select
                        value={selectedDept[rec.id] || ''}
                        onValueChange={(val) => setSelectedDept((prev) => ({ ...prev, [rec.id]: val }))}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments
                            .filter((d) => !assignments[rec.id]?.some((a) => a.department_id === d.id))
                            .map((d) => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedRole[rec.id] || ''}
                        onValueChange={(val) => setSelectedRole((prev) => ({ ...prev, [rec.id]: val }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                          <SelectItem value="evaluator">Evaluator</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleAssign(rec.id)} disabled={!selectedDept[rec.id] || !selectedRole[rec.id]}>Assign</Button>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 