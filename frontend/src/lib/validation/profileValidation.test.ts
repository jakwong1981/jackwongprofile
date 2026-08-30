// frontend/src/lib/validation/profileValidation.test.ts
import { describe, expect, it } from 'vitest';
import {
  isChronological,
  isOptionalHttpUrl,
  isValid,
  validateCertification,
  validateEducation,
  validateExperience,
  validateProfile,
} from '@/lib/validation/profileValidation';
import type { CertificationPayload, EducationPayload, ExperiencePayload, ProfileUpdatePayload } from '@/types/profile';

const REQUIRED = 'This field is required';

function baseProfile(): ProfileUpdatePayload {
  return { slug: 'jack-wong', fullName: 'Jack Wong' };
}

function baseExperience(): ExperiencePayload {
  return {
    companyName: 'Acme',
    startDate: '2020-01-01',
    endDate: null,
    currentRole: true,
    positions: [
      {
        title: { en: 'Engineer', zhHant: null, zhHans: null },
        startDate: '2020-01-01',
        endDate: null,
        currentRole: true,
        responsibilities: [],
      },
    ],
  };
}

describe('isOptionalHttpUrl', () => {
  it('accepts blank values', () => {
    expect(isOptionalHttpUrl('')).toBe(true);
    expect(isOptionalHttpUrl(null)).toBe(true);
    expect(isOptionalHttpUrl(undefined)).toBe(true);
  });

  it('accepts http and https URLs', () => {
    expect(isOptionalHttpUrl('http://a.test')).toBe(true);
    expect(isOptionalHttpUrl('https://a.test/path?q=1')).toBe(true);
  });

  it('rejects other protocols and malformed values', () => {
    expect(isOptionalHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isOptionalHttpUrl('ftp://a.test')).toBe(false);
    expect(isOptionalHttpUrl('not a url')).toBe(false);
  });
});

describe('isChronological', () => {
  it('accepts an ordered range', () => {
    expect(isChronological('2020-01-01', '2021-01-01')).toBe(true);
  });

  it('accepts identical bounds', () => {
    expect(isChronological('2020-01-01', '2020-01-01')).toBe(true);
  });

  it('accepts an open-ended range', () => {
    expect(isChronological('2020-01-01', null)).toBe(true);
    expect(isChronological(null, '2020-01-01')).toBe(true);
  });

  it('rejects an inverted range', () => {
    expect(isChronological('2021-01-01', '2020-01-01')).toBe(false);
  });
});

describe('validateProfile', () => {
  it('accepts a minimal valid payload', () => {
    expect(isValid(validateProfile(baseProfile(), REQUIRED))).toBe(true);
  });

  it('requires the full name', () => {
    expect(validateProfile({ ...baseProfile(), fullName: '  ' }, REQUIRED).fullName).toBe(REQUIRED);
  });

  it('requires the slug', () => {
    expect(validateProfile({ ...baseProfile(), slug: '' }, REQUIRED).slug).toBe(REQUIRED);
  });

  it('rejects a slug that is not lowercase kebab-case', () => {
    expect(validateProfile({ ...baseProfile(), slug: 'Jack Wong' }, REQUIRED).slug).toBeDefined();
    expect(validateProfile({ ...baseProfile(), slug: 'jack--wong' }, REQUIRED).slug).toBeDefined();
    expect(validateProfile({ ...baseProfile(), slug: '-jack' }, REQUIRED).slug).toBeDefined();
  });

  it('accepts a well-formed email and rejects a malformed one', () => {
    expect(validateProfile({ ...baseProfile(), email: 'a@b.co' }, REQUIRED).email).toBeUndefined();
    expect(validateProfile({ ...baseProfile(), email: 'a@b' }, REQUIRED).email).toBeDefined();
  });

  it('rejects a social link that is not an http(s) URL', () => {
    expect(validateProfile({ ...baseProfile(), githubUrl: 'javascript:alert(1)' }, REQUIRED).githubUrl).toBeDefined();
  });

  it('ignores blank optional URLs', () => {
    expect(isValid(validateProfile({ ...baseProfile(), websiteUrl: '' }, REQUIRED))).toBe(true);
  });
});

describe('validateExperience', () => {
  it('accepts a well-formed payload', () => {
    expect(isValid(validateExperience(baseExperience(), REQUIRED))).toBe(true);
  });

  it('requires the company name', () => {
    expect(validateExperience({ ...baseExperience(), companyName: '' }, REQUIRED).companyName).toBe(REQUIRED);
  });

  it('requires an ISO start date', () => {
    expect(validateExperience({ ...baseExperience(), startDate: '01/2020' }, REQUIRED).startDate).toBe(REQUIRED);
  });

  it('rejects an end date that precedes the start', () => {
    const payload: ExperiencePayload = {
      ...baseExperience(),
      currentRole: false,
      endDate: '2019-01-01',
    };
    expect(validateExperience(payload, REQUIRED).endDate).toBeDefined();
  });

  it('ignores the end date entirely when the role is current', () => {
    const payload: ExperiencePayload = { ...baseExperience(), currentRole: true, endDate: '2019-01-01' };
    expect(validateExperience(payload, REQUIRED).endDate).toBeUndefined();
  });

  it('requires at least one job title', () => {
    expect(validateExperience({ ...baseExperience(), positions: [] }, REQUIRED).positions).toBeDefined();
  });

  it('requires a title in at least one locale', () => {
    const payload = baseExperience();
    const errors = validateExperience(
      {
        ...payload,
        positions: [{ ...payload.positions[0]!, title: { en: null, zhHant: null, zhHans: null } }],
      },
      REQUIRED,
    );
    expect(errors['positions.0.title']).toBe(REQUIRED);
  });

  it('accepts a title supplied in any single locale', () => {
    const payload = baseExperience();
    const errors = validateExperience(
      {
        ...payload,
        positions: [{ ...payload.positions[0]!, title: { en: null, zhHant: '工程師', zhHans: null } }],
      },
      REQUIRED,
    );
    expect(errors['positions.0.title']).toBeUndefined();
  });

  it('reports a nested position date error under its indexed path', () => {
    const payload = baseExperience();
    const errors = validateExperience(
      {
        ...payload,
        positions: [{ ...payload.positions[0]!, currentRole: false, endDate: '2019-01-01' }],
      },
      REQUIRED,
    );
    expect(errors['positions.0.endDate']).toBeDefined();
  });
});

describe('validateEducation', () => {
  const base: EducationPayload = { institution: 'HKU' };

  it('accepts a minimal payload', () => {
    expect(isValid(validateEducation(base, REQUIRED))).toBe(true);
  });

  it('requires the institution', () => {
    expect(validateEducation({ institution: ' ' }, REQUIRED).institution).toBe(REQUIRED);
  });

  it('rejects an inverted date range', () => {
    expect(
      validateEducation({ ...base, startDate: '2020-01-01', endDate: '2019-01-01' }, REQUIRED).endDate,
    ).toBeDefined();
  });

  it('rejects a malformed credential URL', () => {
    expect(validateEducation({ ...base, credentialUrl: 'nope' }, REQUIRED).credentialUrl).toBeDefined();
  });
});

describe('validateCertification', () => {
  const base: CertificationPayload = {
    name: { en: 'AWS SAA', zhHant: null, zhHans: null },
    issuingOrganization: 'AWS',
  };

  it('accepts a minimal payload', () => {
    expect(isValid(validateCertification(base, REQUIRED))).toBe(true);
  });

  it('requires a name in at least one locale', () => {
    expect(
      validateCertification({ ...base, name: { en: '', zhHant: null, zhHans: null } }, REQUIRED).name,
    ).toBe(REQUIRED);
  });

  it('requires the issuing organisation', () => {
    expect(validateCertification({ ...base, issuingOrganization: '' }, REQUIRED).issuingOrganization).toBe(REQUIRED);
  });

  it('rejects an expiration that precedes the issue date', () => {
    expect(
      validateCertification({ ...base, issueDate: '2023-01-01', expirationDate: '2022-01-01' }, REQUIRED)
        .expirationDate,
    ).toBeDefined();
  });
});

describe('isValid', () => {
  it('is true only for an empty error map', () => {
    expect(isValid({})).toBe(true);
    expect(isValid({ field: 'message' })).toBe(false);
  });
});
