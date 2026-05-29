import React, { useState } from "react";
import { Room, Bed, Patient, BedStatus } from "../types";
import { 
  BedDouble, Home, Sparkles, AlertTriangle, ShieldCheck, CheckSquare, PlusSquare, ArrowUpRight, LogOut, Brush, CheckCircle, RefreshCcw, Building2
} from "lucide-react";

interface Props {
  rooms: Room[];
  patients: Patient[];
  onUpdateRooms: (updatedRooms: Room[]) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

export default function RawatInap({ rooms, patients, onUpdateRooms, onUpdatePatient }: Props) {
  const [selectedRoomClass, setSelectedRoomClass] = useState<string>("Semua");
  const [showCheckInModal, setShowCheckInModal] = useState<string | null>(null); // bedId as token
  const [checkInPatientId, setCheckInPatientId] = useState<string>("");

  const classes = ["Semua", "VIP", "Kelas I", "Kelas II", "Kelas III", "ICU"];

  // Filter Rooms
  const filteredRooms = rooms.filter(r => {
    return selectedRoomClass === "Semua" ? true : r.roomClass === selectedRoomClass;
  });

  // Outpatient list eligible for check-in (not currently admitted to ward)
  const eligiblePatients = patients.filter(p => p.status !== "Rawat Inap");

  // Count availability
  let totBeds = 0;
  let occBeds = 0;
  let cleanBeds = 0;
  let maintBeds = 0;

  rooms.forEach(r => {
    r.beds.forEach(b => {
      totBeds++;
      if (b.status === "Terisi") occBeds++;
      if (b.status === "Pembersihan") cleanBeds++;
      if (b.status === "Pemeliharaan") maintBeds++;
    });
  });

  // Handle Check-in simulation
  const triggerCheckIn = (bedId: string) => {
    setShowCheckInModal(bedId);
    if (eligiblePatients.length > 0) {
      setCheckInPatientId(eligiblePatients[0].id);
    } else {
      setCheckInPatientId("");
    }
  };

  const handleExecuteCheckIn = () => {
    if (!checkInPatientId || !showCheckInModal) return;
    
    const targetPatient = patients.find(p => p.id === checkInPatientId);
    if (!targetPatient) return;

    // 1. Update Bed state inside rooms
    const updatedRooms = rooms.map(room => {
      const bedIndex = room.beds.findIndex(b => b.id === showCheckInModal);
      if (bedIndex !== -1) {
        const bedsCopy = [...room.beds];
        bedsCopy[bedIndex] = {
          ...bedsCopy[bedIndex],
          status: "Terisi" as const,
          patientId: targetPatient.id,
          patientName: targetPatient.name
        };
        return { ...room, beds: bedsCopy };
      }
      return room;
    });

    onUpdateRooms(updatedRooms);

    // 2. Update patient state to "Rawat Inap"
    onUpdatePatient({
      ...targetPatient,
      status: "Rawat Inap"
    });

    setShowCheckInModal(null);
  };

  // Discharge patient -> Mark bed for Cleaning
  const handleDischarge = (bedId: string, currentPatientId?: string) => {
    if (!confirm("Apakah Anda yakin ingin memproses pemulangan (Discharge) pasien ini? Bed akan dialihkan ke status Pembersihan.")) {
      return;
    }

    // 1. Update bed state inside rooms
    const updatedRooms = rooms.map(room => {
      const bedIndex = room.beds.findIndex(b => b.id === bedId);
      if (bedIndex !== -1) {
        const bedsCopy = [...room.beds];
        bedsCopy[bedIndex] = {
          id: bedId,
          name: bedsCopy[bedIndex].name,
          status: "Pembersihan" as const
          // Clear occupant info
        };
        return { ...room, beds: bedsCopy };
      }
      return room;
    });

    onUpdateRooms(updatedRooms);

    // 2. Update Patient status to "Selesai Tindakan"
    if (currentPatientId) {
      const pIndex = patients.findIndex(p => p.id === currentPatientId);
      if (pIndex !== -1) {
        onUpdatePatient({
          ...patients[pIndex],
          status: "Selesai Tindakan"
        });
      }
    }
  };

  // Sterilization Complete -> Mark bed as available
  const handleCompleteCleaning = (bedId: string) => {
    const updatedRooms = rooms.map(room => {
      const bedIndex = room.beds.findIndex(b => b.id === bedId);
      if (bedIndex !== -1) {
        const bedsCopy = [...room.beds];
        bedsCopy[bedIndex] = {
          ...bedsCopy[bedIndex],
          status: "Tersedia" as const
        };
        return { ...room, beds: bedsCopy };
      }
      return room;
    });

    onUpdateRooms(updatedRooms);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI stats bar & Filter bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Bed Stats Visuals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 block">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-mono font-medium">BED TERSEDIA</span>
              <span className="text-lg font-bold text-gray-700">{totBeds - occBeds - cleanBeds - maintBeds}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600 block">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-mono font-medium">BED TERISI</span>
              <span className="text-lg font-bold text-gray-700">{occBeds}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 block">
              <Brush className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-mono font-medium">STERILISASI</span>
              <span className="text-lg font-bold text-gray-700">{cleanBeds}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-xl p-3 shadow-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-gray-50 text-gray-500 block">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-mono font-medium">MAINTENANCE</span>
              <span className="text-lg font-bold text-gray-700">{maintBeds}</span>
            </div>
          </div>
        </div>

        {/* Room Class Filters */}
        <div className="bg-white px-3 py-2 border border-gray-200/80 rounded-xl shadow-sm flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400 font-mono uppercase pl-1">KELAS:</span>
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {classes.map(cl => (
              <button
                key={cl}
                onClick={() => setSelectedRoomClass(cl)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedRoomClass === cl 
                    ? "bg-teal-600 text-white" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cl}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid of Wards/Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          let classLabelColor = "";
          switch (room.roomClass) {
            case "VIP":
              classLabelColor = "bg-purple-100 text-purple-800 border-purple-200"; break;
            case "ICU":
              classLabelColor = "bg-rose-100 text-rose-800 border-rose-200"; break;
            case "Kelas I":
              classLabelColor = "bg-blue-100 text-blue-800 border-blue-200"; break;
            case "Kelas II":
              classLabelColor = "bg-teal-100 text-teal-800 border-teal-200"; break;
            default:
              classLabelColor = "bg-gray-100 text-gray-800 border-gray-200";
          }

          // Occupied calculation for individual room
          const occupiedCount = room.beds.filter(b => b.status === "Terisi").length;

          return (
            <div key={room.id} className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between leading-relaxed">
              
              {/* Room Info Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-sans font-extrabold text-gray-800 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>{room.roomName}</span>
                  </h4>
                  <p className="text-[10px] font-mono font-semibold text-gray-400 mt-0.5">TARIF: Rp {room.dailyTariff.toLocaleString('id-ID')}/Hari</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-0.5 border text-[9px] font-extrabold rounded-full ${classLabelColor}`}>
                    {room.roomClass}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    Kamar {occupiedCount}/{room.beds.length} Terisi
                  </span>
                </div>
              </div>

              {/* Bed List Grid */}
              <div className="p-4 bg-gray-50/50 space-y-3.5 flex-1">
                {room.beds.map((bed) => {
                  let statusBg = "";
                  let statusTxtColor = "";
                  switch(bed.status) {
                    case "Terisi":
                      statusBg = "bg-red-50 border-red-200"; 
                      statusTxtColor = "text-red-700";
                      break;
                    case "Pembersihan":
                      statusBg = "bg-amber-50 border-amber-200"; 
                      statusTxtColor = "text-amber-700";
                      break;
                    case "Pemeliharaan":
                      statusBg = "bg-gray-100 border-gray-200"; 
                      statusTxtColor = "text-gray-500";
                      break;
                    default:
                      statusBg = "bg-emerald-50 border-emerald-200"; 
                      statusTxtColor = "text-emerald-700";
                  }

                  return (
                    <div 
                      key={bed.id} 
                      className={`p-3.5 border rounded-lg transition-all flex flex-col justify-between space-y-2 ${statusBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BedDouble className={`w-4 h-4 ${statusTxtColor}`} />
                          <span className={`text-xs font-extrabold ${statusTxtColor}`}>{bed.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider uppercase opacity-80">{bed.status}</span>
                      </div>

                      {/* Room Bed Occupant information */}
                      {bed.status === "Terisi" ? (
                        <div className="text-xs">
                          <div className="font-semibold text-gray-700">{bed.patientName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">No. RM: {bed.patientId}</div>
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => handleDischarge(bed.id, bed.patientId)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3" />
                              <span>Discharge / Pulang</span>
                            </button>
                          </div>
                        </div>
                      ) : bed.status === "Pembersihan" ? (
                        <div className="text-xs">
                          <p className="text-gray-500 text-[11px] italic">Sedang disterilisasi oleh petugas kebersihan.</p>
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => handleCompleteCleaning(bed.id)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3" />
                              <span>Selesai Steril</span>
                            </button>
                          </div>
                        </div>
                      ) : bed.status === "Pemeliharaan" ? (
                        <p className="text-gray-400 text-[10px] italic">Kerusakan teknis / pemeliharaan berkala.</p>
                      ) : (
                        <div className="text-xs">
                          <p className="text-emerald-600 text-[10px] font-medium">Siap menampung pasien baru.</p>
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => triggerCheckIn(bed.id)}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <PlusSquare className="w-3" />
                              <span>Check-In Pasien</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: Check-in select box */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden dark:text-gray-800 leading-relaxed">
            
            <div className="px-5 py-4 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-sans font-bold flex items-center space-x-1.5">
                <PlusSquare className="w-5 h-5" />
                <span>Check-in Pasien Rawat Inap</span>
              </h3>
              <button 
                onClick={() => setShowCheckInModal(null)}
                className="p-1 rounded-md hover:bg-teal-700 text-teal-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">Pilih pasien rawat jalan aktif yang membutuhkan rujukan rawat inap untuk dialokasikan pada bed ini.</p>
              
              {eligiblePatients.length > 0 ? (
                <div>
                  <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Daftar Pasien Eligible</label>
                  <select
                    value={checkInPatientId}
                    onChange={(e) => setCheckInPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {eligiblePatients.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.id}] {p.name} - {p.department} ({p.diagnosis || "Keluhan Awal"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs">
                  <p className="font-semibold">Tidak ada pasien eligible</p>
                  <p className="mt-1 text-gray-600">Semua pasien saat ini sudah berada di rawat inap atau belum terdaftar. Silakan registrasikan pasien baru terlebih dahulu di menu Pendaftaran Pasien.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowCheckInModal(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteCheckIn}
                  disabled={eligiblePatients.length === 0}
                  className="px-4 py-2 bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Proses Check-In
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// X icon definition for closure inside this component, avoiding duplicate declarations of X
function X({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
