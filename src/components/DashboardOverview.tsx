import { Patient, Room, DoctorSchedule } from "../types";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  UserRound, BedDouble, CalendarHeart, AlertCircle, TrendingUp, Users, HeartPulse, Building2
} from "lucide-react";
import { useState } from "react";

interface Props {
  patients: Patient[];
  rooms: Room[];
  doctors: DoctorSchedule[];
  setActiveTab: (tab: string) => void;
  setSelectedPatientForAI: (patient: Patient) => void;
}

export default function DashboardOverview({ patients, rooms, doctors, setActiveTab, setSelectedPatientForAI }: Props) {
  // Compute Stats
  const totalPatients = patients.length;
  
  // Calculate Bed occupancy
  let totalBeds = 0;
  let occupiedBeds = 0;
  rooms.forEach(room => {
    room.beds.forEach(bed => {
      totalBeds++;
      if (bed.status === "Terisi") occupiedBeds++;
    });
  });
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Active doctors
  const activeDoctors = doctors.filter(doc => doc.status === "Aktif" || doc.status === "Mulai Praktek").length;

  // Antrean Hari Ini
  const waitingPatients = patients.filter(p => p.status === "Antrean" || p.status === "Mulai Diperiksa").length;

  // Chart Data: Visits Trend
  const visitTrendData = [
    { name: "08:00", Umum: 5, BPJS: 12, Asuransi: 2 },
    { name: "10:00", Umum: 15, BPJS: 32, Asuransi: 8 },
    { name: "12:00", Umum: 22, BPJS: 45, Asuransi: 11 },
    { name: "14:00", Umum: 18, BPJS: 50, Asuransi: 15 },
    { name: "16:00", Umum: 12, BPJS: 25, Asuransi: 9 },
    { name: "18:00", Umum: 9, BPJS: 18, Asuransi: 4 },
  ];

  // Chart Data: Patients per Poli
  const poliCounts = patients.reduce((acc, patient) => {
    acc[patient.department] = (acc[patient.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poliChartData = Object.keys(poliCounts).map(dept => ({
    name: dept,
    Jumlah: poliCounts[dept]
  }));

  // Chart Data: Payment Type distribution
  const paymentCounts = patients.reduce((acc, p) => {
    acc[p.paymentType] = (acc[p.paymentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentColors = {
    BPJS: "#00a65a",      // AdminLTE green
    Umum: "#3c8dbc",      // AdminLTE light blue
    Asuransi: "#f39c12"   // AdminLTE orange
  };

  const paymentChartData = Object.keys(paymentCounts).map(type => ({
    name: type,
    value: paymentCounts[type],
    color: paymentColors[type as keyof typeof paymentColors]
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Registrations */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">Total Pasien Terdaftar</p>
              <h3 className="text-3xl font-sans font-bold text-gray-800 mt-1">{totalPatients}</h3>
            </div>
            <div className="p-3 rounded-lg bg-teal-50 text-teal-600 transition-all group-hover:scale-110">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-teal-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.4% peningkatan minggu ini</span>
          </div>
        </div>

        {/* KPI 2: Bed Occupancy */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">Keterisian Tempat Tidur (BOR)</p>
              <h3 className="text-3xl font-sans font-bold text-gray-800 mt-1">{bedOccupancyRate}%</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 transition-all group-hover:scale-110">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${bedOccupancyRate}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex justify-between">
              <span>{occupiedBeds} terisi</span>
              <span>{totalBeds} total bed</span>
            </p>
          </div>
        </div>

        {/* KPI 3: On-Duty Doctors */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">Dokter On-Duty</p>
              <h3 className="text-3xl font-sans font-bold text-gray-800 mt-1">{activeDoctors} <span className="text-sm text-gray-400 font-normal">/ {doctors.length}</span></h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 transition-all group-hover:scale-110">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            <span>Semua klinik poli beroperasi penuh</span>
          </div>
        </div>

        {/* KPI 4: Queue Status */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">Antrean Rawat Jalan</p>
              <h3 className="text-3xl font-sans font-bold text-gray-800 mt-1">{waitingPatients} Pasien</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 transition-all group-hover:scale-110">
              <CalendarHeart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-600 font-medium">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>Rata-rata tunggu antrean: 14 menit</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Visit Curve */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-semibold text-gray-700">Arus Kunjungan Pasien Hari Ini</h4>
              <p className="text-xs text-gray-400">Analisis traffic kunjungan pasien rawat jalan per jam</p>
            </div>
            <span className="text-[10px] font-mono bg-teal-50 border border-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase">
              Waktu Lokal Aktif
            </span>
          </div>
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBPJS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a65a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00a65a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUmum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3c8dbc" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3c8dbc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="BPJS" stroke="#00a65a" fillOpacity={1} fill="url(#colorBPJS)" strokeWidth={2} />
                <Area type="monotone" dataKey="Umum" stroke="#3c8dbc" fillOpacity={1} fill="url(#colorUmum)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial / Payment Type Distribution */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-sans font-semibold text-gray-700">Proporsi Jaminan Kesehatan</h4>
            <p className="text-xs text-gray-400">Distribusi penjamin biaya pelayanan pasien</p>
          </div>
          <div className="h-44 flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Pasien`, "Jumlah"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {paymentChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="text-gray-500 font-mono font-medium">
                  {item.value} Pasien ({Math.round(item.value / totalPatients * 100) || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Second Row: Department Stats & Live Queue Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clininc / Poli Stats */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm flex flex-col">
          <div>
            <h4 className="text-sm font-sans font-semibold text-gray-700">Volume Pasien per Poliklinik</h4>
            <p className="text-xs text-gray-400">Rincian beban kunjungan per poli rawat jalan</p>
          </div>
          <div className="h-60 mt-4 flex-1">
            {poliChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poliChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} width={85} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="Jumlah" fill="#3c8dbc" radius={[0, 4, 4, 0]}>
                    {poliChartData.map((_e, idx) => (
                      <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "#14b8a6" : "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Belum ada data pasien di poli.
              </div>
            )}
          </div>
        </div>

        {/* Live Patient Directory Actions */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-sans font-semibold text-gray-700">Tindakan Cepat & Pasien Aktif</h4>
              <p className="text-xs text-gray-400">Pasien yang baru terdaftar atau sedang diproses</p>
            </div>
            <button 
              onClick={() => setActiveTab("patients")}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium hover:underline"
            >
              Lihat Semua Pasien
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-mono uppercase bg-gray-50/50">
                  <th className="py-2.5 px-3">ID Pasien</th>
                  <th className="py-2.5 px-3">Nama</th>
                  <th className="py-2.5 px-3">Poliklinik</th>
                  <th className="py-2.5 px-3">Status SIMRS</th>
                  <th className="py-2.5 px-3 text-right">Aksi Pintar AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.slice(0, 5).map((p) => {
                  let statusBadgeColor = "";
                  switch (p.status) {
                    case "Antrean":
                      statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-100";
                      break;
                    case "Mulai Diperiksa":
                      statusBadgeColor = "text-blue-700 bg-blue-50 border-blue-100";
                      break;
                    case "Rawat Inap":
                      statusBadgeColor = "text-indigo-700 bg-indigo-50 border-indigo-100";
                      break;
                    default:
                      statusBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-gray-500">{p.id}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-gray-700">
                        {p.name} 
                        <span className="text-[10px] font-normal text-gray-400 ml-1.5">({p.age} th, {p.gender === "Laki-laki" ? "L" : "P"})</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        <span className="inline-flex items-center">
                          <Building2 className="w-3 h-3 text-gray-400 mr-1.5" />
                          {p.department}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusBadgeColor}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatientForAI(p);
                            setActiveTab("ai-assistant");
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-medium rounded-md shadow-sm text-[11px] transition-all transform active:scale-95 duration-100 inline-flex items-center space-x-1"
                        >
                          <span>Asisten AI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
