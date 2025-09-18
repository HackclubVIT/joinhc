'use client';
import { useEffect, useState } from 'react';
import { getAllDepartments, createDepartment } from '@/lib/supabase/data-fetching';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getAllDepartments()
      .then(setDepartments)
      .catch((err) => {
        setError('Failed to load departments');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newDeptName.trim()) {
      setError('Department name is required');
      return;
    }
    setCreating(true);
    try {
      const dept = await createDepartment(newDeptName, newDeptDesc);
      setDepartments((prev) => [...prev, dept]);
      setNewDeptName('');
      setNewDeptDesc('');
      toast({ title: 'Department created', description: dept.name });
    } catch (err: any) {
      setError(err?.message || 'Failed to create department');
      toast({ title: 'Error', description: err?.message || 'Failed to create department', variant: 'destructive' });
      console.error('Create department error:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Department Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell>{d.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <Input
          placeholder="Department name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          required
        />
        <Input
          placeholder="Description (optional)"
          value={newDeptDesc}
          onChange={(e) => setNewDeptDesc(e.target.value)}
        />
        <Button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Add'}
        </Button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
    </div>
  );
} 