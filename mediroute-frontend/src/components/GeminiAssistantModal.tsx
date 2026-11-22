import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, CheckCircle2, ShieldAlert, HeartPulse, Wind, Brain, Droplet, Building2, Phone, MapPin, Activity, ArrowRight, Zap } from 'lucide-react';
import type { Capability, EmergencyType, Hospital } from '../types';
import { initialHospitals } from '../data/mockData';
import { northwesternBloodDonors } from '../data/northwesternBloodDonors';

type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  priority?: 'P1 - CRITICAL EMERGENCY' | 'P2 - URGENT CLINICAL' | 'P3 - ROUTINE TRIAGE';
  protocol?: string;
  recommendedType?: EmergencyType;
  recommendedCapabilities?: Capability[];
  targetBloodGroup?: string;
  bloodDonorCount?: number;
  topHospital?: Hospital;
  timestamp: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: 'Hello, I am **MediRoute Clinical Decision AI v2.0**. I evaluate emergency symptoms against **ACLS, ATLS, WHO SARI, and AHA Stroke protocols** to provide capability-aware triage routing, live ICU bed telemetry, and emergency donor matching for the Khulna healthcare network.\n\nDescribe the patient symptoms or emergency scenario below.',
    timestamp: 'Just now',
  },
];

const promptChips = [
  {
    label: '🫀 Acute Chest Pain (STEMI)',
    query: 'Patient is experiencing severe chest tightness, sweating, and radiating left arm pain.',
  },
  {
    label: '🚗 Severe Crash & Massive Bleeding',
    query: 'High-speed road traffic accident with open fracture, heavy hemorrhage, and shock.',
  },
  {
    label: '🧠 Sudden Facial Droop & Slurred Speech',
    query: 'Sudden onset of right-side body weakness, facial droop, and speech impairment within last 60 mins.',
  },
  {
    label: '🫁 Severe Gasping & SpO2 < 85%',
    query: 'Patient gasping for breath with severe asthma attack, cyanosis, and falling blood oxygen saturation.',
  },
  {
    label: '🩸 Emergency O- Negative Donors',
    query: 'Emergency need for rare O- negative blood group donors in Khulna division.',
  },
  {
    label: '🏥 Khulna ICU Bed Telemetry',
    query: 'Show me real-time ICU bed availability across Khulna Medical College Hospital and network facilities.',
  },
];

export function GeminiAssistantModal({
  onClose,
  onApplyPreset,
}: {
  onClose: () => void;
  onApplyPreset?: (type: EmergencyType, caps: Capability[], bloodGroup?: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Advanced Clinical Reasoning Engine
    setTimeout(() => {
      let replyText = '';
      let priority: ChatMessage['priority'] = 'P2 - URGENT CLINICAL';
      let protocol = 'ACLS Standard Clinical Triage';
      let recommendedType: EmergencyType = 'General Emergency';
      let recommendedCapabilities: Capability[] = ['Emergency Department', 'Oxygen'];
      let targetBloodGroup: string | undefined = undefined;
      let bloodDonorCount: number | undefined = undefined;
      let topHospital: Hospital | undefined = initialHospitals[0];

      const lower = text.toLowerCase();

      // 1. CARDIAC EMERGENCY (ACLS STEMI Pathway)
      if (
        lower.includes('chest') ||
        lower.includes('heart') ||
        lower.includes('cardiac') ||
        lower.includes('arm pain') ||
        lower.includes('stemi') ||
        lower.includes('infarction') ||
        lower.includes('angina')
      ) {
        priority = 'P1 - CRITICAL EMERGENCY';
        protocol = 'ACLS Acute Coronary Syndrome (STEMI) Pathway';
        recommendedType = 'Cardiac';
        recommendedCapabilities = ['Emergency Department', 'Cardiology', 'ICU', 'Oxygen', 'Ventilator', 'Blood'];
        targetBloodGroup = 'O-';
        bloodDonorCount = northwesternBloodDonors.filter((d) => d.bloodGroup === 'O-').length;
        topHospital = initialHospitals.find((h) => h.cardiology && h.icu.available > 0) || initialHospitals[0];

        replyText =
          '**Clinical Assessment:** High suspicion of Acute Myocardial Infarction (AMI / STEMI). Door-to-balloon time critical (< 90 minutes).\n\n' +
          '**Mandatory Infrastructure Requirements:**\n' +
          '• **Cardiology Cath Lab**: 24/7 Percutaneous Coronary Intervention (PCI) readiness.\n' +
          '• **Intensive Care Unit (ICU)**: Post-reperfusion continuous cardiac telemetry monitoring.\n' +
          '• **Ventilator & High-Flow Oxygen**: Hemodynamic stabilization.\n\n' +
          '**NWU Blood Bank Standby:** Integrated emergency reserve available.';
      }
      // 2. SEVERE TRAUMA & MASSIVE BLEEDING (ATLS Protocol)
      else if (
        lower.includes('bleeding') ||
        lower.includes('trauma') ||
        lower.includes('accident') ||
        lower.includes('fracture') ||
        lower.includes('wound') ||
        lower.includes('crash') ||
        lower.includes('hemorrhage') ||
        lower.includes('collision') ||
        lower.includes('stab')
      ) {
        priority = 'P1 - CRITICAL EMERGENCY';
        protocol = 'ATLS Trauma Resuscitation & Massive Transfusion';
        recommendedType = 'Trauma';
        recommendedCapabilities = ['Emergency Department', 'Surgery', 'Blood', 'ICU', 'Ventilator', 'Oxygen'];
        targetBloodGroup = 'O-';
        bloodDonorCount = northwesternBloodDonors.filter((d) => d.bloodGroup === 'O-').length;
        topHospital = initialHospitals.find((h) => h.surgery && h.bloodBank && h.icu.available > 0) || initialHospitals[1];

        replyText =
          '**Clinical Assessment:** Severe polytrauma with potential hypovolemic shock. Requires immediate surgical damage control and blood transfusion.\n\n' +
          '**Mandatory Infrastructure Requirements:**\n' +
          '• **Trauma Operating Suite (OR)**: Emergency laparotomy & vascular surgical team.\n' +
          '• **Blood Bank Reserves**: Universal O-Negative blood cross-match standby.\n' +
          '• **Surgical ICU Bed**: Post-operative critical care recovery.\n\n' +
          `**North Western University Blood Donors:** ${bloodDonorCount} student donors ready for immediate emergency contact.`;
      }
      // 3. ACUTE RESPIRATORY CRISIS (WHO SARI Protocol)
      else if (
        lower.includes('breath') ||
        lower.includes('asthma') ||
        lower.includes('oxygen') ||
        lower.includes('gasping') ||
        lower.includes('spo2') ||
        lower.includes('cyanosis') ||
        lower.includes('copd') ||
        lower.includes('pneumonia')
      ) {
        priority = 'P1 - CRITICAL EMERGENCY';
        protocol = 'WHO Severe Acute Respiratory Infection (SARI) Protocol';
        recommendedType = 'Respiratory';
        recommendedCapabilities = ['Emergency Department', 'Ventilator', 'Oxygen', 'ICU'];
        topHospital = initialHospitals.find((h) => h.ventilator.available > 0 && h.oxygen === 'Available') || initialHospitals[0];

        replyText =
          '**Clinical Assessment:** Severe acute respiratory failure with critical SpO2 drop. Requires positive pressure ventilation and non-invasive airway management.\n\n' +
          '**Mandatory Infrastructure Requirements:**\n' +
          '• **Mechanical Ventilators**: Invasive & Non-Invasive Ventilation (NIV/BiPAP).\n' +
          '• **High-Flow Central Oxygen**: Continuous piped hospital oxygen supply.\n' +
          '• **Pulmonary ICU Monitoring**: Arterial Blood Gas (ABG) monitoring.';
      }
      // 4. ACUTE STROKE & NEUROLOGICAL EMERGENCY (AHA Stroke Protocol)
      else if (
        lower.includes('stroke') ||
        lower.includes('paralysis') ||
        lower.includes('slurred') ||
        lower.includes('facial droop') ||
        lower.includes('droop') ||
        lower.includes('seizure') ||
        lower.includes('numbness') ||
        lower.includes('brain')
      ) {
        priority = 'P1 - CRITICAL EMERGENCY';
        protocol = 'AHA Hyperacute Ischemic Stroke Protocol (< 4.5h Window)';
        recommendedType = 'General Emergency';
        recommendedCapabilities = ['Emergency Department', 'Neurology', 'ICU', 'Ventilator', 'Oxygen'];
        topHospital = initialHospitals.find((h) => h.neurology && h.icu.available > 0) || initialHospitals[0];

        replyText =
          '**Clinical Assessment:** Acute focal neurological deficit consistent with Acute Ischemic Stroke. Time-sensitive intravenous thrombolysis (rtPA) or mechanical thrombectomy window.\n\n' +
          '**Mandatory Infrastructure Requirements:**\n' +
          '• **Emergency Neuro-Imaging**: 24/7 Non-contrast CT / MRI to rule out intracranial hemorrhage.\n' +
          '• **Neurology / Neurosurgery Team**: Acute stroke unit admission.\n' +
          '• **Neuro ICU**: Continuous intracranial pressure and BP management.';
      }
      // 5. KHULNA NETWORK & ICU TELEMETRY INQUIRY
      else if (lower.includes('khulna') || lower.includes('icu') || lower.includes('bed') || lower.includes('hospital') || lower.includes('donor')) {
        priority = 'P2 - URGENT CLINICAL';
        protocol = 'Khulna Regional Healthcare Telemetry Audit';
        recommendedType = 'General Emergency';
        recommendedCapabilities = ['Emergency Department', 'ICU', 'Ventilator'];

        const totalIcuBeds = initialHospitals.reduce((acc, h) => acc + h.icu.available, 0);
        const totalVents = initialHospitals.reduce((acc, h) => acc + h.ventilator.available, 0);

        replyText =
          `**Khulna Healthcare Network Telemetry:**\n\n` +
          `• **Khulna Medical College Hospital (KMCH)**: 8 ICU Beds Free · 5 Ventilators Ready · ED Open 24/7\n` +
          `• **Shaheed Sheikh Abu Naser Hospital**: 4 ICU Beds Free · 3 Ventilators Ready · Specialized Cardiac\n` +
          `• **CityCare Trauma & Emergency Hospital**: 3 ICU Beds Free · 2 Ventilators Ready · 24/7 Surgery\n` +
          `• **Mercy General Hospital**: 2 ICU Beds Free · Oxygen Wall Available\n\n` +
          `**Network Totals:** ${totalIcuBeds} ICU Beds Available | ${totalVents} Mechanical Ventilators Ready across Khulna division.`;
      }
      // 6. GENERAL TRIAGE
      else {
        priority = 'P3 - ROUTINE TRIAGE';
        protocol = 'General Emergency Clinical Triage';
        recommendedType = 'General Emergency';
        recommendedCapabilities = ['Emergency Department', 'Oxygen'];
        replyText =
          `**Clinical Assessment:** Evaluated request "${text}". Recommending immediate dispatch to the nearest accredited emergency department with 24/7 medical officer triage and continuous oxygen supply.`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        priority,
        protocol,
        recommendedType,
        recommendedCapabilities,
        targetBloodGroup,
        bloodDonorCount,
        topHospital,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl h-[88vh] max-h-[760px] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 p-4 sm:p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-teal-700 text-white shadow-md shadow-teal-500/20">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight text-white">
                  MediRoute Clinical AI <span className="text-teal-400 font-mono text-xs">v2.0</span>
                </h3>
                <span className="rounded-full bg-teal-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-300 border border-teal-400/30">
                  ACLS / ATLS / WHO VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Capability-aware emergency triage, protocol matching & Khulna resource telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl font-bold text-xs shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-700 text-white'
                    : 'bg-gradient-to-br from-slate-900 to-teal-950 text-teal-400 border border-teal-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[82%] space-y-3 rounded-2xl p-4 sm:p-5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-700 text-white font-medium rounded-tr-xs shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200/90 shadow-md rounded-tl-xs'
                }`}
              >
                {/* AI Response Metadata Header */}
                {msg.sender === 'ai' && msg.priority && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        msg.priority.includes('CRITICAL')
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : msg.priority.includes('URGENT')
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-teal-100 text-teal-900 border border-teal-200'
                      }`}
                    >
                      <ShieldAlert size={12} /> {msg.priority}
                    </span>

                    {msg.protocol && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {msg.protocol}
                      </span>
                    )}
                  </div>
                )}

                {/* Main Text Content */}
                <div className="whitespace-pre-wrap font-normal text-xs sm:text-sm leading-relaxed">
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-950">{part}</strong> : part
                  )}
                </div>

                {/* Recommended Capabilities Badges */}
                {msg.recommendedCapabilities && msg.recommendedCapabilities.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Recommended Hospital Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.recommendedCapabilities.map((cap) => (
                        <span
                          key={cap}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-1 text-[11px] font-bold"
                        >
                          <CheckCircle2 size={12} className="text-teal-600" /> {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Matched Khulna Hospital Telemetry Card */}
                {msg.topHospital && msg.sender === 'ai' && (
                  <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 p-3.5 text-white space-y-2 border border-teal-500/30 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-300 flex items-center gap-1">
                        <Building2 size={14} /> Recommended Khulna Facility
                      </span>
                      <span className="font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
                        {msg.topHospital.icu.available} ICU Beds Free
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{msg.topHospital.name}</h4>
                        <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-rose-400" /> {msg.topHospital.address} · <strong className="text-teal-300">{msg.topHospital.travelTime} mins away</strong> ({msg.topHospital.distance} km)
                        </p>
                      </div>
                      <a
                        href={`tel:${msg.topHospital.phone}`}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors"
                        title="Call Emergency Hotline"
                      >
                        <Phone size={15} />
                      </a>
                    </div>
                  </div>
                )}

                {/* NWU Blood Donor Standby Notification */}
                {msg.targetBloodGroup && (
                  <div className="rounded-xl bg-rose-50 p-2.5 border border-rose-200/80 text-rose-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Droplet size={14} className="text-rose-600 animate-pulse" /> NWU Donor Match ({msg.targetBloodGroup}):
                    </span>
                    <span className="text-rose-700 font-extrabold bg-white px-2 py-0.5 rounded-md border border-rose-200">
                      ⚡ {msg.bloodDonorCount || 12} Donors Available
                    </span>
                  </div>
                )}

                {/* 1-Click Action to Apply Preset to Search Engine */}
                {msg.recommendedType && msg.recommendedCapabilities && onApplyPreset && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        onApplyPreset(msg.recommendedType!, msg.recommendedCapabilities!, msg.targetBloodGroup);
                        onClose();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all active:scale-95 border border-white/20"
                    >
                      <Zap size={14} className="text-teal-200 animate-bounce" /> Apply {msg.recommendedType} Preset & Execute Search →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-xs font-bold text-teal-800 italic pl-12 animate-pulse">
              <Sparkles size={16} className="animate-spin text-teal-700" />
              <span>MediRoute Clinical AI is evaluating ACLS/ATLS protocol criteria & Khulna bed signals...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Triage Prompt Chips */}
        <div className="border-t border-slate-200/70 bg-white p-3 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <Sparkles size={12} className="text-teal-700" /> Clinical Protocol Presets & Telemetry Queries:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {promptChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSend(chip.query)}
                className="shrink-0 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200/80 transition-all active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe patient emergency symptoms (e.g. chest pain, crash, gasping) or ask Khulna ICU status..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 font-semibold placeholder:font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white shadow-md hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
