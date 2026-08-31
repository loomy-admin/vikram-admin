export type SchoolStatus = 'ACTIVE' | 'INACTIVE';
export type StudentStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type AccessCodeStatus = 'UNUSED' | 'USED' | 'INACTIVE';
export type ContentType = 'VIDEO' | 'PDF' | 'IMAGE' | 'WEB_LINK';
export type ContentStatus = 'VISIBLE' | 'HIDDEN';
export type ClassStatus = 'ACTIVE' | 'INACTIVE';
export type SubjectStatus = 'ACTIVE' | 'INACTIVE';
export type ChapterStatus = 'ACTIVE' | 'INACTIVE';
export type TopicStatus = 'ACTIVE' | 'INACTIVE';
export type AdminStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    pages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  total?: number;
  totalPages?: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  status: AdminStatus;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface School {
  id: number;
  name: string;
  schoolCode: string;
  address?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  status: SchoolStatus;
  createdAt?: string;
  updatedAt?: string;
  studentsCount?: number;
  totalCodes?: number;
  usedCodes?: number;
  unusedCodes?: number;
  _count?: {
    students: number;
    accessCodes: number;
  };
}

export interface Student {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  schoolId: number;
  classId: number;
  status: StudentStatus;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  lastLogin?: string | null;
  assignedAccessCode?: string | null;
  accessCodeStatus?: string | null;
  school?: {
    id: number;
    name: string;
    schoolCode: string;
  };
  class?: {
    id: number;
    name: string;
    grade: number;
  };
  accessCode?: {
    id: number;
    code: string;
    status: AccessCodeStatus;
    usedAt?: string | null;
    createdAt?: string;
  } | null;
}

export interface AccessCode {
  id: number;
  code: string;
  schoolId: number;
  studentId?: number | null;
  status: AccessCodeStatus;
  createdAt: string;
  usedAt?: string | null;
  school?: {
    id: number;
    name: string;
    schoolCode: string;
  };
  student?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface ClassItem {
  id: number;
  name: string;
  grade: number;
  status: ClassStatus;
  createdAt?: string;
  _count?: {
    subjects: number;
    students: number;
  };
}

export interface SubjectItem {
  id: number;
  classId: number;
  name: string;
  description?: string | null;
  order: number;
  status: SubjectStatus;
  createdAt?: string;
  class?: ClassItem;
  chapters?: ChapterItem[];
  _count?: {
    chapters: number;
  };
}

export interface ChapterItem {
  id: number;
  subjectId: number;
  name: string;
  description?: string | null;
  order: number;
  status: ChapterStatus;
  createdAt?: string;
  subject?: SubjectItem;
  topics?: TopicItem[];
  _count?: {
    topics: number;
  };
}

export interface TopicItem {
  id: number;
  chapterId: number;
  name: string;
  description?: string | null;
  order: number;
  status: TopicStatus;
  createdAt?: string;
  chapter?: ChapterItem;
  contents?: ContentItem[];
  _count?: {
    contents: number;
  };
}

export interface ContentItem {
  id: number;
  topicId: number;
  title: string;
  type: ContentType;
  url: string;
  description?: string | null;
  order: number;
  status: ContentStatus;
  metadata?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
  topic?: TopicItem;
}

export interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  totalAccessCodes: number;
  usedCodes: number;
  unusedCodes: number;
  inactiveCodes: number;
  activeStudents: number;
  pendingStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalContents: number;
}

// Payload Interfaces
export interface CreateSchoolPayload {
  name: string;
  schoolCode: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  status?: SchoolStatus;
}

export interface UpdateSchoolPayload {
  name?: string;
  schoolCode?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  status?: SchoolStatus;
}

export interface CreateSubjectPayload {
  classId: number;
  name: string;
  description?: string;
  order?: number;
  status?: SubjectStatus;
}

export interface UpdateSubjectPayload {
  classId?: number;
  name?: string;
  description?: string;
  order?: number;
  status?: SubjectStatus;
}

export interface CreateChapterPayload {
  subjectId: number;
  name: string;
  description?: string;
  order?: number;
  status?: ChapterStatus;
}

export interface UpdateChapterPayload {
  name?: string;
  description?: string;
  order?: number;
  status?: ChapterStatus;
}

export interface CreateTopicPayload {
  chapterId: number;
  name: string;
  description?: string;
  order?: number;
  status?: TopicStatus;
}

export interface UpdateTopicPayload {
  name?: string;
  description?: string;
  order?: number;
  status?: TopicStatus;
}

export interface CreateContentPayload {
  topicId: number;
  title: string;
  type: ContentType;
  url: string;
  description?: string;
  order?: number;
  status?: ContentStatus;
  metadata?: Record<string, any>;
}

export interface UpdateContentPayload {
  topicId?: number;
  title?: string;
  type?: ContentType;
  url?: string;
  description?: string;
  order?: number;
  status?: ContentStatus;
  metadata?: Record<string, any>;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password?: string;
  status?: AdminStatus;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  password?: string;
  status?: AdminStatus;
}

