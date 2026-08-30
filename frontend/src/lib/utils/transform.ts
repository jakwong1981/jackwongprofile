// frontend/src/lib/utils/transform.ts
import type {
  Certification,
  CertificationPayload,
  Education,
  EducationPayload,
  Experience,
  ExperiencePayload,
  Profile,
  ProfileUpdatePayload,
} from '@/types/profile';

/**
 * Projects the read model of a profile onto the write contract accepted by
 * `PUT /api/v1/admin/profiles/{id}` — the nested `contact` object is flattened back out.
 *
 * @param profile profile as delivered by the API
 * @returns the corresponding update payload
 */
export function toProfileUpdatePayload(profile: Profile): ProfileUpdatePayload {
  return {
    slug: profile.slug,
    fullName: profile.fullName,
    localizedFullName: profile.localizedFullName ?? null,
    headline: profile.headline ?? null,
    jobTitle: profile.jobTitle ?? null,
    companyName: profile.companyName ?? null,
    location: profile.location ?? null,
    summary: profile.summary ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    email: profile.contact?.email ?? null,
    phone: profile.contact?.phone ?? null,
    facebookUrl: profile.contact?.facebookUrl ?? null,
    instagramUrl: profile.contact?.instagramUrl ?? null,
    xiaohongshuUrl: profile.contact?.xiaohongshuUrl ?? null,
    linkedinUrl: profile.contact?.linkedinUrl ?? null,
    githubUrl: profile.contact?.githubUrl ?? null,
    websiteUrl: profile.contact?.websiteUrl ?? null,
    published: profile.published,
  };
}

/**
 * Projects an experience read model onto its write contract, preserving child ids so the
 * backend updates rows in place instead of recreating them.
 *
 * @param experience experience as delivered by the API
 * @returns the corresponding write payload
 */
export function toExperiencePayload(experience: Experience): ExperiencePayload {
  return {
    companyName: experience.companyName,
    companyUrl: experience.companyUrl ?? null,
    logoUrl: experience.logoUrl ?? null,
    location: experience.location ?? null,
    employmentType: experience.employmentType ?? null,
    startDate: experience.startDate,
    endDate: experience.currentRole ? null : experience.endDate ?? null,
    currentRole: experience.currentRole,
    description: experience.description ?? null,
    positions: experience.positions.map((position) => ({
      id: position.id,
      title: position.title,
      employmentType: position.employmentType ?? null,
      startDate: position.startDate,
      endDate: position.currentRole ? null : position.endDate ?? null,
      currentRole: position.currentRole,
      responsibilities: position.responsibilities.map((responsibility) => ({
        id: responsibility.id,
        content: responsibility.content,
      })),
    })),
  };
}

/**
 * @param education education as delivered by the API
 * @returns the corresponding write payload
 */
export function toEducationPayload(education: Education): EducationPayload {
  return {
    institution: education.institution,
    localizedInstitution: education.localizedInstitution ?? null,
    degree: education.degree ?? null,
    fieldOfStudy: education.fieldOfStudy ?? null,
    location: education.location ?? null,
    startDate: education.startDate ?? null,
    endDate: education.endDate ?? null,
    grade: education.grade ?? null,
    credentialId: education.credentialId ?? null,
    credentialUrl: education.credentialUrl ?? null,
    description: education.description ?? null,
  };
}

/**
 * @param certification certification as delivered by the API
 * @returns the corresponding write payload
 */
export function toCertificationPayload(certification: Certification): CertificationPayload {
  return {
    name: certification.name,
    issuingOrganization: certification.issuingOrganization,
    issueDate: certification.issueDate ?? null,
    expirationDate: certification.expirationDate ?? null,
    credentialId: certification.credentialId ?? null,
    credentialUrl: certification.credentialUrl ?? null,
    description: certification.description ?? null,
  };
}

/**
 * Moves an item within an array, returning a new array. Out-of-range moves are no-ops,
 * which is what the "move up" button on the first row should do.
 *
 * @param items source array
 * @param from  current index
 * @param to    target index
 * @returns a new array with the item relocated
 */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) {
    return [...items];
  }
  next.splice(to, 0, moved);
  return next;
}
