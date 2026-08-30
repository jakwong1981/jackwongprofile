// frontend/src/lib/api/profile.ts
import { apiRequest } from '@/lib/api/client';
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

/** Every HTTP call to the profile resource lives here; UI components never call `fetch`. */
export const profileApi = {
  /**
   * @param revalidateSeconds ISR window for the public site; omit for always-fresh reads
   * @returns the profile backing the public site
   */
  getPublicProfile(revalidateSeconds?: number): Promise<Profile> {
    return apiRequest<Profile>('/api/v1/public/profile',
      revalidateSeconds === undefined ? {} : { revalidateSeconds });
  },

  getPublicProfileBySlug(slug: string): Promise<Profile> {
    return apiRequest<Profile>(`/api/v1/public/profile/${encodeURIComponent(slug)}`);
  },

  getCurrentProfile(): Promise<Profile> {
    return apiRequest<Profile>('/api/v1/admin/profiles/current', { authenticated: true });
  },

  updateProfile(profileId: number, payload: ProfileUpdatePayload): Promise<Profile> {
    return apiRequest<Profile>(`/api/v1/admin/profiles/${profileId}`, {
      method: 'PUT',
      body: payload,
      authenticated: true,
    });
  },

  listExperiences(profileId: number): Promise<Experience[]> {
    return apiRequest<Experience[]>(`/api/v1/admin/profiles/${profileId}/experiences`, { authenticated: true });
  },

  createExperience(profileId: number, payload: ExperiencePayload): Promise<Experience> {
    return apiRequest<Experience>(`/api/v1/admin/profiles/${profileId}/experiences`, {
      method: 'POST',
      body: payload,
      authenticated: true,
    });
  },

  updateExperience(profileId: number, experienceId: number, payload: ExperiencePayload): Promise<Experience> {
    return apiRequest<Experience>(`/api/v1/admin/profiles/${profileId}/experiences/${experienceId}`, {
      method: 'PUT',
      body: payload,
      authenticated: true,
    });
  },

  deleteExperience(profileId: number, experienceId: number): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/profiles/${profileId}/experiences/${experienceId}`, {
      method: 'DELETE',
      authenticated: true,
    });
  },

  reorderExperiences(profileId: number, orderedIds: number[]): Promise<Experience[]> {
    return apiRequest<Experience[]>(`/api/v1/admin/profiles/${profileId}/experiences/reorder`, {
      method: 'PATCH',
      body: { orderedIds },
      authenticated: true,
    });
  },

  listEducations(profileId: number): Promise<Education[]> {
    return apiRequest<Education[]>(`/api/v1/admin/profiles/${profileId}/educations`, { authenticated: true });
  },

  createEducation(profileId: number, payload: EducationPayload): Promise<Education> {
    return apiRequest<Education>(`/api/v1/admin/profiles/${profileId}/educations`, {
      method: 'POST',
      body: payload,
      authenticated: true,
    });
  },

  updateEducation(profileId: number, educationId: number, payload: EducationPayload): Promise<Education> {
    return apiRequest<Education>(`/api/v1/admin/profiles/${profileId}/educations/${educationId}`, {
      method: 'PUT',
      body: payload,
      authenticated: true,
    });
  },

  deleteEducation(profileId: number, educationId: number): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/profiles/${profileId}/educations/${educationId}`, {
      method: 'DELETE',
      authenticated: true,
    });
  },

  listCertifications(profileId: number): Promise<Certification[]> {
    return apiRequest<Certification[]>(`/api/v1/admin/profiles/${profileId}/certifications`, {
      authenticated: true,
    });
  },

  createCertification(profileId: number, payload: CertificationPayload): Promise<Certification> {
    return apiRequest<Certification>(`/api/v1/admin/profiles/${profileId}/certifications`, {
      method: 'POST',
      body: payload,
      authenticated: true,
    });
  },

  updateCertification(
    profileId: number,
    certificationId: number,
    payload: CertificationPayload,
  ): Promise<Certification> {
    return apiRequest<Certification>(`/api/v1/admin/profiles/${profileId}/certifications/${certificationId}`, {
      method: 'PUT',
      body: payload,
      authenticated: true,
    });
  },

  deleteCertification(profileId: number, certificationId: number): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/profiles/${profileId}/certifications/${certificationId}`, {
      method: 'DELETE',
      authenticated: true,
    });
  },
};
