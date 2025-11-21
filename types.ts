
export enum AcademicTrack {
  HIFZ = 'Hifz',
  DARS_E_NIZAMI = 'Dars-e-Nizami'
}

export enum StudentStatus {
  ACTIVE = 'Active',
  GRADUATED = 'Graduated',
  LEFT = 'Left'
}

export enum CertificateStatus {
  RECEIVED = 'Received',
  NOT_ISSUED = 'Not Yet Issued',
  PENDING = 'Pending Collection'
}

export interface Student {
  id: string;
  fullName: string;
  bForm: string;
  fatherName: string;
  fatherCnic: string;
  address: string;
  contactNumber: string;
  track: AcademicTrack;
  className: string; // Specific level e.g., "Aaliyah Awwal"
  photoUrl?: string;
  status: StudentStatus;
  
  // Alumni Specific Fields
  graduationDate?: string;
  completedLevels?: string[]; // For Dars-e-Nizami progress tracking
  certificateStatus?: CertificateStatus; // Final Sanad status
  certificateDetails?: string; // Additional notes regarding the Sanad/Certificate
  alumniPhotoUrl?: string; // Specific photo for graduation
  hifzCompletionVerified?: boolean; // Verification checkbox for Hifz
}

// Tanzim-ul-Madaris Module
export interface TanzimRecord {
  id: string;
  studentName: string;
  fatherName: string;
  contactNumber: string;
  examYear: string;
  studentPhotoUrl?: string;
  cnicImageUrl?: string;
  extraPhotosUrls?: string[]; // For the 2 passport photos required
  
  // Fee Details - Admission
  admissionFee: number;
  isFeePaid: boolean;
  challanNumber?: string;
  challanImageUrl?: string;

  // Fee Details - Other / Miscellaneous
  otherFee?: number;
  isOtherFeePaid?: boolean;
  otherFeeChallanNumber?: string;

  // Document Checklist
  documentsSubmitted?: {
    cnic: boolean;
    photos: boolean;
    receipt: boolean;
  };
}

// New Madrasa Fee Module
export interface MadrasaFeeRecord {
  id: string;
  studentId: string;
  studentName: string; // Cached for display
  className: string;
  month: string; // Format: "YYYY-MM" e.g., "2024-03"
  amount: number;
  status: 'Paid' | 'Pending';
  receiptNumber?: string;
  paymentDate?: string;
}

export interface TeacherAssignment {
  id: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string[]; // e.g., ["Mon", "Tue"]
}

export interface Teacher {
  id: string;
  name: string;
  qualification: string;
  contactNumber: string;
  assignments: TeacherAssignment[];
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LEAVE = 'Leave'
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isUrgent: boolean;
}

// Constants for Dropdowns
export const DARS_E_NIZAMI_CLASSES = [
  "Mutawassitah",
  "Aammah Awwal",
  "Aammah Doum",
  "Khaasah Awwal",
  "Khaasah Doum",
  "Aaliyah Awwal",
  "Aaliyah Doum",
  "Aalamiyah Awwal",
  "Aalamiyah Doum"
];

export const HIFZ_LEVELS = [
  "Nazira",
  "Hifz Ibtidai",
  "Hifz Mukammal",
  "Daura"
];