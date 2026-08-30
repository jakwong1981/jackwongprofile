// frontend/src/app/admin/certifications/page.tsx
'use client';

import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CertificationForm, emptyCertification } from '@/components/admin/CertificationForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { ApiError, toErrorMessage } from '@/lib/api/errors';
import { profileApi } from '@/lib/api/profile';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useAdminProfile } from '@/lib/hooks/useAdminProfile';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatMonthYear } from '@/lib/utils/date';
import { toCertificationPayload } from '@/lib/utils/transform';
import type { ValidationErrors } from '@/lib/validation/profileValidation';
import type { Certification, CertificationPayload } from '@/types/profile';

type EditorTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; certification: Certification };

/** Credential console: list, create, update, and delete professional certifications. */
export default function AdminCertificationsPage(): JSX.Element {
  const { t, tx, locale } = useTranslations();
  const { notify } = useToast();
  const { profile, loading: profileLoading, error: profileError } = useAdminProfile();

  const [certifications, setCertifications] = useState<Certification[]>([]);
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
      setCertifications(await profileApi.listCertifications(profileId));
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    } finally {
      setListLoading(false);
    }
  }, [profileId, notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSubmit = async (payload: CertificationPayload): Promise<void> => {
    if (profileId === null) {
      return;
    }
    setSaving(true);
    setServerErrors({});
    try {
      if (target.mode === 'edit') {
        await profileApi.updateCertification(profileId, target.certification.id, payload);
      } else {
        await profileApi.createCertification(profileId, payload);
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

  const handleDelete = async (certification: Certification): Promise<void> => {
    if (profileId === null || !window.confirm(t('admin.confirmDelete'))) {
      return;
    }
    try {
      await profileApi.deleteCertification(profileId, certification.id);
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
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.certificationEditor')}</h1>
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
        <CertificationForm
          key={target.mode === 'edit' ? `edit-${target.certification.id}` : 'create'}
          initialValue={
            target.mode === 'edit' ? toCertificationPayload(target.certification) : emptyCertification()
          }
          saving={saving}
          serverErrors={serverErrors}
          onCancel={() => setTarget({ mode: 'closed' })}
          onSubmit={handleSubmit}
        />
      ) : null}

      {listLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : certifications.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<Award aria-hidden className="h-5 w-5" />} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {certifications.map((certification) => (
            <li key={certification.id}>
              <Card className="flex h-full flex-col gap-2 p-4">
                <h2 className="text-sm font-semibold leading-snug tracking-tight text-ink-900">
                  {tx(certification.name)}
                </h2>
                <p className="text-xs text-ink-500">{certification.issuingOrganization}</p>
                <p className="text-[0.7rem] tabular-nums text-ink-400">
                  {[
                    formatMonthYear(certification.issueDate, locale),
                    formatMonthYear(certification.expirationDate, locale),
                  ]
                    .filter((part) => part !== '')
                    .join(' – ')}
                </p>

                <div className="mt-auto flex items-center justify-end gap-1 pt-2">
                  <Button
                    size="sm"
                    icon={<Pencil aria-hidden className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setServerErrors({});
                      setTarget({ mode: 'edit', certification });
                    }}
                  >
                    {t('admin.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label={t('admin.delete')}
                    onClick={() => void handleDelete(certification)}
                  >
                    <Trash2 aria-hidden className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
