import { useState, useEffect } from "react";
import { Patient, Room, BillingSim } from "../types";
import { 
  CreditCard, Printer, ShieldAlert, Receipt, ShoppingCart, User, Landmark, Building, CheckCircle, Calculator, Percent
} from "lucide-react";

interface Props {
  patients: Patient[];
  rooms: Room[];
}

export default function BillingSimulator({ patients, rooms }: Props) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [daysOfStay, setDaysOfStay] = useState<number>(1);
  const [doctorCharges, setDoctorCharges] = useState<number>(150000);
  const [medicationCharges, setMedicationCharges] = useState<number>(240000);
  const [treatmentCharges, setTreatmentCharges] = useState<number>(350000);
  const [discount, setDiscount] = useState<number>(0);
  const [bpjsCovered, setBpjsCovered] = useState<boolean>(false);
  const [checkoutCompleted, setCheckoutCompleted] = useState<boolean>(false);

  // Auto-calculated fields
  const [roomCharges, setRoomCharges] = useState<number>(0);
  const [roomTariff, setRoomTariff] = useState<number>(0);
  const [roomName, setRoomName] = useState<string>("Tidak Rawat Inap");

  const activePatient = patients.find(p => p.id === selectedPatientId);

  // Update room costs automatically if patient is rawat inap
  useEffect(() => {
    if (activePatient) {
      // Auto toggle BPJS check based on patient registration guarantee
      setBpjsCovered(activePatient.paymentType === "BPJS");

      // Search if this patient occupies a Bed in the rooms list
      let foundRoom: Room | null = null;
      rooms.forEach(r => {
        const hasBed = r.beds.some(b => b.status === "Terisi" && b.patientId === activePatient.id);
        if (hasBed) foundRoom = r;
      });

      if (foundRoom) {
        setRoomTariff((foundRoom as Room).dailyTariff);
        setRoomCharges((foundRoom as Room).dailyTariff * daysOfStay);
        setRoomName(`${(foundRoom as Room).roomName} (${(foundRoom as Room).roomClass})`);
      } else if (activePatient.status === "Rawat Inap") {
        // Fallback default bed tariff if bed not in rooms
        setRoomTariff(250000);
        setRoomCharges(250000 * daysOfStay);
        setRoomName("Kelas III Standard (Rawat Inap)");
      } else {
        setRoomTariff(0);
        setRoomCharges(0);
        setRoomName("Tidak Rawat Inap (Rawat Jalan)");
      }
      setCheckoutCompleted(false);
    }
  }, [selectedPatientId, daysOfStay, activePatient, rooms]);

  if (patients.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
        Silakan daftarkan atau aktifkan data pasien terlebih dahulu di SIMRS.
      </div>
    );
  }

  // Prepopulate first patient on mount
  if (!selectedPatientId && patients.length > 0) {
    setSelectedPatientId(patients[0].id);
  }

  const subTotal = roomCharges + doctorCharges + medicationCharges + treatmentCharges;
  const netDiscount = Math.min(discount, subTotal);
  const totalBeforeCover = Math.max(0, subTotal - netDiscount);
  // Indonesian BPJS waives 100% of standard class tariffs
  const totalOutofPocket = bpjsCovered ? 0 : totalBeforeCover;

  const handleProcessPayment = () => {
    setCheckoutCompleted(true);
  };

  const uuidMock = `SIMRS-INV-${2026}${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="space-y-6">
      
      {/* Simulation form panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 leading-relaxed">
        
        {/* Input variables */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-1">
            <Calculator className="w-5 h-5 text-teal-600" />
            <h4 className="text-sm font-sans font-bold text-gray-700">Kalkulator Billing SIMRS</h4>
          </div>

          {/* Patient dropdown */}
          <div>
            <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Pilih Pasien Aktif</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.name} - {p.paymentType}
                </option>
              ))}
            </select>
          </div>

          {activePatient && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Diagnosis Utama:</span>
                <span className="font-semibold text-gray-700 text-right max-w-xs">{activePatient.diagnosis || "Observasi"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Penjamin Terdaftar:</span>
                <span className="font-bold text-teal-600 font-mono text-right">{activePatient.paymentType}</span>
              </div>
              {roomTariff > 0 && (
                <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-[11px]">
                  <span className="text-gray-400">Tarif Kamar Bed:</span>
                  <span className="font-medium text-gray-700">{roomName}</span>
                </div>
              )}
            </div>
          )}

          {/* Days of stay (visible only if inpatient) */}
          {roomTariff > 0 && (
            <div>
              <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Durasi Rawat Inap (Hari) *</label>
              <input
                type="number"
                min={1}
                max={60}
                value={daysOfStay}
                onChange={(e) => setDaysOfStay(Math.max(1, parseInt(e.target.value, 10)))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Doctor consulting rate */}
          <div>
            <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Jasa Konsultasi Dokter (Rupiah) *</label>
            <input
              type="number"
              step={10000}
              value={doctorCharges}
              onChange={(e) => setDoctorCharges(Math.max(0, parseInt(e.target.value, 10)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Medications rate */}
          <div>
            <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Biaya Obat-Obatan & Farmasi (Rupiah)</label>
            <input
              type="number"
              step={10000}
              value={medicationCharges}
              onChange={(e) => setMedicationCharges(Math.max(0, parseInt(e.target.value, 10)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Action rate */}
          <div>
            <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase">Biaya Tindakan / Keperawatan (Rupiah)</label>
            <input
              type="number"
              step={10000}
              value={treatmentCharges}
              onChange={(e) => setTreatmentCharges(Math.max(0, parseInt(e.target.value, 10)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Discount rate */}
          <div>
            <label className="text-[10px] font-mono text-gray-400 font-bold block mb-1 uppercase flex justify-between">
              <span>Potongan Harga / Diskon (Rp)</span>
              <span><Percent className="w-3 h-3 inline text-gray-400" /></span>
            </label>
            <input
              type="number"
              step={5000}
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value, 10)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* BPJS health activation check */}
          <div className="bg-teal-50 border border-teal-100/80 p-3 rounded-lg flex items-start space-x-3 text-xs">
            <input
              type="checkbox"
              id="bpjs-activate-checkbox"
              checked={bpjsCovered}
              onChange={(e) => setBpjsCovered(e.target.checked)}
              className="mt-1 h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
            />
            <label htmlFor="bpjs-activate-checkbox" className="text-teal-900 cursor-pointer">
              <span className="font-bold block">Gunakan Jaminan BPJS Kesehatan</span>
              <span className="text-[10px] text-teal-700 block mt-0.5 leading-normal">Mencakup seluruh biaya rujukan standard RS kelas ini, Out-Of-Pocket mandiri disaput nihil.</span>
            </label>
          </div>

          <div className="pt-3">
            <button
              onClick={handleProcessPayment}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulasikan Invoice & Bayar</span>
            </button>
          </div>

        </div>

        {/* Invoice Generator Display */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6 lg:col-span-2 flex flex-col justify-between leading-relaxed">
          
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-gray-500" />
                <h4 className="text-sm font-sans font-bold text-gray-700">Preview Kuitansi Pembayaran Rekening Medis</h4>
              </div>
              <span className="text-[10px] font-mono text-gray-400">NO INVOICE: {uuidMock}</span>
            </div>

            {/* Simulated Receipt paper layout */}
            <div className="border border-gray-150 p-6 bg-amber-50/10 rounded-xl space-y-5 font-sans relative overflow-hidden">
              
              {/* watermark when checkout is complete */}
              {checkoutCompleted && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12 border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl px-6 py-2.5 rounded-lg opacity-25 uppercase tracking-wider select-none text-center">
                  Lunas Pembayaran<br/>
                  <span className="text-xs font-normal">SIMRS Sakti</span>
                </div>
              )}

              {/* Clinic Header logo */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-sm font-sans font-black uppercase text-teal-800 flex items-center space-x-1.5 leading-none">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <span>RS SAKTI NUSANTARA</span>
                  </h3>
                  <p className="text-[9px] text-gray-400 mt-1 block max-w-sm">Jl. Jenderal Sudirman No. 204, Kota Metropolitan. Telp: (022) 123456</p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold block text-gray-700">BILLING INVOICE</span>
                  <span className="text-[10px] text-gray-400 font-mono">Printed: 2026-05-20 UTC</span>
                </div>
              </div>

              {/* Patient Core Data */}
              {activePatient ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2 text-xs border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">KARTU PASIEN</span>
                    <span className="text-gray-700 font-semibold font-mono">{activePatient.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">NAMA LENGKAP</span>
                    <span className="text-gray-700 font-bold">{activePatient.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">UMUR / JENDER</span>
                    <span className="text-gray-700 font-semibold">{activePatient.age} Tahun, {activePatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">JALUR PENJAMIN</span>
                    <span className="text-teal-700 font-extrabold font-mono">{bpjsCovered ? "BPJS KESEHATAN" : activePatient.paymentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">KLINIK PEMERIKSA</span>
                    <span className="text-gray-700 font-semibold">{activePatient.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold">DOKTER UTAMA</span>
                    <span className="text-gray-700 font-semibold">{activePatient.doctorName}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-mono">Menunggu pemilihan pasien...</div>
              )}

              {/* Bill Items list */}
              <div className="space-y-2.5">
                <span className="text-gray-400 block text-[9px] font-black uppercase">Rincian Komponen Jasa Layanan</span>
                
                <div className="divide-y divide-gray-100 divide-dashed text-xs space-y-1.5">
                  
                  {/* Doctor consulting charge */}
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-600 font-medium">Jasa Konsultasi dr. Spesialis ({activePatient?.department})</div>
                    <span className="font-mono text-gray-700 font-semibold">Rp {doctorCharges.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Bed cost, if rawat inap */}
                  {roomTariff > 0 && (
                    <div className="flex justify-between py-1.5">
                      <div className="text-gray-600 font-medium">Tarif Bed & Kamar ({roomName}) x {daysOfStay} Hari</div>
                      <span className="font-mono text-gray-700 font-semibold">Rp {roomCharges.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {/* Medication charges */}
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-600 font-medium font-sans">Apotek & Farmasi Resep Dokter</div>
                    <span className="font-mono text-gray-700 font-semibold">Rp {medicationCharges.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Treatments details */}
                  <div className="flex justify-between py-1.5">
                    <div className="text-gray-600 font-medium">Tindakan Keperawatan / Medis Tambahan</div>
                    <span className="font-mono text-gray-700 font-semibold">Rp {treatmentCharges.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Discount item, if any */}
                  {discount > 0 && (
                    <div className="flex justify-between py-1.5 text-rose-600 font-medium">
                      <div>Diskon Pengurangan RS</div>
                      <span className="font-mono font-bold">- Rp {netDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {/* Total Before coverage */}
                  <div className="flex justify-between py-2 border-t border-gray-150 text-[13px] font-sans">
                    <span className="font-black text-gray-700">SUBTOTAL REKENING MEDIS</span>
                    <span className="font-bold font-mono text-gray-800">Rp {totalBeforeCover.toLocaleString('id-ID')}</span>
                  </div>

                  {/* BPJS waiver item */}
                  {bpjsCovered && (
                    <div className="flex justify-between py-2 text-emerald-700 font-semibold">
                      <div className="flex items-center space-x-1">
                        <Landmark className="w-4 h-4" />
                        <span>Klaim Ditanggung BPJS Kesehatan</span>
                      </div>
                      <span className="font-mono font-black">- Rp {totalBeforeCover.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {/* Out of pocket total */}
                  <div className="flex justify-between py-3 border-t-2 border-gray-150 text-base">
                    <span className="font-black text-teal-800 uppercase">Total Dibayar Pasien (Out of Pocket)</span>
                    <span className="font-black font-mono text-teal-800">Rp {totalOutofPocket.toLocaleString('id-ID')}</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Action to trigger browser print */}
          <div className="flex items-center justify-end space-x-3 border-t border-gray-100 pt-5 mt-6">
            <button
              onClick={() => alert("Kuitansi SIMRS sedang dikirim ke antrean cetak printer thermal RS...")}
              disabled={!checkoutCompleted}
              className="py-2 px-4 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Cetakan Billing</span>
            </button>
            
            {checkoutCompleted && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Transaksi Selesai & Tercatat</span>
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
