export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Laki-laki" | "Perempuan";
  phone: string;
  identityNumber: string; // NIK or BPJS
  paymentType: "BPJS" | "Umum" | "Asuransi";
  address: string;
  admissionDate: string;
  department: "Poli Anak" | "Poli Kandungan" | "Poli Dalam" | "Poli Bedah" | "Poli Gigi" | "IGD";
  status: "Antrean" | "Mulai Diperiksa" | "Rawat Inap" | "Selesai Tindakan";
  queueNumber: string;
  doctorName: string;
  clinicalNotes?: string;
  diagnosis?: string;
}

export type BedStatus = "Tersedia" | "Terisi" | "Pembersihan" | "Pemeliharaan";

export interface Bed {
  id: string;
  name: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
}

export type RoomClass = "VIP" | "Kelas I" | "Kelas II" | "Kelas III" | "ICU";

export interface Room {
  id: string;
  roomName: string;
  roomClass: RoomClass;
  beds: Bed[];
  dailyTariff: number;
}

export interface DoctorSchedule {
  id: string;
  name: string;
  specialty: string;
  department: Patient["department"];
  status: "Aktif" | "On Call" | "Cuti" | "Mulai Praktek";
  roomNo: string;
  scheduleHours: string;
  currentQueue: number;
}

export interface BillingSim {
  patientId: string;
  roomCharges: number;
  doctorCharges: number;
  medicationCharges: number;
  treatmentCharges: number;
  discount: number;
  bpjsCovered: boolean;
  totalBeforeCover: number;
  totalOutofPocket: number;
  isPaid: boolean;
}
