// frontend/src/app/admin/experience/page.tsx
'use client';

import { Building2, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ExperienceForm, emptyExperience } from '@/components/admin/ExperienceForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { ApiError, toErrorMessage } from '@/lib/api/errors';
import { profileApi } from '@/lib/api/profile';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useAdminProfile } from '@/lib/hooks/useAdminProfile';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateRange } from '@/lib/utils/date';
import { moveItem, toExperiencePayload } from '@/lib/utils/transform';
import type { ValidationErrors } from '@/lib/validation/profileValidation';
import type { Experience, ExperiencePayload } from '@/types/profile';

/** Which record the form is bound to: nothing, a new row, or an existing id. */
type EditorTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; experience: Experience };

/**
 * Work-experience console: an ordered list of employers with inline reordering, plus the
 * create/update form. Ordering is persisted through the dedicated `reorder` endpoint so a
 * move is one request rather than a full rewrite of every row.
 */
export default function AdminExperiencePage(): JSX.Element {
  const { t, tx, locale } = useTranslations();
  const { notify } = useToast();
  const { profile, loading: profileLoading, error: profileError } = useAdminProfile();

  const [experiences, setExperiences] = useState<Experience[]>([]);
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
      setExperiences(await profileApi.listExperiences(profileId));
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    } finally {
      setListLoading(false);
    }
  }, [profileId, notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSubmit = async (payload: ExperiencePayload): Promise<void> => {
    if (profileId === null) {
      return;
    }
    setSaving(true);
    setServerErrors({});
    try {
      if (target.mode === 'edit') {
        await profileApi.updateExperience(profileId, target.experience.id, payload);
      } else {
        await profileApi.createExperience(profileId, payload);
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

  const handleDelete = async (experience: Experience): Promise<void> => {
    if (profileId === null || !window.confirm(t('admin.confirmDelete'))) {
      return;
    }
    try {
      await profileApi.deleteExperience(profileId, experience.id);
      notify(t('admin.saved'), 'success');
      await reload();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    }
  };

  const handleMove = async (index: number, direction: -1 | 1): Promise<void> => {
    if (profileId === null) {
      return;
    }
    const reordered = moveItem(experiences, index, index + direction);
    // Optimistic: the list snaps immediately and is reconciled from the response.
    setExperiences(reordered);
    try {
      setExperiences(await profileApi.reorderExperiences(profileId, reordered.map((item) => item.id)));
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
      await reload();
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
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.experienceEditor')}</h1>
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
        <ExperienceForm
          key={target.mode === 'edit' ? `edit-${target.experience.id}` : 'create'}
          initialValue={target.mode === 'edit' ? toExperiencePayload(target.experience) : emptyExperience()}
          saving={saving}
          serverErrors={serverErrors}
          onCancel={() => setTarget({ mode: 'closed' })}
          onSubmit={handleSubmit}
        />
      ) : null}

      {listLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : experiences.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<Building2 aria-hidden className="h-5 w-5" />} />
      ) : (
        <ol className="flex flex-col gap-3">
          {experiences.map((experience, index) => (
            <li key={experience.id}>
              <Card className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="truncate text-sm font-semibold tracking-tight text-ink-900">
                    {experience.companyName}
                  </h2>
                  <p className="text-xs text-ink-400">
                    {formatDateRange(
                      experience.startDate,
                      experience.endDate,
                      experience.currentRole,
                      locale,
                      t('profile.present'),
                    )}
                  </p>
                  <ul className="mt-1 flex flex-col gap-0.5 text-xs text-ink-500">
                    {experience.positions.map((position) => (
                      <li key={position.id}>
                        · {tx(position.title)} ({position.responsibilities.length})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t('admin.moveUp')}
                    disabled={index === 0}
                    onClick={() => void handleMove(index, -1)}
                  >
                    <ChevronUp aria-hidden className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t('admin.moveDown')}
                    disabled={index === experiences.length - 1}
                    onClick={() => void handleMove(index, 1)}
                  >
                    <ChevronDown aria-hidden className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    icon={<Pencil aria-hidden className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setServerErrors({});
                      setTarget({ mode: 'edit', experience });
                    }}
                  >
                    {t('admin.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label={t('admin.delete')}
                    onClick={() => void handleDelete(experience)}
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
