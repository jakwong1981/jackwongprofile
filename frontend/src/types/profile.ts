// frontend/src/types/profile.ts
import type { LocalizedText } from '@/types/api';

/** Public contact channels rendered on the profile. */
export interface Contact {
  email?: string | null;
  phone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  xiaohongshuUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
}

/** One duty / achievement bullet under a job title. */
export interface Responsibility {
  id: number;
  content: LocalizedText;
  displayOrder: number;
}

/** One job title held at an employer. */
export interface Position {
  id: number;
  title: LocalizedText;
  employmentType?: string | null;
  startDate: string;
  endDate?: string | null;
  currentRole: boolean;
  displayOrder: number;
  responsibilities: Responsibility[];
}

/** One employer with the ordered list of titles held there. */
export interface Experience {
  id: number;
  companyName: string;
  companyUrl?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  employmentType?: string | null;
  startDate: string;
  endDate?: string | null;
  currentRole: boolean;
  description?: LocalizedText | null;
  displayOrder: number;
  positions: Position[];
}

/** One academic record. */
export interface Education {
  id: number;
  institution: string;
  localizedInstitution?: LocalizedText | null;
  degree?: LocalizedText | null;
  fieldOfStudy?: LocalizedText | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: LocalizedText | null;
  displayOrder: number;
}

/** One professional credential. */
export interface Certification {
  id: number;
  name: LocalizedText;
  issuingOrganization: string;
  issueDate?: string | null;
  expirationDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: LocalizedText | null;
  displayOrder: number;
}

/** Full profile aggregate as delivered by `GET /api/v1/public/profile`. */
export interface Profile {
  id: number;
  slug: string;
  fullName: string;
  localizedFullName?: LocalizedText | null;
  headline?: LocalizedText | null;
  jobTitle?: LocalizedText | null;
  companyName?: string | null;
  location?: string | null;
  summary?: LocalizedText | null;
  avatarUrl?: string | null;
  published: boolean;
  contact: Contact;
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  updatedAt: string;
}

/** Write contract for `PUT /api/v1/admin/profiles/{id}`. */
export interface ProfileUpdatePayload {
  slug: string;
  fullName: string;
  localizedFullName?: LocalizedText | null;
  headline?: LocalizedText | null;
  jobTitle?: LocalizedText | null;
  companyName?: string | null;
  location?: string | null;
  summary?: LocalizedText | null;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  xiaohongshuUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  published?: boolean;
}

/** Write contract for a responsibility inside {@link ExperiencePayload}. */
export interface ResponsibilityPayload {
  id?: number | null;
  content: LocalizedText;
}

/** Write contract for a job title inside {@link ExperiencePayload}. */
export interface PositionPayload {
  id?: number | null;
  title: LocalizedText;
  employmentType?: string | null;
  startDate: string;
  endDate?: string | null;
  currentRole: boolean;
  responsibilities: ResponsibilityPayload[];
}

/** Write contract for `POST`/`PUT` on the experience resource. */
export interface ExperiencePayload {
  companyName: string;
  companyUrl?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  employmentType?: string | null;
  startDate: string;
  endDate?: string | null;
  currentRole: boolean;
  description?: LocalizedText | null;
  positions: PositionPayload[];
}

/** Write contract for `POST`/`PUT` on the education resource. */
export interface EducationPayload {
  institution: string;
  localizedInstitution?: LocalizedText | null;
  degree?: LocalizedText | null;
  fieldOfStudy?: LocalizedText | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: LocalizedText | null;
}

/** Write contract for `POST`/`PUT` on the certification resource. */
export interface CertificationPayload {
  name: LocalizedText;
  issuingOrganization: string;
  issueDate?: string | null;
  expirationDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: LocalizedText | null;
}
