'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getApplicationDeadline, getShortlistDeadline, updateApplicationDeadline } from '@/lib/supabase/data-fetching';

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [deadlines, setDeadlines] = useState<{ application: string; shortlist: string }>({ application: '', shortlist: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (showDeadlineModal) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      Promise.all([
        getApplicationDeadline(),
        getShortlistDeadline()
      ]).then(([applicationDeadline, shortlistDeadline]) => {
        setDeadlines({
          application: applicationDeadline?.deadline || '',
          shortlist: shortlistDeadline?.deadline || '',
        });
        setLoading(false);
      }).catch(() => {
        setError('Failed to fetch deadlines');
        setLoading(false);
      });
    }
  }, [showDeadlineModal]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateApplicationDeadline('application', deadlines.application);
      await updateApplicationDeadline('shortlist', deadlines.shortlist);
      setSuccess('Deadlines updated successfully!');
    } catch (e) {
      setError('Failed to update deadlines');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>
      <div className="mb-6 sm:mb-8">
        <Button onClick={() => setShowDeadlineModal(true)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base">Manage Deadlines</Button>
      </div>
      <Dialog open={showDeadlineModal} onOpenChange={setShowDeadlineModal}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Manage Deadlines</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Application Deadline</label>
                <Input
                  type="datetime-local"
                  value={deadlines.application}
                  onChange={e => setDeadlines(d => ({ ...d, application: e.target.value }))}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shortlist Deadline</label>
                <Input
                  type="datetime-local"
                  value={deadlines.shortlist}
                  onChange={e => setDeadlines(d => ({ ...d, shortlist: e.target.value }))}
                  className="text-sm sm:text-base"
                />
              </div>
              {error && <div className="text-red-500 text-xs sm:text-sm">{error}</div>}
              {success && <div className="text-green-600 text-xs sm:text-sm">{success}</div>}
              <Button onClick={handleSave} disabled={saving} className="w-full mt-2 text-sm sm:text-base">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Link href="/admin/users" className="block p-4 sm:p-6 rounded-lg border hover:bg-muted transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">User Management</h2>
          <p className="text-sm sm:text-base">View and manage all users, change roles, assign recruiters/evaluators.</p>
        </Link>
        <Link href="/admin/departments" className="block p-4 sm:p-6 rounded-lg border hover:bg-muted transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Departments</h2>
          <p className="text-sm sm:text-base">Create, view, and manage departments. Assign recruiters to departments.</p>
        </Link>
        <Link href="/admin/panels" className="block p-4 sm:p-6 rounded-lg border hover:bg-muted transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Panels</h2>
          <p className="text-sm sm:text-base">Create, view, and manage panels. Assign recruiters/evaluators to panels.</p>
        </Link>
        <Link href="/admin/recruiters" className="block p-4 sm:p-6 rounded-lg border hover:bg-muted transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Recruiters</h2>
          <p className="text-sm sm:text-base">View all recruiters, assign recruiters to departments.</p>
        </Link>
        <Link href="/admin/results" className="block p-4 sm:p-6 rounded-lg border hover:bg-muted transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Results</h2>
          <p className="text-sm sm:text-base">View and manage results.</p>
        </Link>
      </div>
    </div>
  );
} 