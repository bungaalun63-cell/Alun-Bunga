import React, { useState } from "react";
import { DoctorSchedule } from "../types";
import { 
  Building2, Calendar, Clock, Sparkles, User, AlertCircle, Play, Pause, ChevronRight, UserMinus, UserPlus, PhoneCall, Volume2, CheckSquare
} from "lucide-react";

interface Props {
  doctors: DoctorSchedule[];
  onUpdateDoctors: (updatedDocs: DoctorSchedule[]) => void;
}

export default function DokterPoli({ doctors, onUpdateDoctors }: Props) {
  const [activeCallMessage, setActiveCallMessage] = useState<string | null>(null);

  // Call queue ticket simulation
  const handleCallQueue = (docId: string) => {
    const doc = doctors.find(d => d.id === docId);
    if (!doc) return;

    if (doc.currentQueue <= 0) {
      alert(`Antrean di ${doc.department} (${doc.name}) sudah habis!`);
      return;
    }

    // Set voice announcement mock
    const deptPrefixes = {
      "Poli Dalam": "PD",
      "Poli Anak": "PA",
      "Poli Kandungan": "PK",
      "Poli Bedah": "PB",
      "Poli Gigi": "PG",
      "IGD": "IGD"
    };
    const prefix = deptPrefixes[doc.department as keyof typeof deptPrefixes] || "GEN";
    const currentTicket = `${prefix}-${100 - doc.currentQueue}`;

    setActiveCallMessage(`Memanggil nomor antrean ${currentTicket} menuju ${doc.roomNo} (${doc.name})...`);
    
    // Decrement current queue
    const updatedDocs = doctors.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          currentQueue: d.currentQueue - 1
        };
      }
      return d;
    });

    onUpdateDoctors(updatedDocs);

    // Clear announcement after 5 seconds
    setTimeout(() => {
      setActiveCallMessage(null);
    }, 5000);
  };

  const handleAddQueue = (docId: string) => {
    const updatedDocs = doctors.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          currentQueue: d.currentQueue + 1
        };
      }
      return d;
    });
    onUpdateDoctors(updatedDocs);
  };

  const handleToggleStatus = (docId: string, currentStatus: DoctorSchedule["status"]) => {
    const nextStatusMap: Record<DoctorSchedule["status"], DoctorSchedule["status"]> = {
      "Aktif": "Mulai Praktek",
      "Mulai Praktek": "On Call",
      "On Call": "Cuti",
      "Cuti": "Aktif"
    };

    const nextStatus = nextStatusMap[currentStatus] || "Aktif";

    const updatedDocs = doctors.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: nextStatus
        };
      }
      return d;
    });

    onUpdateDoctors(updatedDocs);
  };

  return (
    <div className="space-y-6">
      
      {/* Active speaker announcement banner (AdminLTE style alert) */}
      {activeCallMessage && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl p-4 shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3 text-xs md:text-sm font-sans font-bold">
            <Volume2 className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span>PENGUMUMAN SUARA: &ldquo;{activeCallMessage}&rdquo;</span>
          </div>
          <button 
            onClick={() => setActiveCallMessage(null)}
            className="text-white hover:text-gray-100 font-bold px-2 text-xs uppercase"
          >
            Mute
          </button>
        </div>
      )}

      {/* Grid of Doctor profiles and clinic management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => {
          let statusBadgeColor = "";
          let statusIcon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
          
          switch (doc.status) {
            case "Aktif":
              statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
              statusIcon = <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
              break;
            case "Mulai Praktek":
              statusBadgeColor = "bg-teal-50 text-teal-700 border-teal-100";
              statusIcon = <Play className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />;
              break;
            case "On Call":
              statusBadgeColor = "bg-sky-50 text-sky-700 border-sky-100";
              statusIcon = <PhoneCall className="w-3.5 h-3.5 text-sky-500" />;
              break;
            default: // Cuti
              statusBadgeColor = "bg-gray-100 text-gray-500 border-gray-200";
              statusIcon = <Pause className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />;
          }

          return (
            <div key={doc.id} className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between leading-relaxed">
              
              {/* Doctor Header card */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  {/* Avatar Circle */}
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-gray-800">{doc.name}</h4>
                      <p className="text-[10px] text-teal-600 font-semibold">{doc.specialty}</p>
                    </div>
                  </div>

                  {/* Status click action */}
                  <button
                    onClick={() => handleToggleStatus(doc.id, doc.status)}
                    className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full transition-all hover:brightness-95 flex items-center space-x-1 uppercase cursor-pointer ${statusBadgeColor}`}
                    title="Klik untuk mengubah status praktek"
                  >
                    {statusIcon}
                    <span>{doc.status}</span>
                  </button>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] text-gray-600 border-t border-dashed border-gray-100 pt-3.5">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold">{doc.roomNo}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 justify-end">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold font-mono">{doc.scheduleHours}</span>
                  </div>
                </div>
              </div>

              {/* Queue actions */}
              <div className="p-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block font-bold uppercase">Sisa Antrean</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold font-sans text-gray-800">{doc.currentQueue}</span>
                    <span className="text-[10px] text-gray-400">Pasien</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Simulate outpatient decrementing */}
                  <button
                    onClick={() => handleCallQueue(doc.id)}
                    disabled={doc.currentQueue <= 0 || doc.status === "Cuti"}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Panggil pasien antrean berikutnya"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Panggil</span>
                  </button>

                  {/* Simulate walking-in ticket */}
                  <button
                    onClick={() => handleAddQueue(doc.id)}
                    className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm transition-colors"
                    title="Daftarkan antrean offline manual"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
