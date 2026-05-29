import React, { useState, useEffect } from "react";
import { Patient, Room, DoctorSchedule } from "./types";
import { initialPatients, initialRooms, initialDoctors } from "./data";
import DashboardOverview from "./components/DashboardOverview";
import PasienManager from "./components/PasienManager";
import RawatInap from "./components/RawatInap";
import DokterPoli from "./components/DokterPoli";
import BillingSimulator from "./components/BillingSimulator";
import AsistenAI from "./components/AsistenAI";

// Icons
import { 
  Menu, X, Building2, Users, BedDouble, Calendar, CreditCard, Sparkles, Clock, LogOut, CheckCircle, HeartPulse, UserCheck, ShieldCheck,
  Bell, ChevronDown, User, Settings, Shield, Trash2, Check, Info, Lock, Key, ListFilter, AlertTriangle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // States for enhanced Topbar & Dropdowns
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("2026-05-29 10:57:16 UTC");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(now.getUTCDate()).padStart(2, '0');
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const min = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Custom Notifications List State
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Pendaftaran Pasien IGD",
      desc: "Ny. Siti Rahma telah sukses terdaftar di Poli Spesialis Anak.",
      time: "2 menit lalu",
      read: false,
      type: "Pendaftaran"
    },
    {
      id: "notif-2",
      title: "Saran Kode ICD-10 Selesai",
      desc: "Rekomendasi kode medis untuk Tn. Budi Utomo berhasil diulas oleh Asisten AI.",
      time: "10 menit lalu",
      read: false,
      type: "AI Medis"
    },
    {
      id: "notif-3",
      title: "Kamar Rawat Inap Steril",
      desc: "Ruang Dahlia Bed A teridentifikasi siap huni kembali setelah dibersihkan.",
      time: "25 menit lalu",
      read: true,
      type: "Sistem"
    },
    {
      id: "notif-4",
      title: "Tagihan Berhasil Dibayar",
      desc: "Kuitansi SIMRS-INV-20261159 senilai Rp 850.000 telah diselesaikan penuh via BPJS.",
      time: "1 jam lalu",
      read: true,
      type: "Keuangan"
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const activeNotifCount = notifications.filter(n => !n.read).length;

  // SIMRS Core Shared States with persistent local storage load
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("simrs_patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem("simrs_rooms");
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [doctors, setDoctors] = useState<DoctorSchedule[]>(() => {
    const saved = localStorage.getItem("simrs_doctors");
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  // Cross-component AI contextual states
  const [selectedPatientForAI, setSelectedPatientForAI] = useState<Patient | null>(null);
  const [aiQueryForICD10, setAiQueryForICD10] = useState<string>("");

  // Synchronizers to local storage
  useEffect(() => {
    localStorage.setItem("simrs_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("simrs_rooms", JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem("simrs_doctors", JSON.stringify(doctors));
  }, [doctors]);

  // Action state handlers
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    
    // Automatically keep the AI session selection in sync if currently loaded
    if (selectedPatientForAI?.id === updatedPatient.id) {
      setSelectedPatientForAI(updatedPatient);
    }
  };

  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
  };

  const handleUpdateDoctors = (updatedDocs: DoctorSchedule[]) => {
    setDoctors(updatedDocs);
  };

  // Safe navigation switch
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview 
            patients={patients} 
            rooms={rooms} 
            doctors={doctors}
            setActiveTab={setActiveTab}
            setSelectedPatientForAI={(p) => {
              setSelectedPatientForAI(p);
              setActiveTab("ai-assistant");
            }}
          />
        );
      case "patients":
        return (
          <PasienManager 
            patients={patients}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            setActiveTab={setActiveTab}
            setSelectedPatientForAI={setSelectedPatientForAI}
            setAiQueryForICD10={(q) => {
              setAiQueryForICD10(q);
              setActiveTab("ai-assistant");
            }}
          />
        );
      case "ward":
        return (
          <RawatInap 
            rooms={rooms} 
            patients={patients} 
            onUpdateRooms={handleUpdateRooms}
            onUpdatePatient={handleUpdatePatient}
          />
        );
      case "doctors":
        return (
          <DokterPoli 
            doctors={doctors} 
            onUpdateDoctors={handleUpdateDoctors}
          />
        );
      case "billing":
        return (
          <BillingSimulator 
            patients={patients} 
            rooms={rooms}
          />
        );
      case "ai-assistant":
        return (
          <AsistenAI 
            patients={patients}
            selectedPatient={selectedPatientForAI}
            setSelectedPatient={setSelectedPatientForAI}
            aiQueryForICD10={aiQueryForICD10}
            setAiQueryForICD10={setAiQueryForICD10}
          />
        );
      default:
        return <div>Tab tidak ditemukan.</div>;
    }
  };

  const tabsInfo = [
    { id: "dashboard", label: "Dashboard Utama", icon: <Building2 className="w-4 h-4" /> },
    { id: "patients", label: "Pendaftaran & EMR", icon: <Users className="w-4 h-4" /> },
    { id: "ward", label: "Rawat Inap (Bed)", icon: <BedDouble className="w-4 h-4" /> },
    { id: "doctors", label: "Jadwal Dokter", icon: <Calendar className="w-4 h-4" /> },
    { id: "billing", label: "Kasir & Billing", icon: <CreditCard className="w-4 h-4" /> },
    { id: "ai-assistant", label: "Asisten AI Medis", icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-gray-800 antialiased font-sans" id="simrs-app-root">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 z-35 lg:hidden transition-opacity duration-300 pointer-events-auto"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <aside 
        className={`bg-slate-900 text-slate-300 fixed lg:sticky lg:top-0 lg:h-screen bottom-0 left-0 z-40 transition-all duration-300 border-slate-800 flex flex-col justify-between border-r ${
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : "w-64 lg:w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="w-full flex-shrink-0 h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none">
          <div>
            {/* Logo Brand area */}
            <div className={`h-16 flex items-center justify-between border-b border-slate-800 bg-slate-950/60 leading-none transition-all ${
              sidebarOpen ? "px-5" : "px-5 lg:px-0 lg:justify-center"
            }`}>
              <div className={`flex items-center ${sidebarOpen ? "space-x-2.5" : "space-x-2.5 lg:space-x-0"}`}>
                <div className="p-1.5 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-lg text-white flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className={`${sidebarOpen ? "block" : "block lg:hidden"}`}>
                  <h1 className="text-sm font-sans font-black tracking-wide text-white">SIMRS SAKTI</h1>
                  <p className="text-[10px] text-teal-400/80 font-mono mt-0.5 font-bold uppercase tracking-widest">Nusantara v2.4</p>
                </div>
              </div>
              {/* Close button for mobile drawers */}
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Administrator profile tag */}
            <div className={`p-4 border-b border-slate-800/80 bg-slate-950/20 flex items-center transition-all ${
              sidebarOpen ? "space-x-3" : "space-x-3 lg:space-x-0 lg:justify-center"
            }`}>
              <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 font-bold text-xs uppercase flex-shrink-0 animate-pulse" title="Sistem Informasi Manajemen Rumah Sakit">
                ADM
              </div>
              <div className={`${sidebarOpen ? "block" : "block lg:hidden"}`}>
                <p className="text-xs font-bold text-white leading-none">M. Admin Utama</p>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Server Aktif</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className={`p-3.5 space-y-1 transition-all ${sidebarOpen ? "" : "lg:px-2"}`}>
              {tabsInfo.map((tab) => {
                const active = activeTab === tab.id;
                let highlightIndicator = "";
                if (active) {
                  switch (tab.id) {
                    case "ai-assistant":
                      highlightIndicator = "bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold"; break;
                    default:
                      highlightIndicator = "bg-teal-600 text-white font-bold";
                  }
                }

                return (
                  <button
                    key={tab.id}
                    title={tab.label}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // collapse drawer on mobile
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full py-2.5 rounded-xl flex items-center transition-all cursor-pointer ${
                      sidebarOpen 
                        ? "px-3.5 space-x-3 text-left" 
                        : "px-3.5 space-x-3 lg:space-x-0 lg:justify-center lg:px-0 text-left lg:text-center"
                    } text-xs ${
                      active 
                        ? highlightIndicator 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {tab.icon}
                    </div>
                    <span className={`font-sans font-medium ${sidebarOpen ? "block" : "block lg:hidden"}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Brand footer cred */}
          <div className={`p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 flex flex-col transition-all ${
            sidebarOpen ? "space-y-1" : "space-y-1 lg:space-y-0 lg:items-center"
          }`}>
            <p className={`font-semibold leading-tight ${sidebarOpen ? "block" : "block lg:hidden"}`}>&copy; 2026 RS SAKTI NUSANTARA</p>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span className={`${sidebarOpen ? "block" : "block lg:hidden"}`}>Kemenkes RI Terakreditasi</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar header */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 md:px-5 flex items-center justify-between z-30 sticky top-0 shadow-xs select-none">
          
          {/* Left section: Hamburger & Title */}
          <div className="flex items-center space-x-3">
            {/* Hamburger button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors focus:ring-1 focus:ring-teal-500"
              id="sidebar-toggle-btn"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="block">
              <span className="text-[9px] font-bold text-teal-600/80 font-mono tracking-wider uppercase block">SIMRS Nusantara</span>
              <h2 className="text-sm font-sans font-black text-gray-800 leading-none flex items-center gap-1.5 mt-0.5">
                {tabsInfo.find(t => t.id === activeTab)?.label || "Dashboard"}
              </h2>
            </div>
          </div>

          {/* Right section: Actions & Dropdowns */}
          <div className="flex items-center space-x-3 md:space-x-4 text-xs font-sans">
            
            {/* Clock & metadata UTC display */}
            <div className="hidden lg:flex items-center space-x-2 text-gray-600 bg-gray-50 border border-gray-150 px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold shadow-3xs">
              <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>{currentTime}</span>
            </div>

            {/* Integration Status (Kemenkes) */}
            <div className="hidden md:flex items-center space-x-2.5 bg-teal-50/50 border border-teal-100/80 px-3 py-1 rounded-xl">
              <div className="text-right">
                <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wide">Status Integrasi</span>
                <span className="text-[10px] text-teal-800 font-bold block leading-none mt-0.5">BPJS Kemenkes JKN</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* NOTIFICATION BELL dropdown wrapper */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer relative ${
                  showNotifications 
                    ? "bg-slate-100 border-gray-300 text-slate-800" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                title="Layanan Notifikasi SIMRS"
              >
                <Bell className="w-4 h-4" />
                {activeNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 text-[9px] font-bold font-mono text-white rounded-full flex items-center justify-center animate-bounce shadow-sm">
                    {activeNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Dismissal Backdrop overlay */}
              {showNotifications && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)} />
              )}

              {/* Notification dropdown card */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-[400px] bg-white border border-gray-200/95 rounded-xl shadow-xl z-50 overflow-hidden text-gray-700 animate-slide-up">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3.5 bg-gray-50 border-b border-gray-150/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 tracking-tight">Hospital Feed & Notifikasi</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{activeNotifCount} pesan baru masuk</p>
                    </div>
                    {activeNotifCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer transition-all"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Dropdown Scrollable List */}
                  <div className="max-h-76 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        let typeColorAndBg = "bg-gray-100 text-gray-600 border-gray-250";
                        if (notif.type === "Pendaftaran") typeColorAndBg = "bg-blue-50 text-blue-700 border-blue-100";
                        if (notif.type === "AI Medis") typeColorAndBg = "bg-indigo-50/80 text-indigo-700 border-indigo-100";
                        if (notif.type === "Sistem") typeColorAndBg = "bg-slate-50 text-slate-700 border-slate-200";
                        if (notif.type === "Keuangan") typeColorAndBg = "bg-emerald-50 text-emerald-700 border-emerald-100";

                        return (
                          <div 
                            key={notif.id}
                            onClick={() => handleToggleRead(notif.id)}
                            className={`p-3.5 text-xs transition-colors cursor-pointer flex items-start space-x-3 border-l-3 ${
                              notif.read 
                                ? "hover:bg-slate-50 bg-white border-l-transparent" 
                                : "bg-teal-50/15 hover:bg-teal-50/25 border-l-teal-500"
                            }`}
                          >
                            {/* Bullet icon type badge */}
                            <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black uppercase rounded-sm border ${typeColorAndBg} flex-shrink-0 mt-0.5`}>
                              {notif.type}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`font-bold text-slate-800 truncate block ${notif.read ? "font-normal text-gray-600" : "font-extrabold"}`}>
                                  {notif.title}
                                </span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 ml-1"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal font-medium">{notif.desc}</p>
                              <span className="text-[9px] text-gray-400 font-mono block mt-1">{notif.time}</span>
                            </div>

                            {/* Delete single notification control */}
                            <button
                              onClick={(e) => handleClearNotif(notif.id, e)}
                              className="text-gray-300 hover:text-rose-500 p-0.5 mt-0.5 rounded transition-colors"
                              title="Hapus pemberitahuan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-400 space-y-1">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-75" />
                        <p className="font-semibold text-xs text-gray-600">Feed Hospital Bersih!</p>
                        <p className="text-[10px]">Semua pemberitahuan SIMRS telah ditangani.</p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="px-3 py-2 bg-slate-50 border-t border-gray-150 text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Pelayanan Terintegrasi Pemerintah Digital</span>
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE dropdown wrapper */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={`flex items-center space-x-2.5 p-1.5 rounded-full border transition-all cursor-pointer ${
                  showProfileMenu 
                    ? "bg-slate-100 border-gray-300 shadow-3xs" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                title="Sesi Akun Administrator Utama"
              >
                {/* Doctor Avatar picture */}
                <div className="relative flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=80&q=80"
                    alt="Dr. Sakti Sasono"
                    referrerPolicy="no-referrer"
                    className="w-7.5 h-7.5 rounded-full object-cover border border-emerald-500/20"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="hidden lg:block text-left pr-1 leading-tight select-none">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800 block text-xs">Dr. Sakti Sasono, Sp.A</span>
                    <Shield className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-[9px] text-slate-400/90 font-mono font-bold block uppercase tracking-wide">ID: RS-1982</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {/* Profile Dismissal Backdrop overlay */}
              {showProfileMenu && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowProfileMenu(false)} />
              )}

              {/* Profile dropdown card */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200/95 rounded-xl shadow-xl z-50 overflow-hidden text-gray-700 animate-slide-up">
                  
                  {/* Account detail badge */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-slate-200 border-b border-slate-950 flex flex-col items-center text-center space-y-2 select-none">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80"
                        alt="Dr. Sakti Sasono Profile"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-500/20 border border-teal-400/60 shadow-lg"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-xs text-white">Dr. Sakti Sasono, Sp.A</h4>
                      <p className="text-[10px] text-teal-400 font-mono uppercase tracking-wider font-bold mt-0.5">Kepala Komite Medik</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 mt-1 text-[8px] tracking-wider font-black font-sans uppercase rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        Akses Level: Super Admin
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Navigation Actions */}
                  <div className="p-1.5 divide-y divide-gray-100/80 text-xs">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center space-x-2.5 transition-colors text-left cursor-pointer font-bold text-gray-600 hover:text-slate-900"
                      >
                        <User className="w-4 h-4 text-teal-600" />
                        <span>Detil Profil Pegawai</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center space-x-2.5 transition-colors text-left cursor-pointer font-bold text-gray-600 hover:text-slate-900"
                      >
                        <Settings className="w-4 h-4 text-teal-600" />
                        <span>Konfigurasi SIMRS</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1.5 text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                        Integrasi Eksternal
                      </div>
                      <div className="px-3 py-1 flex items-center justify-between text-[11px] font-sans font-semibold text-gray-500">
                        <span className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Dinkes SATUSEHAT</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-mono font-black bg-emerald-50 text-emerald-700 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>ONLINE</span>
                        </span>
                      </div>
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-sans font-semibold text-gray-500">
                        <span className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Klaim BPJS V-Claim</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-mono font-black bg-sky-50 text-sky-700 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          <span>BRIDGING</span>
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (confirm("Apakah Anda ingin me-reset status sesi data dan kembali ke setelan pabrik SIMRS?")) {
                            localStorage.clear();
                            alert("Sesi SIMRS berhasil dibersihkan. Memuat ulang sistem...");
                            window.location.reload();
                          }
                        }}
                        className="w-full px-3 py-2 hover:bg-rose-50 rounded-lg flex items-center space-x-2.5 transition-colors text-left text-rose-600 font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Bersihkan Sesi (Reset Data)</span>
                      </button>
                    </div>
                  </div>

                  {/* Dropdown footer info */}
                  <div className="bg-slate-50 border-t border-gray-150 px-3.5 py-2 font-mono text-[9px] text-center text-gray-400 font-medium">
                    Sistem Operasional v2.40.2
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Tabs main wrapper */}
        <main className="p-5 md:p-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

      </div>

      {/* ================= MODAL OVERLAYS (POPUP LENGKAP) ================= */}

      {/* 1. Profile Modal Detail */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white border text-gray-800 border-gray-200/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-5 py-4.5 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-slate-150 border-b border-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-400 animate-pulse" />
                <h3 className="text-xs font-sans font-black text-white uppercase tracking-widest">SIPRS Pegawai Rumah Sakit</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 font-sans leading-relaxed text-xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 border-b border-gray-100 pb-5">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
                  alt="Dr. Sakti Sasono"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover border border-emerald-500/20 shadow-md ring-4 ring-emerald-500/10"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-black text-slate-800">Dr. Sakti Sasono, Sp.A</h4>
                  <p className="text-xs text-teal-600 font-bold font-mono">NIP. 198905202026012015</p>
                  <p className="text-gray-500 font-bold text-[11px] font-sans">Spesialisasi: Dokter Anak / Pediatrician</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9.5px] font-black uppercase rounded">Komite Medik</span>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9.5px] font-black uppercase rounded">Akses Penuh</span>
                  </div>
                </div>
              </div>

              {/* Administrative Details Table */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-teal-600 font-extrabold block uppercase tracking-widest">Kualifikasi & Status Kepegawaian</span>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/60 border border-slate-150/60 p-4 rounded-xl font-medium">
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Pangkat / Golongan</span>
                    <span className="text-slate-800 font-bold">Pembina Utama Muda (IV/c)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Surat Izin Praktik (SIP)</span>
                    <span className="text-slate-800 font-bold font-mono">SIP.440/1209/415.54/2026</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Stasiun / Departemen</span>
                    <span className="text-slate-800 font-bold">Poli Anak & ICU Neonatal / NICU</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Kontak Dinas Berkas</span>
                    <span className="text-slate-800 font-bold font-mono">0812-3490-EMER</span>
                  </div>
                </div>
              </div>

              {/* Security signature */}
              <div className="bg-emerald-50/50 border border-emerald-100/70 p-3 rounded-xl flex items-start space-x-2 text-[11px] text-emerald-955 leading-normal font-sans font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>Identitas ini telah terverifikasi oleh Sistem Manajemen Informasi SDM Kesehatan Kemenkes RI melalui bridging aktif KARS.</p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="py-2.5 px-4.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Tutup Detil Profil
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white text-gray-800 border border-gray-200/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-5 py-4.5 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-slate-150 border-b border-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-teal-400 animate-spin-slow" />
                <h3 className="text-xs font-sans font-black text-white uppercase tracking-widest">Pusat Konfigurasi SIMRS v2.4</h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 font-sans leading-relaxed text-xs">
              
              <div className="bg-yellow-50/70 border border-yellow-200/80 p-3.5 rounded-xl flex items-start space-x-2.5 text-[11px] text-yellow-900 font-semibold leading-normal">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Pengaturan berikut berdampak pada seluruh simulasi operasional antrean dokter, billing kuitansi, dan respon Asisten AI EMR.</span>
              </div>

              {/* Simulation Settings */}
              <div className="space-y-3.5">
                
                {/* 1 */}
                <div className="bg-slate-50/60 border border-slate-150/70 p-4 rounded-xl space-y-2 font-medium hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <span className="font-bold text-slate-800 block text-xs">Auto-Koneksi SATUSEHAT Kemenkes</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">Kirim rekam medis otomatis ke cloud dinkes pusat secara realtime.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>

                {/* 2 */}
                <div className="bg-slate-50/60 border border-slate-150/70 p-4 rounded-xl space-y-2 font-medium hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <span className="font-bold text-slate-800 block text-xs">Saran ICD-10 Berbasis Deep-Mind</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">Memetakan resep obat & keluhan ke standar WHO otomatis menggunakan AI.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* 3 */}
                <div className="bg-slate-50/60 border border-slate-150/70 p-4 rounded-xl space-y-2 font-medium hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <span className="font-bold text-slate-800 block text-xs">Diskon Default Kamar Bed Inap</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">Berikan insentif kamar kosong 5% untuk kemitraan umum & tunai.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="py-2.5 px-4.5 hover:bg-gray-150/65 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Default
              </button>
              <button
                onClick={() => {
                  alert("Konfigurasi sistem berhasil disimpan ke memori internal.");
                  setShowSettingsModal(false);
                }}
                className="py-2.5 px-4.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Simpan Setelan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
