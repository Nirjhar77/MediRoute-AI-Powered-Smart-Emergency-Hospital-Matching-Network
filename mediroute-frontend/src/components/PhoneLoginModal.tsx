import { useState, useMemo, useEffect } from 'react';
import { Smartphone, QrCode, Copy, Check, Wifi, ExternalLink, X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './UI';
import { fetchServerNetworkInfo } from '../services/api';

export function PhoneLoginModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.hostname;
    }
    return '10.204.113.9';
  });

  useEffect(() => {
    fetchServerNetworkInfo().then((info) => {
      if (info?.lan_ip && info.lan_ip !== '127.0.0.1') {
        setIpAddress(info.lan_ip);
      }
    });
  }, []);

  const phoneUrl = useMemo(() => {
    const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '5173';
    return `http://${ipAddress}:${port}/login`;
  }, [ipAddress]);

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          title="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <Smartphone size={22} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Log in from your Phone</h3>
            <p className="text-xs text-slate-500">Scan QR code or use the local Wi-Fi link</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 border border-slate-200/80">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200/60">
            <QRCodeSVG
              value={phoneUrl}
              size={190}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <QrCode size={15} className="text-teal-600" /> Point your phone camera at this QR code
          </p>
        </div>

        {/* Direct Phone Link Box */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Mobile URL</label>
            <span className="text-[11px] text-slate-500">PC IP: <span className="font-mono text-teal-700 font-semibold">{ipAddress}</span></span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
            <input
              type="text"
              readOnly
              value={phoneUrl}
              className="flex-1 bg-transparent text-xs font-mono text-slate-800 outline-none selection:bg-teal-200"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 text-white hover:bg-teal-800 active:scale-95'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <a
              href={phoneUrl}
              target="_blank"
              rel="noreferrer"
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Wi-Fi Instruction */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs text-teal-900">
          <Wifi size={17} className="mt-0.5 shrink-0 text-teal-700" />
          <div>
            <b className="font-semibold text-teal-950">Same Wi-Fi network:</b>
            <span className="text-teal-800"> Make sure your mobile phone is connected to the same Wi-Fi router or hotspot as this computer (Host IP: <code className="font-mono bg-teal-100/80 px-1 py-0.5 rounded text-[11px] font-bold text-teal-900">{ipAddress}</code>).</span>
          </div>
        </div>

        <Button className="mt-5 w-full justify-center" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
