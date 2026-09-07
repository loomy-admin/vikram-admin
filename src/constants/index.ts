export const APP_NAME = 'Student Learning Platform';
export const ADMIN_ROLE_LABEL = 'Administrator';

export const CONTENT_TYPE_LABELS = {
  VIDEO: 'Video',
  PDF: 'PDF Document',
  WEB_LINK: 'Web Link',
} as const;

export const CONTENT_TYPE_COLORS = {
  VIDEO: 'bg-red-50 text-red-700 border-red-200',
  PDF: 'bg-amber-50 text-amber-700 border-amber-200',
  WEB_LINK: 'bg-red-50 text-red-700 border-red-200',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
