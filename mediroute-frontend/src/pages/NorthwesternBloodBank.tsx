import { useState, useMemo } from 'react';
import {
  Droplet,
  Search,
  Phone,
  MessageSquare,
  Building2,
  GraduationCap,
  X,
  Filter,
  UserCheck,
  Award,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { northwesternBloodDonors } from '../data/northwesternBloodDonors';
import type { BloodDonor } from '../types';
import { Card, Button, Badge } from '../components/UI';

const bloodGroups = ['All Groups', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const departments = ['All Departments', 'CSE', 'EEE', 'CIVIL'];

export function NorthwesternBloodBank() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // Filter logic
  const filteredDonors = useMemo(() => {
    return northwesternBloodDonors.filter((donor) => {
      const matchesGroup = selectedGroup === 'All Groups' || donor.bloodGroup === selectedGroup;
      const matchesDept = selectedDept === 'All Departments' || donor.department === selectedDept;

      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchesGroup && matchesDept;

      const matchesSearch =
        donor.name.toLowerCase().includes(term) ||
        donor.department.toLowerCase().includes(term) ||
        donor.bloodGroup.toLowerCase().includes(term) ||
        donor.intakeType.toLowerCase().includes(term) ||
        donor.semester.toLowerCase().includes(term) ||
        donor.phoneNumber.includes(term);

      return matchesGroup && matchesDept && matchesSearch;
    });
  }, [searchTerm, selectedGroup, selectedDept]);

  const displayedDonors = filteredDonors.slice(0, page * pageSize);

  // Statistics calculation
  const totalDonors = northwesternBloodDonors.length;
  const rareDonors = northwesternBloodDonors.filter((d) => d.bloodGroup.includes('-')).length;
  const cseDonors = northwesternBloodDonors.filter((d) => d.department === 'CSE').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-red-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-rose-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-md border border-rose-400/30">
            <Droplet size={14} className="text-rose-400 animate-pulse" /> North Western University Blood Bank
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            NWU Student Blood Donors Directory
          </h1>

          <p className="text-sm text-rose-100 font-medium leading-relaxed">
            North Western University (Khulna, Bangladesh) Verified Student Blood Donors List. Instant emergency blood contact directory for Khulna region.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold text-rose-200">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <UserCheck size={15} className="text-rose-300" />
              <span>109 Student Donors</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <AlertCircle size={15} className="text-amber-300" />
              <span>{rareDonors} Rare Negative Donors (A-, B-, O-)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <GraduationCap size={15} className="text-teal-300" />
              <span>{cseDonors} CSE Donors</span>
            </div>
          </div>
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-600" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by donor name, blood group (e.g. O+, A-), department (CSE, EEE, CIVIL), or phone..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm shadow-sm transition-all focus:border-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-600/15 font-medium placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Blood Group Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 pr-2 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <Droplet size={14} className="text-rose-600" /> Blood Group:
          </div>
          {bloodGroups.map((group) => {
            const isSelected = selectedGroup === group;
            const isNegative = group.includes('-');
            return (
              <button
                key={group}
                onClick={() => {
                  setSelectedGroup(group);
                  setPage(1);
                }}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? isNegative
                      ? 'bg-rose-900 text-white shadow-md ring-2 ring-rose-900/30'
                      : 'bg-rose-700 text-white shadow-md ring-2 ring-rose-700/30'
                    : isNegative
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 pr-2 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <GraduationCap size={14} className="text-teal-700" /> Department:
          </div>
          {departments.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setPage(1);
                }}
                className={`shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
        <span>
          Showing <strong className="text-slate-900 font-bold">{displayedDonors.length}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{filteredDonors.length}</strong> verified donors
          {selectedGroup !== 'All Groups' && ` (${selectedGroup})`}
          {selectedDept !== 'All Departments' && ` in ${selectedDept}`}
        </span>
        {searchTerm && (
          <span className="text-rose-700 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
            Search filter active for "{searchTerm}"
          </span>
        )}
      </div>

      {/* Donors Cards Grid */}
      {displayedDonors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedDonors.map((donor) => {
            const isNegative = donor.bloodGroup.includes('-');
            const firstPhone = donor.phoneNumber.split('/')[0].trim();

            return (
              <Card
                key={donor.id}
                className={`hover-lift flex flex-col justify-between overflow-hidden border-slate-200/90 transition-all duration-300 ${
                  isNegative ? 'bg-gradient-to-b from-rose-50/40 to-white border-rose-200' : 'bg-white'
                }`}
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Bar: Blood Group Badge + Dept */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{donor.name}</h3>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <GraduationCap size={13} className="text-teal-700 shrink-0" />
                        <span>{donor.department}</span> · <span>Semester {donor.semester}</span>
                      </p>
                    </div>

                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-black text-sm shadow-xs ${
                        isNegative
                          ? 'bg-rose-950 text-white shadow-rose-900/30 ring-2 ring-rose-400/40'
                          : 'bg-rose-700 text-white shadow-rose-700/20'
                      }`}
                    >
                      {donor.bloodGroup}
                    </div>
                  </div>

                  {/* Academic Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 border border-slate-200/70">
                      {donor.intakeType}
                    </span>
                    <span className="rounded-md bg-teal-50 text-teal-800 px-2 py-0.5 border border-teal-200/70">
                      North Western Univ
                    </span>
                  </div>

                  {/* Phone Display */}
                  <div className="rounded-xl bg-slate-50 p-2.5 text-xs font-bold text-slate-800 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400 font-normal">Contact:</span>
                    <span className="text-slate-900">{donor.phoneNumber}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/70 text-xs font-bold">
                  <a
                    href={`tel:${firstPhone}`}
                    className="inline-flex items-center justify-center gap-1.5 py-3 text-teal-700 hover:bg-teal-700 hover:text-white transition-colors border-r border-slate-100"
                  >
                    <Phone size={14} /> Call Donor
                  </a>

                  <a
                    href={`https://wa.me/${firstPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors"
                  >
                    <MessageSquare size={14} /> WhatsApp / SMS
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-3 shadow-sm border-slate-200">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Droplet size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No blood donors match your filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching blood groups or clearing search keywords to view all 109 student donors.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedGroup('All Groups');
              setSelectedDept('All Departments');
            }}
          >
            Clear Filters & Show All
          </Button>
        </Card>
      )}

      {/* Pagination Load More */}
      {displayedDonors.length < filteredDonors.length && (
        <div className="pt-6 text-center">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            className="px-8 py-3 rounded-2xl shadow-sm border-slate-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200 transition-all font-semibold"
          >
            Load More Donors ({filteredDonors.length - displayedDonors.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
