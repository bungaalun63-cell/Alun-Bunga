import React, { useState } from "react";
import { Patient } from "../types";
import { 
  Plus, Search, User, Phone, MapPin, FileText, ClipboardList, Stethoscope, Building, HelpCircle, X, ChevronRight, UserPlus
} from "lucide-react";

interface Props {
  patients: Patient[];
  onAddPatient: (newPatient: Patient) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  setActiveTab: (tab: string) => void;
  setSelectedPatientForAI: (patient: Patient) => void;
  setAiQueryForICD10: (query: string) => void;
}

export default function PasienManager({ 
  patients, onAddPatient, onUpdatePatient, setActiveTab, setSelectedPatientForAI, setAiQueryForICD10 
}: Props) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [paymentFilter, setPaymentFilter] = useState("Semua");

  // Selection / Detail Modal State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form Open State
  const [showAddForm, setShowAddForm] = useState(false);

  // New Patient Form State
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [formPhone, setFormPhone] = useState("");
  const [formIdentity, setFormIdentity] = useState("");
  const [formPayment, setFormPayment] = useState<"BPJS" | "Umum" | "Asuransi">("BPJS");
  const [formAddress, setFormAddress] = useState("");
  const [formDept, setFormDept] = useState<Patient["department"]>("Poli Dalam");
  const [formDoctor, setFormDoctor] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDiagnosis, setFormDiagnosis] = useState("");

  const departments: Patient["department"][] = ["Poli Dalam", "Poli Anak", "Poli Kandungan", "Poli Bedah", "Poli Gigi", "IGD"];

  // Handle New Patient Registration
  const handleSubmitNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAge || !formPhone || !formIdentity) {
      alert("Harap lengkapi semua field utama!");
      return;
    }

    // Auto queue numbering based on department initials
    const deptPrefixes = {
      "Poli Dalam": "PD",
      "Poli Anak": "PA",
      "Poli Kandungan": "PK",
      "Poli Bedah": "PB",
      "Poli Gigi": "PG",
      "IGD": "IGD"
    };

    const prefix = deptPrefixes[formDept] || "GEN";
    const deptCount = patients.filter(p => p.department === formDept).length + 1;
    const padding = deptCount < 10 ? "00" : deptCount < 100 ? "0" : "";
    const queueNumber = `${prefix}-${padding}${deptCount}`;

    // Auto Doctor matching
    const doctorMatches = {
      "Poli Dalam": "dr. Sarah Wijaya, Sp.PD",
      "Poli Anak": "dr. Ahmad Fauzi, Sp.A",
      "Poli Kandungan": "dr. Budi Santoso, Sp.OG",
      "Poli Bedah": "dr. Linda Kartika, Sp.B",
      "Poli Gigi": "drg. Diana Putri, Sp.KGA",
      "IGD": "dr. Sarah Wijaya, Sp.PD"
    };

    const assignedDoctor = formDoctor || doctorMatches[formDept] || "Dokter Umum";

    const newPatient: Patient = {
      id: `P-${1000 + patients.length + 1}`,
      name: formName,
      age: parseInt(formAge, 10),
      gender: formGender,
      phone: formPhone,
      identityNumber: formIdentity,
      paymentType: formPayment,
      address: formAddress,
      admissionDate: new Date().toISOString().split('T')[0],
      department: formDept,
      status: "Antrean",
      queueNumber,
      doctorName: assignedDoctor,
      clinicalNotes: formNotes || "Keluhan awal pasien didata saat pendaftaran.",
      diagnosis: formDiagnosis || "Observasi Rawat Jalan"
    };

    onAddPatient(newPatient);

    // Reset Form states
    setFormName("");
    setFormAge("");
    setFormGender("Laki-laki");
    setFormPhone("");
    setFormIdentity("");
    setFormPayment("BPJS");
    setFormAddress("");
    setFormNotes("");
    setFormDiagnosis("");
    setShowAddForm(false);
  };

  // Filter Logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.identityNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "Semua" ? true : p.department === deptFilter;
    const matchesStatus = statusFilter === "Semua" ? true : p.status === statusFilter;
    const matchesPayment = paymentFilter === "Semua" ? true : p.paymentType === paymentFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesPayment;
  });

  // Action Helpers to navigate to AI
  const handleTriggerAISummarize = (patient: Patient) => {
    setSelectedPatientForAI(patient);
    setActiveTab("ai-assistant");
  };

  const handleTriggerAIJargon = (patient: Patient) => {
    setSelectedPatientForAI(patient);
    // Inside AI assistant, we'll auto-fill the diagnosis or clinicalnotes
    setActiveTab("ai-assistant");
  };

  const handleTriggerAIICD10 = (patient: Patient) => {
    if (patient.diagnosis) {
      setAiQueryForICD10(patient.diagnosis);
    } else if (patient.clinicalNotes) {
      setAiQueryForICD10(patient.clinicalNotes || "");
    }
    setActiveTab("ai-assistant");
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Toolbars */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-200/80 rounded-xl shadow-sm">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari Pasien berdasarkan Nama, ID, atau Kartu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-gray-400"
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="Semua">Semua Poli</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="Semua">Semua Penjamin</option>
            <option value="BPJS">BPJS Kesehatan</option>
            <option value="Umum">Umum (Tunai)</option>
            <option value="Asuransi">Asuransi Swasta</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Antrean">Antrean</option>
            <option value="Mulai Diperiksa">Mulai Diperiksa</option>
            <option value="Rawat Inap">Rawat Inap</option>
            <option value="Selesai Tindakan">Selesai Tindakan</option>
          </select>

          {/* Direct Add Patient Trigger */}
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Daftar Pasien Baru</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Data Table and details side pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Table (Spans 2 cols in desktop) */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-sans font-semibold text-gray-700">Daftar Rekam Medis Pasien Active</h4>
            <span className="text-[10px] font-mono text-gray-400">{filteredPatients.length} Data cocok</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-mono uppercase bg-gray-50/50">
                  <th className="py-3 px-4">Kartu / No RM</th>
                  <th className="py-3 px-4">Nama Pasien</th>
                  <th className="py-3 px-4">Poli / Klinik</th>
                  <th className="py-3 px-4">Penjamin</th>
                  <th className="py-3 px-4">Tgl Registrasi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => {
                  let badge = "";
                  switch (p.status) {
                    case "Antrean":
                      badge = "text-amber-700 bg-amber-50 border-amber-100"; break;
                    case "Mulai Diperiksa":
                      badge = "text-blue-700 bg-blue-50 border-blue-100"; break;
                    case "Rawat Inap":
                      badge = "text-indigo-700 bg-indigo-50 border-indigo-100"; break;
                    default:
                      badge = "text-emerald-700 bg-emerald-50 border-emerald-100";
                  }

                  let guaranteeBadge = "";
                  switch (p.paymentType) {
                    case "BPJS":
                      guaranteeBadge = "bg-green-100/75 text-green-800"; break;
                    case "Umum":
                      guaranteeBadge = "bg-sky-100/75 text-sky-800"; break;
                    default:
                      guaranteeBadge = "bg-amber-100/75 text-amber-800";
                  }

                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPatient(p)}
                      className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${selectedPatient?.id === p.id ? 'bg-teal-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-gray-600">{p.id}</div>
                        <div className="text-[10px] text-gray-400">{p.queueNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-semibold text-gray-800 hover:text-teal-600 transition-colors">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.age} Tahun, {p.gender}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-600">{p.department}</div>
                        <div className="text-[10px] text-gray-400">{p.doctorName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${guaranteeBadge}`}>
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono">{p.admissionDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${badge}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-sans">
                      <div className="max-w-xs mx-auto">
                        <p className="font-semibold text-sm">Tidak ada pasien ditemukan</p>
                        <p className="text-xs text-gray-400 mt-1">Gunakan kata kunci pencarian berbeda atau matikan filter aktif.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Clinical details / AI Bridge */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          {selectedPatient ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Header profile */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-lg text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-bold text-gray-800">{selectedPatient.name}</h4>
                      <p className="text-[10px] font-mono text-teal-600">{selectedPatient.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Patient Profile Grid */}
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2 font-sans">
                    <div>
                      <span className="text-gray-400 block text-[10px]">UMUR / GENDER</span>
                      <span className="text-gray-700 font-semibold">{selectedPatient.age} Th, {selectedPatient.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">TGL MASUK</span>
                      <span className="text-gray-700 font-semibold font-mono">{selectedPatient.admissionDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">NIK / JAMINAN</span>
                      <span className="text-gray-700 font-semibold">{selectedPatient.identityNumber} ({selectedPatient.paymentType})</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">NO TELEPON</span>
                      <span className="text-gray-700 font-semibold">{selectedPatient.phone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] mb-0.5">DETAIL ALAMAT</span>
                    <span className="text-gray-700 font-medium block"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />{selectedPatient.address}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3.5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">DOKTER & KLIINIK PENANGGUNG JAWAB</span>
                    <span className="text-gray-800 font-bold block">{selectedPatient.doctorName}</span>
                    <span className="text-teal-600 text-[10px] font-semibold">{selectedPatient.department} / Antrean {selectedPatient.queueNumber}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">Diagnosis Utama (Klinis)</span>
                    <span className="text-indigo-950 font-semibold text-xs font-mono block mb-2">{selectedPatient.diagnosis || "-"}</span>
                    
                    <span className="text-gray-400 block text-[10px] mb-1 uppercase tracking-wider">Catatan Klinis Dokter</span>
                    <p className="text-gray-600 font-sans text-xs max-h-36 overflow-y-auto leading-relaxed">{selectedPatient.clinicalNotes || "Tidak ada catatan."}</p>
                  </div>
                </div>
              </div>

              {/* Smart AI Actions panel */}
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                <div className="text-[10px] font-mono text-indigo-700 font-bold tracking-wider uppercase mb-2">Diagnostik Pintar Asisten AI</div>
                
                <button
                  onClick={() => handleTriggerAISummarize(selectedPatient)}
                  className="w-full py-2 px-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Ringkas Catatan Medis</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleTriggerAIJargon(selectedPatient)}
                  className="w-full py-2 px-3 bg-teal-50 border border-teal-100 hover:bg-teal-100 rounded-lg text-teal-700 font-semibold text-xs transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Jelaskan Diagnosa (Bahasa Awam)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleTriggerAIICD10(selectedPatient)}
                  className="w-full py-2 px-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-emerald-700 font-semibold text-xs transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>Cari Rekomendasi Kode ICD-10</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 font-sans flex flex-col items-center justify-center h-full space-y-3">
              <ClipboardList className="w-12 h-12 text-gray-200" />
              <div>
                <p className="font-semibold text-sm">Pilih Pasien dari Daftar</p>
                <p className="text-xs text-gray-400 mt-1">Untuk melihat rekam medis, rincian biaya, serta menghubungkannya ke instrumen Asisten AI Medis SIMRS.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Add Patient Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-xl overflow-hidden leading-relaxed">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-sans font-bold flex items-center space-x-1.5">
                <UserPlus className="w-5 h-5" />
                <span>Pendaftaran & Admisi Pasien Baru (SIMRS)</span>
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-md hover:bg-teal-700 text-teal-100 transition-colors"
                id="close-add-form-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNewPatient} className="p-5 space-y-4">
              
              {/* Profile sub-grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Nama Pasien Sesuai KTP *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rendi Pratama"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Umur (Tahun) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 32"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Gender *</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">No. Rekening / BPJS / NIK *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai kartu jaminan kesehatan"
                    value={formIdentity}
                    onChange={(e) => setFormIdentity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Metode Penjamin *</label>
                  <select
                    value={formPayment}
                    onChange={(e) => setFormPayment(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="BPJS">BPJS Kesehatan</option>
                    <option value="Umum">Umum (Tunai)</option>
                    <option value="Asuransi">Asuransi Swasta</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">No. HP / Telepon *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812345678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Alokasi Poliklinik *</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">Alamat Tinggal Lengkap</label>
                <textarea
                  placeholder="Masukkan kelurahan, kecamatan, kota..."
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="text-[10px] font-mono text-indigo-600 font-bold block mb-1">Diagnosis Awal / Gejala Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: Fever Susp Typhoid, Dyspnea Kronis, Akut Appendiks"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-indigo-600 font-bold block mb-1">Catatan Tambahan & Riwayat Keluhan</label>
                <textarea
                  placeholder="Ketik keluhan awal, riwayat alergi, tindakan darurat jika ada..."
                  rows={2.5}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Daftarkan Pasien
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
