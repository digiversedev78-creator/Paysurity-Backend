'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  department?: string;
  status?: string;
  employmentType?: string;
  hourlyRate?: number | null;
  salary?: number | null;
  email?: string;
  phone?: string;
}

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  shiftType?: string;
  notes?: string;
}

// Seed data used as graceful fallback when API is unreachable
const SEED: Employee[] = [
  { id: 'E001', firstName: 'Maria', lastName: 'Santos', role: 'Server', department: 'Front of House', status: 'ACTIVE', employmentType: 'FULL_TIME', hourlyRate: 15.00, email: 'maria@bistro.com' },
  { id: 'E002', firstName: 'Alex', lastName: 'Kim', role: 'Server', department: 'Front of House', status: 'ACTIVE', employmentType: 'PART_TIME', hourlyRate: 15.00, email: 'alex@bistro.com' },
  { id: 'E003', firstName: 'Carlos', lastName: 'Blanco', role: 'Line Cook', department: 'Kitchen', status: 'ACTIVE', employmentType: 'FULL_TIME', hourlyRate: 18.50, email: 'carlos@bistro.com' },
  { id: 'E004', firstName: 'Jamie', lastName: 'Torres', role: 'Sous Chef', department: 'Kitchen', status: 'ACTIVE', employmentType: 'FULL_TIME', hourlyRate: 22.00, email: 'jamie@bistro.com' },
  { id: 'E005', firstName: 'Lisa', lastName: 'Park', role: 'Host', department: 'Front of House', status: 'ACTIVE', employmentType: 'PART_TIME', hourlyRate: 14.00, email: 'lisa@bistro.com' },
  { id: 'E006', firstName: 'David', lastName: 'Chen', role: 'Bartender', department: 'Bar', status: 'ACTIVE', employmentType: 'FULL_TIME', hourlyRate: 16.00, email: 'david@bistro.com' },
  { id: 'E007', firstName: 'Rachel', lastName: 'Green', role: 'Manager', department: 'Management', status: 'ACTIVE', employmentType: 'FULL_TIME', salary: 72000, email: 'rachel@bistro.com' },
];

const SEED_SCHEDULES: Schedule[] = [
  { id: 'S001', startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 86400000 + 28800000).toISOString(), shiftType: 'MORNING', notes: 'Open shift' },
  { id: 'S002', startTime: new Date(Date.now() + 172800000).toISOString(), endTime: new Date(Date.now() + 172800000 + 21600000).toISOString(), shiftType: 'AFTERNOON', notes: '' },
];

const getName = (e: Employee) =>
  e.name ?? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();

const fmtPay = (e: Employee) => {
  if (e.hourlyRate) return `$${e.hourlyRate.toFixed(2)}/hr`;
  if (e.salary) return `$${(e.salary / 1000).toFixed(0)}k/yr`;
  return '—';
};

const fmtDt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

// ─── Badge component ──────────────────────────────────────────────────────────
const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
    {label}
  </span>
);

const statusBadge = (status?: string) => {
  const s = (status ?? 'ACTIVE').toUpperCase();
  if (s === 'ACTIVE') return <Badge label="Active" color="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" />;
  if (s === 'ON_LEAVE') return <Badge label="On Leave" color="bg-amber-500/15 text-amber-400 border border-amber-500/30" />;
  return <Badge label="Inactive" color="bg-zinc-700 text-zinc-400 border border-zinc-600" />;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Schedule drawer state
  const [drawerEmployee, setDrawerEmployee] = useState<Employee | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedLoading, setSchedLoading] = useState(false);

  // Add employee modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', role: '', department: '', employmentType: 'FULL_TIME', hourlyRate: '', email: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Fetch employees ──────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/employees`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: Employee[] = Array.isArray(json) ? json : json.data ?? [];
      setEmployees(list.length > 0 ? list : SEED);
    } catch {
      setEmployees(SEED);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ─── Fetch schedules for an employee ─────────────────────────────────────
  const openScheduleDrawer = async (emp: Employee) => {
    setDrawerEmployee(emp);
    setSchedLoading(true);
    setSchedules([]);
    try {
      const res = await fetch(`${API}/employees/${emp.id}/schedules`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: Schedule[] = Array.isArray(json) ? json : json.data ?? [];
      setSchedules(list.length > 0 ? list : SEED_SCHEDULES);
    } catch {
      setSchedules(SEED_SCHEDULES);
    } finally {
      setSchedLoading(false);
    }
  };

  // ─── Add employee ─────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const payload = {
        ...addForm,
        hourlyRate: addForm.hourlyRate ? parseFloat(addForm.hourlyRate) : undefined,
      };
      const res = await fetch(`${API}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      showToast('Employee added successfully');
      setAddOpen(false);
      setAddForm({ firstName: '', lastName: '', role: '', department: '', employmentType: 'FULL_TIME', hourlyRate: '', email: '' });
      await fetchEmployees();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // ─── Filter & search ──────────────────────────────────────────────────────
  const visible = employees.filter(e => {
    const name = getName(e).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (e.role ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || e.department === filter;
    return matchSearch && matchFilter;
  });

  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department ?? 'Other').filter(Boolean)))];

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Staff', value: employees.length, icon: '👥', color: 'from-blue-600 to-blue-800' },
    { label: 'Full-Time', value: employees.filter(e => e.employmentType === 'FULL_TIME').length, icon: '📋', color: 'from-emerald-600 to-emerald-800' },
    { label: 'Part-Time', value: employees.filter(e => e.employmentType === 'PART_TIME').length, icon: '🕐', color: 'from-violet-600 to-violet-800' },
    { label: 'Departments', value: new Set(employees.map(e => e.department)).size, icon: '🏢', color: 'from-amber-600 to-amber-800' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">Team Management</p>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
        </div>
        <button
          id="add-employee-btn"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30"
        >
          <span className="text-lg">+</span> Add Employee
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/70 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === d ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
            >
              {d === 'ALL' ? 'All Depts' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-zinc-500 text-sm animate-pulse">Loading employees…</div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">No employees match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-left font-semibold">Department</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Pay</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((emp, i) => (
                  <tr
                    key={emp.id}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/50'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getName(emp).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100">{getName(emp)}</p>
                          <p className="text-zinc-500 text-xs">{emp.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-300">{emp.role ?? '—'}</td>
                    <td className="px-5 py-4 text-zinc-400 text-xs">{emp.department ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${emp.employmentType === 'FULL_TIME' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'}`}>
                        {emp.employmentType === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-emerald-400 text-xs">{fmtPay(emp)}</td>
                    <td className="px-5 py-4">{statusBadge(emp.status)}</td>
                    <td className="px-5 py-4">
                      <button
                        id={`view-schedule-${emp.id}`}
                        onClick={() => openScheduleDrawer(emp)}
                        className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700 hover:border-blue-500/50 text-zinc-300 hover:text-blue-300 rounded-lg transition-colors"
                      >
                        📅 Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Drawer */}
      {drawerEmployee && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm z-40" onClick={() => setDrawerEmployee(null)}>
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full sm:w-[420px] sm:mr-6 sm:mb-6 p-6 shadow-2xl animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Upcoming Shifts</p>
                <h2 className="text-lg font-bold text-white mt-0.5">{getName(drawerEmployee)}</h2>
              </div>
              <button onClick={() => setDrawerEmployee(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">✕</button>
            </div>

            {schedLoading ? (
              <div className="text-center text-zinc-500 text-sm py-8 animate-pulse">Loading schedule…</div>
            ) : schedules.length === 0 ? (
              <div className="text-center text-zinc-600 text-sm py-8">No upcoming shifts scheduled.</div>
            ) : (
              <div className="space-y-3">
                {schedules.map(s => (
                  <div key={s.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${s.shiftType === 'MORNING' ? 'bg-amber-500/15 text-amber-400' : s.shiftType === 'AFTERNOON' ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-500/15 text-violet-400'}`}>
                        {s.shiftType ?? 'REGULAR'}
                      </span>
                      <span className="text-zinc-500 text-xs font-mono">
                        {Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000)}h
                      </span>
                    </div>
                    <p className="text-zinc-200 text-sm font-semibold">{fmtDt(s.startTime)}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">→ {fmtDt(s.endTime)}</p>
                    {s.notes && <p className="text-zinc-500 text-xs mt-2 italic">"{s.notes}"</p>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setDrawerEmployee(null)}
              className="w-full mt-5 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {addOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Add New Employee</h2>
              <button onClick={() => setAddOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">First Name *</label>
                  <input required value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">Last Name *</label>
                  <input required value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1">Email *</label>
                <input required type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">Role *</label>
                  <input required value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                    placeholder="Server, Cook…"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">Department</label>
                  <input value={addForm.department} onChange={e => setAddForm(p => ({ ...p, department: e.target.value }))}
                    placeholder="Kitchen, Bar…"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">Employment Type</label>
                  <select value={addForm.employmentType} onChange={e => setAddForm(p => ({ ...p, employmentType: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors">
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">Hourly Rate ($)</label>
                  <input type="number" min="0" step="0.01" value={addForm.hourlyRate} onChange={e => setAddForm(p => ({ ...p, hourlyRate: e.target.value }))}
                    placeholder="15.00"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
                </div>
              </div>
              {addError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddOpen(false)}
                  className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                  {addLoading ? 'Adding…' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}