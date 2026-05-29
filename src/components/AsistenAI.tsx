import { useState, useEffect } from "react";
import { Patient } from "../types";
import { 
  Sparkles, Stethoscope, FileText, HelpCircle, User, ArrowRight, RefreshCw, AlertCircle, Copy, Check, CheckCircle2, ChevronRight, MessageSquareCode
} from "lucide-react";

interface Props {
  patients: Patient[];
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  aiQueryForICD10: string;
  setAiQueryForICD10: (query: string) => void;
}

type AIMode = "summarize" | "jargon" | "icd10";

export default function AsistenAI({ 
  patients, selectedPatient, setSelectedPatient, aiQueryForICD10, setAiQueryForICD10 
}: Props) {
  const [activeMode, setActiveMode] = useState<AIMode>("summarize");
  
  // Input fields
  const [medicalNotesInput, setMedicalNotesInput] = useState<string>("");
  const [jargonInput, setJargonInput] = useState<string>("");
  const [icd10Input, setIcd10Input] = useState<string>("");

  // Outputs
  const [summarizeResult, setSummarizeResult] = useState<string>("");
  const [jargonResult, setJargonResult] = useState<string>("");
  const [icd10Result, setIcd10Result] = useState<string>("");

  // Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clipboard feedbacks
  const [copied, setCopied] = useState<boolean>(false);

  // Sync inputs with selectedPatient or external trigger
  useEffect(() => {
    if (selectedPatient) {
      setMedicalNotesInput(selectedPatient.clinicalNotes || "");
      setJargonInput(selectedPatient.diagnosis || "");
      // Switch active mode depending on which preset is loaded, or stick with current
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (aiQueryForICD10) {
      setIcd10Input(aiQueryForICD10);
      setActiveMode("icd10");
    }
  }, [aiQueryForICD10]);

  // Execute API calls to Express Server
  const handleCallAI = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      let endpoint = "";
      let bodyData = {};

      if (activeMode === "summarize") {
        endpoint = "/api/gemini/summarize";
        bodyData = { medicalNotes: medicalNotesInput };
      } else if (activeMode === "jargon") {
        endpoint = "/api/gemini/translate-jargon";
        bodyData = { JargonText: jargonInput };
      } else {
        endpoint = "/api/gemini/icd10";
        bodyData = { query: icd10Input };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (activeMode === "summarize") {
        setSummarizeResult(data.summary || "No response");
      } else if (activeMode === "jargon") {
        setJargonResult(data.explanation || "No response");
      } else {
        setIcd10Result(data.suggestions || "No response");
      }

    } catch (err: any) {
      console.error("AI Assistant process error:", err);
      setErrorMsg(err.message || "Gagal menghubungi modul AI. Pastikan server aktif dan API key terkonfigurasi dengan benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (activeMode === "summarize") {
      setMedicalNotesInput("");
      setSummarizeResult("");
    } else if (activeMode === "jargon") {
      setJargonInput("");
      setJargonResult("");
    } else {
      setIcd10Input("");
      setIcd10Result("");
      setAiQueryForICD10("");
    }
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Mode Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Core Workspace Mode Selectors */}
        <div className="bg-white p-1 border border-gray-200/80 rounded-xl shadow-sm flex items-center space-x-1 overflow-x-auto max-w-full">
          
          <button
            onClick={() => { setActiveMode("summarize"); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === "summarize" 
                ? "bg-indigo-600 text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ringkas Rekam Medis</span>
          </button>

          <button
            onClick={() => { setActiveMode("jargon"); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === "jargon" 
                ? "bg-teal-600 text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Terjemahan Jargon Pasien</span>
          </button>

          <button
            onClick={() => { setActiveMode("icd10"); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === "icd10" 
                ? "bg-emerald-600 text-white" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>ICD-10 Code Helper</span>
          </button>

        </div>

        {/* Quick Patient Select Box */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-sm max-w-xs md:max-w-md w-full">
          <User className="w-4 h-4 text-gray-400" />
          <select
            value={selectedPatient?.id || ""}
            onChange={(e) => {
              const selected = patients.find(p => p.id === e.target.value);
              setSelectedPatient(selected || null);
            }}
            className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none w-full"
          >
            <option value="">-- Preset Hubungkan Pasien EMR --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.id}]
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main split work board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-relaxed">
        
        {/* Left Side: Inputs */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-5 space-y-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Input Parameter Klinis</span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full uppercase font-medium">Gemini-3.5-Flash Active</span>
            </div>

            {/* Patients Context Indicator */}
            {selectedPatient && (
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-2.5">
                  <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-bold font-mono">
                    {selectedPatient.id}
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">{selectedPatient.name}</span>
                    <span className="text-gray-400 block text-[10px] font-medium">{selectedPatient.age} Tahun, {selectedPatient.gender} - {selectedPatient.department}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)} 
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1.5 py-0.5 rounded hover:bg-slate-150 transition-colors"
                >
                  Lepas
                </button>
              </div>
            )}

            {/* Conditional input containers */}
            {activeMode === "summarize" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 font-bold block uppercase">Catatan Catatan Klinis Dokter & Resep (Format Bebas) *</label>
                <textarea
                  rows={9}
                  required
                  placeholder="Ketik rekam medis klinis berantakan, keluhan awal, berat badan, laju nafas, atau obat yang diresepkan..."
                  value={medicalNotesInput}
                  onChange={(e) => setMedicalNotesInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs leading-relaxed font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-gray-400 block font-sans">Contoh: &ldquo;Sesak napas bila naik tangga, mual (+), edema tungkai bilateral. Riwayat hipertensi td 160/100 mmHg. Rekomendasi spironolakton 25mg 1x1, furosemid 40mg 1x1..&rdquo;</span>
              </div>
            )}

            {activeMode === "jargon" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 font-bold block uppercase">Istilah diagnosis rumit atau jargon medis *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gastroesophageal Reflux Disease (GERD) / Pulpitis Irreversibilis / Gestational Preeclampsia"
                  value={jargonInput}
                  onChange={(e) => setJargonInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs leading-relaxed font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-[10px] text-gray-400 block font-sans leading-normal">AI akan menerjemahkannya ke dalam bahasa awam yang menenangkan dan memberikan tip kesehatan harian kepada pasien.</p>
              </div>
            )}

            {activeMode === "icd10" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 font-bold block uppercase">Masukan diagnosis klinik atau gejala diagnosa *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Masukkan kalimat gejala atau diagnosis utama. Contoh: 'Radang tenggorokan akut disertai demam ringan' atau 'Appendisitis akut gangrenosa'"
                  value={icd10Input}
                  onChange={(e) => setIcd10Input(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs leading-relaxed font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-gray-400 block font-sans leading-normal">Dapatkan daftar saran kode ICD-10 klinis internasional beserta kategorinya dalam bahasa Indonesia terjemahan.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hapus Input
            </button>
            <button
              onClick={handleCallAI}
              disabled={loading || (activeMode === "summarize" ? !medicalNotesInput : activeMode === "jargon" ? !jargonInput : !icd10Input)}
              className={`flex-1 py-2.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                activeMode === "summarize" ? "bg-indigo-600 hover:bg-indigo-700" : activeMode === "jargon" ? "bg-teal-600 hover:bg-teal-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang memproses instrumen AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Kirim ke mesin Asisten AI</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Analytical Reports */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-gray-400">Lembar Analisis & Hasil AI SIMRS</span>
              
              {/* Copy action if there is content */}
              {((activeMode === "summarize" && summarizeResult) || 
                (activeMode === "jargon" && jargonResult) || 
                (activeMode === "icd10" && icd10Result)) && (
                <button
                  onClick={() => {
                    const text = activeMode === "summarize" ? summarizeResult : activeMode === "jargon" ? jargonResult : icd10Result;
                    handleCopyClipboard(text);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin Hasil</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error messaging bar if any */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-155 rounded-lg text-red-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Kegagalan Integrasi AI</p>
                  <p className="mt-0.5 text-gray-700 leading-normal">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Custom styled clinical report output sheet */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 min-h-[240px] font-sans text-xs relative overflow-hidden">
              
              {loading && (
                <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
                  <p className="text-[10px] font-mono text-teal-600 font-bold tracking-widest uppercase">Menerjemahkan dengan Gemini-3.5-flash...</p>
                </div>
              )}

              {/* Outputs layouts */}
              {activeMode === "summarize" && (
                <>
                  {summarizeResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 border-b border-gray-200 pb-2 mb-2 text-indigo-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span className="font-sans uppercase text-[10px] font-extrabold tracking-wider">Lembar Ringkasan Rekam Medis</span>
                      </div>
                      <p className="text-gray-700 font-sans text-xs font-semibold whitespace-pre-line leading-relaxed">
                        {summarizeResult}
                      </p>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <FileText className="w-10 h-10 text-gray-200" />
                      <div>
                        <p className="font-semibold text-xs">Menunggu Analisis Ringkasan</p>
                        <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">Ketik rekam medis liar atau pilih rekam medis pasien di atas lalu klik &ldquo;Kirim ke mesin Asisten AI&rdquo;.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeMode === "jargon" && (
                <>
                  {jargonResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 border-b border-gray-200 pb-2 mb-2 text-teal-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span className="font-sans uppercase text-[10px] font-extrabold tracking-wider">Penjelasan Istilah (Edukasi Pasien)</span>
                      </div>
                      <p className="text-gray-700 font-sans text-xs font-semibold whitespace-pre-line leading-relaxed">
                        {jargonResult}
                      </p>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <HelpCircle className="w-10 h-10 text-gray-200" />
                      <div>
                        <p className="font-semibold text-xs">Menunggu Istilah Medis</p>
                        <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">AI akan membantu menerjemahkan kata-kata klinis berbelit menjadi pesan kesehatan pasien yang komunikatif.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeMode === "icd10" && (
                <>
                  {icd10Result ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 border-b border-gray-200 pb-2 mb-2 text-emerald-900 font-bold">
                        <MessageSquareCode className="w-4 h-4 text-emerald-600" />
                        <span className="font-sans uppercase text-[10px] font-extrabold tracking-wider">Daftar Rekomendasi Kode ICD-10</span>
                      </div>
                      <p className="text-gray-700 font-sans text-xs font-semibold whitespace-pre-line leading-relaxed">
                        {icd10Result}
                      </p>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <Stethoscope className="w-10 h-10 text-gray-200" />
                      <div>
                        <p className="font-semibold text-xs">Menunggu Diagnosis Keluhan</p>
                        <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">Klasifikasi rekam medis ke kode ICD-10 otomatis akan muncul terstruktur di sini.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

          {/* Quick legal AI disclaimer for clinical helper */}
          <div className="pt-4 border-t border-gray-100 flex items-start space-x-2.5 text-[10px] text-gray-400 leading-normal">
            <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>INSTRUMEN INFORMASI: Layanan AI disediakan murni sebagai asisten administrasi SIMRS dan asisten telaah kode klasifikasi ICD-10 pendukung. Diagnosis klinis final sepenuhnya di bawah tanggung jawab dokter penanggung jawab pasien resmi.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
