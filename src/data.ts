import { Patient, Room, DoctorSchedule } from "./types";

export const initialPatients: Patient[] = [
  {
    id: "P-1001",
    name: "Rian Hidayat",
    age: 45,
    gender: "Laki-laki",
    phone: "+62 812-3456-7890",
    identityNumber: "3273123456789001",
    paymentType: "BPJS",
    address: "Jl. Dago No. 12, Bandung",
    admissionDate: "2026-05-18",
    department: "Poli Dalam",
    status: "Rawat Inap",
    queueNumber: "PD-003",
    doctorName: "dr. Sarah Wijaya, Sp.PD",
    clinicalNotes: "Pasien mengeluh sesak napas saat beraktivitas ringan, bengkak pada kedua tungkai kaki selama 5 hari terakhir. Nafsu makan menurun, mual (+). Riwayat hipertensi tidak terkontrol selama 3 tahun.",
    diagnosis: "Dyspnea ec Congestive Heart Failure NYHA Class III + Secondary Hypertension Stage II"
  },
  {
    id: "P-1002",
    name: "Siti Rahmawati",
    age: 28,
    gender: "Perempuan",
    phone: "+62 821-9876-5432",
    identityNumber: "3273234567890002",
    paymentType: "Umum",
    address: "Pondok Indah Block C, Jakarta Selatan",
    admissionDate: "2026-05-20",
    department: "Poli Kandungan",
    status: "Mulai Diperiksa",
    queueNumber: "PK-008",
    doctorName: "dr. Budi Santoso, Sp.OG",
    clinicalNotes: "G2P1A0 Gravida 32 minggu datang kontrol rutin. Mengeluh pusing disertai kaki sedikit bengkak. Tekanan darah terukur 140/90 mmHg. Denyut jantung janin normal 142 dpm.",
    diagnosis: "Gravida 32 minggu + Gestational Mild Preeclampsia"
  },
  {
    id: "P-1003",
    name: "Ahmad Maulana",
    age: 9,
    gender: "Laki-laki",
    phone: "+62 857-4455-6677",
    identityNumber: "3201445566778899",
    paymentType: "Asuransi",
    address: "Jl. Margonda Raya No. 45, Depok",
    admissionDate: "2026-05-20",
    department: "Poli Anak",
    status: "Antrean",
    queueNumber: "PA-015",
    doctorName: "dr. Ahmad Fauzi, Sp.A",
    clinicalNotes: "Demam naik turun selama 4 hari terutama pada sore dan malam hari. Mengeluh sakit kepala, mual, muntah 2 kali pagi ini, lidah kotor dengan tepi hiperemis (+). Uji rumple leede (-).",
    diagnosis: "Obs. Febris D4 ec Suspect Fever Typhoid"
  },
  {
    id: "P-1004",
    name: "Bambang Wijaya",
    age: 58,
    gender: "Laki-laki",
    phone: "+62 813-1122-3344",
    identityNumber: "31742403680005",
    paymentType: "BPJS",
    address: "Jl. Sudirman Gg. Melati No. 8, Tangerang",
    admissionDate: "2026-05-19",
    department: "Poli Bedah",
    status: "Selesai Tindakan",
    queueNumber: "PB-002",
    doctorName: "dr. Linda Kartika, Sp.B",
    clinicalNotes: "Pasien mengeluh nyeri hebat mendadak pada kuadran kanan bawah abdomen yang menjalar ke lipat paha. Demam ringan (38 C), nyeri tekan lepas sekum (+). Dilakukan tindakan appendektomi cito kemarin malam.",
    diagnosis: "Acute Appendicitis Gangrenous Post-Appendectomy Day 1"
  },
  {
    id: "P-1005",
    name: "Kartika Sari",
    age: 35,
    gender: "Perempuan",
    phone: "+62 819-2233-4455",
    identityNumber: "3273155566677701",
    paymentType: "Umum",
    address: "Dago Elok Blok K-20, Bandung",
    admissionDate: "2026-05-20",
    department: "Poli Gigi",
    status: "Antrean",
    queueNumber: "PG-004",
    doctorName: "drg. Diana Putri, Sp.KGA",
    clinicalNotes: "Nyeri berdenyut pada gigi geraham bawah kanan jika terkena makanan / minuman dingin atau panas sejak 3 hari lalu. Mukosa sekitar gusi tidak bengkak.",
    diagnosis: "Pulpitis Irreversibilis Radiks Gigi 36"
  },
  {
    id: "P-1006",
    name: "Farhan Iskandar",
    age: 22,
    gender: "Laki-laki",
    phone: "+62 878-1111-2222",
    identityNumber: "3273111122223334",
    paymentType: "BPJS",
    address: "Jl. Pasteur No. 104, Bandung",
    admissionDate: "2026-05-20",
    department: "IGD",
    status: "Mulai Diperiksa",
    queueNumber: "IGD-001",
    doctorName: "dr. Sarah Wijaya, Sp.PD",
    clinicalNotes: "Pasien diantar keluarga akibat sesak hebat dan mengi setelah bermain dengan kucing peliharaan. Batuk berdahak bening kental, ekstremitas dingin, kesadaran compos mentis, wheezing (+) pada kedua lapang paru.",
    diagnosis: "Exacerbation Acute Asthma Moderate Severity ec Allergen Trigger"
  }
];

export const initialRooms: Room[] = [
  {
    id: "R-1",
    roomName: "Anggrek VIP",
    roomClass: "VIP",
    dailyTariff: 1200000,
    beds: [
      { id: "R-1-B1", name: "Bed A", status: "Terisi", patientId: "P-1001", patientName: "Rian Hidayat" },
      { id: "R-1-B2", name: "Bed B", status: "Tersedia" }
    ]
  },
  {
    id: "R-2",
    roomName: "Bougenville I",
    roomClass: "Kelas I",
    dailyTariff: 750000,
    beds: [
      { id: "R-2-B1", name: "Bed A", status: "Tersedia" },
      { id: "R-2-B2", name: "Bed B", status: "Pembersihan" }
    ]
  },
  {
    id: "R-3",
    roomName: "Cempaka II-A",
    roomClass: "Kelas II",
    dailyTariff: 450000,
    beds: [
      { id: "R-3-B1", name: "Bed A", status: "Terisi", patientId: "P-1004", patientName: "Bambang Wijaya" },
      { id: "R-3-B2", name: "Bed B", status: "Tersedia" },
      { id: "R-3-B3", name: "Bed C", status: "Tersedia" }
    ]
  },
  {
    id: "R-4",
    roomName: "Dahlia III-X",
    roomClass: "Kelas III",
    dailyTariff: 250000,
    beds: [
      { id: "R-4-B1", name: "Bed A", status: "Tersedia" },
      { id: "R-4-B2", name: "Bed B", status: "Tersedia" },
      { id: "R-4-B3", name: "Bed C", status: "Pemeliharaan" },
      { id: "R-4-B4", name: "Bed D", status: "Tersedia" }
    ]
  },
  {
    id: "R-5",
    roomName: "ICU Utama",
    roomClass: "ICU",
    dailyTariff: 1800000,
    beds: [
      { id: "R-5-B1", name: "Bed 1", status: "Tersedia" },
      { id: "R-5-B2", name: "Bed 2", status: "Tersedia" }
    ]
  }
];

export const initialDoctors: DoctorSchedule[] = [
  {
    id: "D-101",
    name: "dr. Ahmad Fauzi, Sp.A",
    specialty: "Spesialis Anak (Pediatrician)",
    department: "Poli Anak",
    status: "Aktif",
    roomNo: "Klinik Anak 1",
    scheduleHours: "08:00 - 13:00",
    currentQueue: 4
  },
  {
    id: "D-102",
    name: "dr. Sarah Wijaya, Sp.PD",
    specialty: "Spesialis Penyakit Dalam (Internist)",
    department: "Poli Dalam",
    status: "Mulai Praktek",
    roomNo: "Klinik Dalam 3",
    scheduleHours: "09:00 - 15:00",
    currentQueue: 11
  },
  {
    id: "D-103",
    name: "dr. Budi Santoso, Sp.OG",
    specialty: "Spesialis Obstetri & Ginekologi",
    department: "Poli Kandungan",
    status: "Aktif",
    roomNo: "Klinik Obsgyn 2",
    scheduleHours: "08:30 - 14:00",
    currentQueue: 6
  },
  {
    id: "D-104",
    name: "dr. Linda Kartika, Sp.B",
    specialty: "Spesialis Bedah Umum",
    department: "Poli Bedah",
    status: "On Call",
    roomNo: "Klinik Bedah 4",
    scheduleHours: "10:00 - 16:00",
    currentQueue: 2
  },
  {
    id: "D-105",
    name: "drg. Diana Putri, Sp.KGA",
    specialty: "Spesialis Kedokteran Gigi Anak",
    department: "Poli Gigi",
    status: "Aktif",
    roomNo: "Klinik Gigi 1",
    scheduleHours: "08:00 - 12:00",
    currentQueue: 1
  }
];
