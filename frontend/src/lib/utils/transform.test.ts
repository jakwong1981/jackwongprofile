// frontend/src/lib/utils/transform.test.ts
import { describe, expect, it } from 'vitest';
import {
  moveItem,
  toCertificationPayload,
  toEducationPayload,
  toExperiencePayload,
  toProfileUpdatePayload,
} from '@/lib/utils/transform';
import type { Certification, Education, Experience, Profile } from '@/types/profile';

const experience: Experience = {
  id: 7,
  companyName: 'Acme Corp',
  companyUrl: 'https://acme.test',
  logoUrl: null,
  location: 'Hong Kong',
  employmentType: 'Full-time',
  startDate: '2020-03-01',
  endDate: '2023-01-01',
  currentRole: true,
  description: { en: 'Platform team', zhHant: null, zhHans: null },
  displayOrder: 0,
  positions: [
    {
      id: 11,
      title: { en: 'Engineer', zhHant: '工程師', zhHans: null },
      employmentType: null,
      startDate: '2020-03-01',
      endDate: '2021-06-01',
      currentRole: false,
      displayOrder: 0,
      responsibilities: [{ id: 21, content: { en: 'Built things', zhHant: null, zhHans: null }, displayOrder: 0 }],
    },
  ],
};

const profile: Profile = {
  id: 1,
  slug: 'jack-wong',
  fullName: 'Jack Wong',
  localizedFullName: { en: 'Jack Wong', zhHant: '黃杰克', zhHans: null },
  headline: null,
  jobTitle: null,
  companyName: 'Acme Corp',
  location: 'Hong Kong',
  summary: { en: '# Hi', zhHant: null, zhHans: null },
  avatarUrl: null,
  published: true,
  contact: {
    email: 'jack@example.test',
    phone: '+852 1234 5678',
    facebookUrl: 'https://facebook.test/jack',
    instagramUrl: null,
    xiaohongshuUrl: null,
    linkedinUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
  experiences: [experience],
  educations: [],
  certifications: [],
  updatedAt: '2024-05-01T00:00:00Z',
};

describe('toProfileUpdatePayload', () => {
  it('flattens the nested contact object', () => {
    const payload = toProfileUpdatePayload(profile);
    expect(payload.email).toBe('jack@example.test');
    expect(payload.phone).toBe('+852 1234 5678');
    expect(payload.facebookUrl).toBe('https://facebook.test/jack');
  });

  it('carries the identity fields through unchanged', () => {
    const payload = toProfileUpdatePayload(profile);
    expect(payload.slug).toBe('jack-wong');
    expect(payload.fullName).toBe('Jack Wong');
    expect(payload.published).toBe(true);
  });

  it('normalises absent optional values to null', () => {
    const payload = toProfileUpdatePayload(profile);
    expect(payload.headline).toBeNull();
    expect(payload.instagramUrl).toBeNull();
  });

  it('produces no nested contact key', () => {
    expect(toProfileUpdatePayload(profile)).not.toHaveProperty('contact');
  });
});

describe('toExperiencePayload', () => {
  it('preserves child ids so rows are updated in place', () => {
    const payload = toExperiencePayload(experience);
    expect(payload.positions[0]?.id).toBe(11);
    expect(payload.positions[0]?.responsibilities[0]?.id).toBe(21);
  });

  it('clears the end date when the entry is marked current', () => {
    expect(toExperiencePayload(experience).endDate).toBeNull();
  });

  it('keeps the end date on a position that is not current', () => {
    expect(toExperiencePayload(experience).positions[0]?.endDate).toBe('2021-06-01');
  });

  it('drops the read-only display order', () => {
    expect(toExperiencePayload(experience)).not.toHaveProperty('displayOrder');
  });
});

describe('toEducationPayload', () => {
  it('normalises absent optional values to null', () => {
    const education: Education = {
      id: 3,
      institution: 'HKU',
      localizedInstitution: null,
      degree: null,
      fieldOfStudy: null,
      location: null,
      startDate: '2015-09-01',
      endDate: null,
      grade: null,
      credentialId: null,
      credentialUrl: null,
      description: null,
      displayOrder: 0,
    };
    const payload = toEducationPayload(education);
    expect(payload.institution).toBe('HKU');
    expect(payload.endDate).toBeNull();
    expect(payload).not.toHaveProperty('id');
  });
});

describe('toCertificationPayload', () => {
  it('carries the credential metadata across', () => {
    const certification: Certification = {
      id: 5,
      name: { en: 'AWS SAA', zhHant: null, zhHans: null },
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2023-02-01',
      expirationDate: null,
      credentialId: 'ABC-123',
      credentialUrl: 'https://verify.test/ABC-123',
      description: null,
      displayOrder: 0,
    };
    const payload = toCertificationPayload(certification);
    expect(payload.issuingOrganization).toBe('Amazon Web Services');
    expect(payload.credentialId).toBe('ABC-123');
    expect(payload).not.toHaveProperty('displayOrder');
  });
});

describe('moveItem', () => {
  const items = ['a', 'b', 'c'] as const;

  it('moves an item forward', () => {
    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('moves an item backward', () => {
    expect(moveItem(items, 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when the indices match', () => {
    expect(moveItem(items, 1, 1)).toEqual(['a', 'b', 'c']);
  });

  it('is a no-op for out-of-range indices', () => {
    expect(moveItem(items, -1, 1)).toEqual(['a', 'b', 'c']);
    expect(moveItem(items, 0, 9)).toEqual(['a', 'b', 'c']);
  });

  it('never mutates the source array', () => {
    const source = ['a', 'b', 'c'];
    moveItem(source, 0, 2);
    expect(source).toEqual(['a', 'b', 'c']);
  });
});
