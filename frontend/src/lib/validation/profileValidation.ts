// frontend/src/lib/validation/profileValidation.ts
import type { LocalizedText } from '@/types/api';
import type {
  CertificationPayload,
  EducationPayload,
  ExperiencePayload,
  ProfileUpdatePayload,
} from '@/types/profile';

/** Field path → message. An empty object means the payload is valid. */
export type ValidationErrors = Record<string, string>;

/** Mirrors the backend `@Pattern` on `Profile.slug`. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Deliberately permissive: the backend and the mail server are the real authorities. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

function isLocalizedBlank(text: LocalizedText | null | undefined): boolean {
  if (!text) {
    return true;
  }
  return isBlank(text.en) && isBlank(text.zhHant) && isBlank(text.zhHans);
}

/**
 * @param url candidate absolute URL, may be blank
 * @returns `true` when the value is absent or a well-formed http(s) URL
 */
export function isOptionalHttpUrl(url: string | null | undefined): boolean {
  if (isBlank(url)) {
    return true;
  }
  try {
    const parsed = new URL((url as string).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param start ISO start date
 * @param end   ISO end date, may be blank
 * @returns `true` when the range is chronological or open-ended
 */
export function isChronological(start: string | null | undefined, end: string | null | undefined): boolean {
  if (isBlank(start) || isBlank(end)) {
    return true;
  }
  return (start as string) <= (end as string);
}

/**
 * Client-side mirror of the backend validation on the profile write contract. Catching
 * these locally keeps the editor responsive; the server re-checks every rule regardless.
 *
 * @param payload the update about to be submitted
 * @param required localised label for the "field is required" message
 * @returns the field errors, empty when valid
 */
export function validateProfile(payload: ProfileUpdatePayload, required: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(payload.fullName)) {
    errors.fullName = required;
  }
  if (isBlank(payload.slug)) {
    errors.slug = required;
  } else if (!SLUG_PATTERN.test(payload.slug.trim())) {
    errors.slug = 'Use lowercase letters, digits, and single hyphens (e.g. jack-wong)';
  }
  if (!isBlank(payload.email) && !EMAIL_PATTERN.test((payload.email as string).trim())) {
    errors.email = 'Enter a valid email address';
  }

  const urlFields: ReadonlyArray<keyof ProfileUpdatePayload> = [
    'avatarUrl',
    'facebookUrl',
    'instagramUrl',
    'xiaohongshuUrl',
    'linkedinUrl',
    'githubUrl',
    'websiteUrl',
  ];
  for (const field of urlFields) {
    const value = payload[field];
    if (typeof value === 'string' && !isOptionalHttpUrl(value)) {
      errors[field] = 'Enter a full http(s) URL';
    }
  }

  return errors;
}

/**
 * Validates an experience together with each of its nested positions.
 *
 * @param payload  the experience about to be submitted
 * @param required localised "field is required" message
 * @returns field errors keyed by dotted path, e.g. `positions.0.title`
 */
export function validateExperience(payload: ExperiencePayload, required: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(payload.companyName)) {
    errors.companyName = required;
  }
  if (isBlank(payload.startDate) || !ISO_DATE_PATTERN.test(payload.startDate)) {
    errors.startDate = required;
  }
  if (!payload.currentRole && !isChronological(payload.startDate, payload.endDate)) {
    errors.endDate = 'End date must not precede the start date';
  }
  if (!isOptionalHttpUrl(payload.companyUrl)) {
    errors.companyUrl = 'Enter a full http(s) URL';
  }
  if (payload.positions.length === 0) {
    errors.positions = 'Add at least one job title';
  }

  payload.positions.forEach((position, index) => {
    if (isLocalizedBlank(position.title)) {
      errors[`positions.${index}.title`] = required;
    }
    if (isBlank(position.startDate) || !ISO_DATE_PATTERN.test(position.startDate)) {
      errors[`positions.${index}.startDate`] = required;
    }
    if (!position.currentRole && !isChronological(position.startDate, position.endDate)) {
      errors[`positions.${index}.endDate`] = 'End date must not precede the start date';
    }
  });

  return errors;
}

/**
 * @param payload  the education about to be submitted
 * @param required localised "field is required" message
 * @returns the field errors, empty when valid
 */
export function validateEducation(payload: EducationPayload, required: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(payload.institution)) {
    errors.institution = required;
  }
  if (!isChronological(payload.startDate, payload.endDate)) {
    errors.endDate = 'End date must not precede the start date';
  }
  if (!isOptionalHttpUrl(payload.credentialUrl)) {
    errors.credentialUrl = 'Enter a full http(s) URL';
  }

  return errors;
}

/**
 * @param payload  the certification about to be submitted
 * @param required localised "field is required" message
 * @returns the field errors, empty when valid
 */
export function validateCertification(payload: CertificationPayload, required: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isLocalizedBlank(payload.name)) {
    errors.name = required;
  }
  if (isBlank(payload.issuingOrganization)) {
    errors.issuingOrganization = required;
  }
  if (!isChronological(payload.issueDate, payload.expirationDate)) {
    errors.expirationDate = 'Expiration must not precede the issue date';
  }
  if (!isOptionalHttpUrl(payload.credentialUrl)) {
    errors.credentialUrl = 'Enter a full http(s) URL';
  }

  return errors;
}

/** @returns `true` when the validation result contains no entries */
export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
