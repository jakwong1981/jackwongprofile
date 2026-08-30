// frontend/src/app/admin/education/page.tsx
'use client';

import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EducationForm, emptyEducation } from '@/components/admin/EducationForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { ApiError, toErrorMessage } from '@/lib/api/errors';
import { profileApi } from '@/lib/api/profile';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useAdminProfile } from '@/lib/hooks/useAdminProfile';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateRange } from '@/lib/utils/date';
import { toEducationPayload } from '@/lib/utils/transform';
import type { ValidationErrors } from '@/lib/validation/profileValidation';
import type { Education, EducationPayload } from '@/types/profile';

type EditorTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; education: Education };

/** Academic-background console: list, create, update, and delete degrees. */
export default function AdminEducationPage(): JSX.Element {
  const { t, tx, locale } = useTranslations();
  const { notify } = useToast();
  const { profile, loading: profileLoading, error: profileError } = useAdminProfile();

  const [educations, setEducations] = useState<Education[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [target, setTarget] = useState<EditorTarget>({ mode: 'closed' });
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<ValidationErrors>({});

  const profileId = profile?.id ?? null;

  const reload = useCallback(async (): Promise<void> => {
    if (profileId === null) {
      return;
    }
    setListLoading(true);
    try {
      setEducations(await profileApi.listEducations(profileId));
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    } finally {
      setListLoading(false);
    }
  }, [profileId, notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSubmit = async (payload: EducationPayload): Promise<void> => {
    if (profileId === null) {
      return;
    }
    setSaving(true);
    setServerErrors({});
    try {
      if (target.mode === 'edit') {
        await profileApi.updateEducation(profileId, target.education.id, payload);
      } else {
        await profileApi.createEducation(profileId, payload);
      }
      notify(t('admin.saved'), 'success');
      setTarget({ mode: 'closed' });
      await reload();
    } catch (cause) {
      if (cause instanceof ApiError && cause.errors.length > 0) {
        setServerErrors(Object.fromEntries(cause.errors.map((detail) => [detail.field, detail.message])));
      }
      notify(toErrorMessage(cause), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (education: Education): Promise<void> => {
    if (profileId === null || !window.confirm(t('admin.confirmDelete'))) {
      return;
    }
    try {
      await profileApi.deleteEducation(profileId, education.id);
      notify(t('admin.saved'), 'success');
      await reload();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    }
  };

  if (profileLoading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (profileError !== null || profileId === null) {
    return <EmptyState title={t('common.error')} description={profileError ?? undefined} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.educationEditor')}</h1>
        {target.mode === 'closed' ? (
          <Button
            variant="primary"
            icon={<Plus aria-hidden className="h-4 w-4" />}
            onClick={() => {
              setServerErrors({});
              setTarget({ mode: 'create' });
            }}
          >
            {t('admin.add')}
          </Button>
        ) : null}
      </header>

      {target.mode !== 'closed' ? (
        <EducationForm
          key={target.mode === 'edit' ? `edit-${target.education.id}` : 'create'}
          initialValue={target.mode === 'edit' ? toEducationPayload(target.education) : emptyEducation()}
          saving={saving}
          serverErrors={serverErrors}
          onCancel={() => setTarget({ mode: 'closed' })}
          onSubmit={handleSubmit}
        />
      ) : null}

      {listLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : educations.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<GraduationCap aria-hidden className="h-5 w-5" />} />
      ) : (
        <ol className="flex flex-col gap-3">
          {educations.map((education) => (
            <li key={education.id}>
              <Card className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="truncate text-sm font-semibold tracking-tight text-ink-900">
                    {tx(education.localizedInstitution) || education.institution}
                  </h2>
                  <p className="text-xs text-ink-500">
                    {[tx(education.degree), tx(education.fieldOfStudy)].filter((part) => part !== '').join(' · ')}
                  </p>
                  <p className="text-xs text-ink-400">
                    {formatDateRange(education.startDate, education.endDate, false, locale, t('profile.present'))}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    icon={<Pencil aria-hidden className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setServerErrors({});
                      setTarget({ mode: 'edit', education });
                    }}
                  >
                    {t('admin.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label={t('admin.delete')}
                    onClick={() => void handleDelete(education)}
                  >
                    <Trash2 aria-hidden className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
