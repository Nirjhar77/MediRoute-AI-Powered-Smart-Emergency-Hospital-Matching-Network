import { useState, useMemo, type ReactNode } from 'react';
import {
  Search,
  UserCheck,
  Stethoscope,
  MapPin,
  ExternalLink,
  X,
  Building2,
  Phone,
  Filter,
  Heart,
  Baby,
  Eye,
  Brain,
  Sparkles,
  Activity,
  Pill,
  Shield,
  Zap,
  Smile,
  ChevronRight,
  Sparkle,
  Award
} from 'lucide-react';
import { khulnaDoctors, doctorCategories } from '../data/doctorsData';
import type { Doctor } from '../types';
import { Button, Card } from '../components/UI';

// Category to Icon Mapper
const getCategoryIcon = (category: string): ReactNode => {
  switch (category) {
    case 'Medicine':
      return <Stethoscope size={14} className="text-teal-600" />;
    case 'Gynecology & IVF':
      return <Sparkles size={14} className="text-rose-500" />;
    case 'Orthopedics & Trauma':
      return <Activity size={14} className="text-blue-600" />;
    case 'Dermatology & Skin':
      return <Sparkle size={14} className="text-amber-500" />;
    case 'Diabetes & Hormones':
      return <Pill size={14} className="text-purple-600" />;
    case 'General & Laparoscopic Surgery':
      return <Activity size={14} className="text-indigo-600" />;
    case 'Gastroenterology & Liver':
      return <Activity size={14} className="text-emerald-600" />;
    case 'Chest & Respiratory':
      return <Activity size={14} className="text-sky-600" />;
    case 'Pediatrics & Child':
      return <Baby size={14} className="text-pink-500" />;
    case 'Nephrology & Kidney':
      return <Activity size={14} className="text-cyan-600" />;
    case 'Cardiology & Heart':
      return <Heart size={14} className="text-rose-600" />;
    case 'Neurology & Neuro Surgery':
    case 'Neurology':
      return <Brain size={14} className="text-purple-600" />;
    case 'Ophthalmology & Eye':
      return <Eye size={14} className="text-teal-600" />;
    case 'ENT (Ear, Nose, Throat)':
      return <Shield size={14} className="text-amber-600" />;
    case 'Urology':
      return <Activity size={14} className="text-indigo-500" />;
    case 'Oncology & Cancer':
      return <Award size={14} className="text-rose-700" />;
    case 'Psychiatry & Mental Health':
      return <Smile size={14} className="text-emerald-600" />;
    case 'Physiotherapy & Rehab':
      return <Zap size={14} className="text-amber-500" />;
    default:
      return <UserCheck size={14} className="text-slate-600" />;
  }
};

export function Doctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Specialties');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // Filter doctors based on search & category
  const filteredDoctors = useMemo(() => {
    return khulnaDoctors.filter((doc) => {
      const matchesCategory =
        selectedCategory === 'All Specialties' ||
        doc.category === selectedCategory ||
        (doc.specialtyBn && doc.specialtyBn.includes(selectedCategory));

      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchesCategory;

      const matchesSearch =
        doc.nameEn.toLowerCase().includes(term) ||
        doc.nameBn.toLowerCase().includes(term) ||
        doc.specialtyBn.toLowerCase().includes(term) ||
        doc.degreesEn.toLowerCase().includes(term) ||
        doc.degreesBn.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const displayedDoctors = filteredDoctors.slice(0, page * pageSize);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Banner with Modern Styling & Subtle Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 p-6 sm:p-9 text-white shadow-2xl border border-teal-900/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 backdrop-blur-md border border-teal-400/30 shadow-sm animate-float">
            <Stethoscope size={15} className="text-teal-300 animate-pulse" /> Official Khulna Medical Directory
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Khulna <span className="gradient-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300">Specialist Doctors</span> Directory
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            খুলনার সকল অভিজ্ঞ ও বিশেষজ্ঞ চিকিৎসকদের সঠিক তথ্য, ডিগ্রি, চেম্বারের সময় এবং যোগাযোগের মাধ্যম সহজেই সন্ধান করুন।
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold text-teal-100">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 transition hover:bg-white/15">
              <UserCheck size={16} className="text-emerald-400" />
              <span>431 Verified Doctors</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 transition hover:bg-white/15">
              <Building2 size={16} className="text-teal-300" />
              <span>19 Medical Specialties</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10 transition hover:bg-white/15">
              <MapPin size={16} className="text-rose-400" />
              <span>Khulna Division</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Lighting Effects */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Category Filter Section */}
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by doctor name (English / বাংলা), specialty, degree, or hospital..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-10 text-sm shadow-sm transition-all focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 placeholder:text-slate-400 font-medium"
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

        {/* Categories Horizontal Scroll with Specialty Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          <div className="flex items-center gap-1.5 pr-2 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <Filter size={14} className="text-teal-700" /> Filter:
          </div>
          {doctorCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const icon = getCategoryIcon(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 ring-2 ring-teal-700/30 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <span className={isSelected ? 'text-white' : ''}>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          Showing <strong className="text-slate-900 font-bold">{displayedDoctors.length}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{filteredDoctors.length}</strong> doctors
          {selectedCategory !== 'All Specialties' && (
            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 ml-1">
              {selectedCategory}
            </span>
          )}
        </span>
        {searchTerm && (
          <span className="text-teal-700 font-medium bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
            Matching "{searchTerm}"
          </span>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {displayedDoctors.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedDoctors.map((doc) => (
            <Card
              key={doc.id}
              className="group hover-lift flex flex-col justify-between overflow-hidden border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-teal-500/40"
            >
              <div className="p-5 space-y-3.5">
                {/* Doctor Avatar & Basic Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-600/20 bg-gradient-to-br from-slate-100 to-teal-50 shadow-inner group-hover:border-teal-500/50 transition-colors">
                    {doc.image ? (
                      <img
                        src={doc.image}
                        alt={doc.nameEn}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center bg-teal-50 text-teal-700 font-extrabold text-xl">
                      {doc.nameEn.replace(/^(Dr\.|Prof\.|Prof Dr\.)\s*/i, '').charAt(0) || 'D'}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 truncate max-w-full">
                      {getCategoryIcon(doc.category || 'Specialist')}
                      <span className="truncate">{doc.category || 'Specialist'}</span>
                    </span>
                    
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {doc.nameEn}
                    </h3>
                    
                    {doc.nameBn && (
                      <p className="text-xs font-semibold text-emerald-700 truncate font-bangla">
                        {doc.nameBn}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specialty Description */}
                {doc.specialtyBn && (
                  <div className="rounded-xl bg-slate-50/90 p-2.5 text-xs font-medium text-slate-700 border border-slate-100 line-clamp-2 leading-snug">
                    {doc.specialtyBn}
                  </div>
                )}

                {/* Degrees & Qualifications */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  {doc.degreesEn && (
                    <p className="line-clamp-2 leading-relaxed text-slate-600 font-normal">
                      <strong className="text-slate-800 font-semibold">Degree:</strong> {doc.degreesEn}
                    </p>
                  )}
                  {doc.degreesBn && (
                    <p className="line-clamp-2 leading-relaxed text-emerald-900/90 font-medium">
                      {doc.degreesBn}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Full Profile <ChevronRight size={14} />
                </button>

                <a
                  href={doc.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Source <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4 shadow-sm border-slate-200">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
            <Stethoscope size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No doctors match your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any specialist matching your keyword or selected category filter. Try clearing your search term or picking "All Specialties".
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All Specialties');
            }}
            className="shadow-sm"
          >
            Clear Filters & Show All
          </Button>
        </Card>
      )}

      {/* Pagination Load More */}
      {displayedDoctors.length < filteredDoctors.length && (
        <div className="pt-6 text-center">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            className="px-8 py-3 rounded-2xl shadow-sm border-slate-200 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-all font-semibold"
          >
            Load More Doctors ({filteredDoctors.length - displayedDoctors.length} remaining)
          </Button>
        </div>
      )}

      {/* Interactive Doctor Profile Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Doctor Profile Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-600/30 bg-gradient-to-br from-slate-100 to-teal-50 shadow-md">
                {selectedDoctor.image ? (
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.nameEn}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 -z-10 flex items-center justify-center bg-teal-50 text-teal-700 font-extrabold text-2xl">
                  {selectedDoctor.nameEn.replace(/^(Dr\.|Prof\.|Prof Dr\.)\s*/i, '').charAt(0) || 'D'}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {getCategoryIcon(selectedDoctor.category || 'Specialist Doctor')}
                  <span>{selectedDoctor.category || 'Specialist Doctor'}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{selectedDoctor.nameEn}</h2>
                {selectedDoctor.nameBn && (
                  <h3 className="text-base font-bold text-emerald-700 font-bangla">{selectedDoctor.nameBn}</h3>
                )}
              </div>
            </div>

            {/* Specialty Tag */}
            {selectedDoctor.specialtyBn && (
              <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 p-4 text-sm font-medium text-teal-950 border border-teal-100">
                <strong className="block text-xs uppercase tracking-wider text-teal-700 mb-1 font-bold">
                  Specialty / বিশেশজ্ঞতা:
                </strong>
                {selectedDoctor.specialtyBn}
              </div>
            )}

            {/* Qualifications Section */}
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Qualifications & Affiliation (English)
                </h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                  {selectedDoctor.degreesEn || 'Information available on website detail page.'}
                </p>
              </div>

              {selectedDoctor.degreesBn && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-bangla">
                    ডিগ্রি ও কর্মস্থল (বাংলা)
                  </h4>
                  <p className="text-emerald-950 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 leading-relaxed font-medium">
                    {selectedDoctor.degreesBn}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <a
                href="tel:+8801763818283"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-800 transition-all active:scale-[0.98]"
              >
                <Phone size={16} /> Call Khulna Helpline
              </a>

              <a
                href={selectedDoctor.detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                View on DoctorAllKhulna <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
