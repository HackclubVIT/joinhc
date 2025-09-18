'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAllPanels, getDepartmentNameById, getShortlistedApplicantsByDepartment, assignApplicantsToPanels, rebalanceApplicantsAcrossPanels, assignApplicantToPanel } from '@/lib/supabase/data-fetching';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

export default function PanelAssignmentPage() {
  const params = useParams();
  const deptId = params.dept as string;
  const [departmentName, setDepartmentName] = useState('');
  const [panels, setPanels] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptName, panelList, applicantList] = await Promise.all([
          getDepartmentNameById(deptId),
          getAllPanels(),
          getShortlistedApplicantsByDepartment(deptId),
        ]);
        setDepartmentName(deptName || deptId);
        setPanels(panelList.filter((p: any) => p.department_id === deptId));
        setApplicants(applicantList);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deptId, toast]);

  const panelIds = panels.map((p) => p.id);

  const handleManualAssign = async (applicantId: string, panelId: string | null, preference: 'first' | 'second') => {
    try {
      await assignApplicantToPanel(applicantId, panelId || '', preference);
      const updated = await getShortlistedApplicantsByDepartment(deptId);
      setApplicants(updated);
      toast({ title: 'Updated', description: 'Applicant assignment updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update assignment', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;

  const panelCounts: Record<string, number> = {};
  for (const p of panels) panelCounts[p.id] = 0;
  for (const a of applicants) {
    if (a.preference === 'first' && a.first_pref_panel_id && panelCounts[a.first_pref_panel_id] !== undefined) {
      panelCounts[a.first_pref_panel_id]++;
    }
    if (a.preference === 'second' && a.second_pref_panel_id && panelCounts[a.second_pref_panel_id] !== undefined) {
      panelCounts[a.second_pref_panel_id]++;
    }
    if (a.preference === 'both') {
      if (a.first_pref_panel_id && panelCounts[a.first_pref_panel_id] !== undefined) panelCounts[a.first_pref_panel_id]++;
      if (a.second_pref_panel_id && panelCounts[a.second_pref_panel_id] !== undefined) panelCounts[a.second_pref_panel_id]++;
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Panel Assignment for {departmentName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {panels.map((panel) => (
          <Card key={panel.id}>
            <CardHeader>
              <CardTitle>{panel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Applicants: {panelCounts[panel.id]}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Preference</TableHead>
            <TableHead>Panel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((a) => {
            let panelValue = '';
            let prefLabel = '';
            let prefKey: 'first' | 'second' = 'first';
            if (a.preference === 'first') {
              panelValue = a.first_pref_panel_id || '';
              prefLabel = 'First';
              prefKey = 'first';
            } else if (a.preference === 'second') {
              panelValue = a.second_pref_panel_id || '';
              prefLabel = 'Second';
              prefKey = 'second';
            } else if (a.preference === 'both') {
              return [
                <TableRow key={a.id + '-first'} className={!a.first_pref_panel_id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>First</TableCell>
                  <TableCell>
                    <Select value={a.first_pref_panel_id || 'unassigned'} onValueChange={(val) => handleManualAssign(a.id, val === 'unassigned' ? null : val, 'first')}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Panel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {panels.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>,
                <TableRow key={a.id + '-second'} className={!a.second_pref_panel_id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>Second</TableCell>
                  <TableCell>
                    <Select value={a.second_pref_panel_id || 'unassigned'} onValueChange={(val) => handleManualAssign(a.id, val === 'unassigned' ? null : val, 'second')}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Panel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {panels.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ];
            }
            return (
              <TableRow key={a.id} className={!panelValue ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{prefLabel}</TableCell>
                <TableCell>
                  <Select value={panelValue || 'unassigned'} onValueChange={(val) => handleManualAssign(a.id, val === 'unassigned' ? null : val, prefKey)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Panel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {panels.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 