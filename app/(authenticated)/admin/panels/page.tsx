'use client';
import { useEffect, useState } from 'react';
import { getAllPanels, createPanel, getAllDepartments } from '@/lib/supabase/data-fetching';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

export default function AdminPanelsPage() {
  const [panels, setPanels] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllPanels(), getAllDepartments()]).then(([panels, depts]) => {
      setPanels(panels || []);
      setDepartments(depts || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!name || !departmentId) return;
    try {
      const panel = await createPanel(name, departmentId);
      setPanels((prev) => [...prev, panel]);
      setName('');
      setDepartmentId('');
      toast({ title: 'Panel created', description: panel.name });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create panel', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Panel Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Meet Link</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {panels.map((panel) => (
            <TableRow key={panel.id}>
              <TableCell>{panel.name}</TableCell>
              <TableCell>{departments.find((d) => d.id === panel.department_id)?.name || panel.department_id}</TableCell>
              <TableCell>{panel.meet_link || '-'}</TableCell>
              <TableCell>
                <a href={`/admin/panels/${panel.department_id}`}>
                  <Button size="sm" variant="outline">Assign Applicants</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-8 flex gap-2">
        <Input placeholder="Panel Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <Button onClick={handleCreate}>Add Panel</Button>
      </div>
    </div>
  );
} 