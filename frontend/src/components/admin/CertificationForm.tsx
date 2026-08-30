// frontend/src/components/admin/CertificationForm.tsx
'use client';

import { Save, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LocalizedField } from '@/components/admin/LocalizedField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { isValid, validateCertification, type ValidationErrors } from '@/lib/validation/profileValidation';
import type { LocalizedText } from '@/types/api';
import type { CertificationPayload } from '@/types/profile';

const EMPTY_LOCALIZED: LocalizedText = { en: null, zhHant: null, zhHans: null };

/** @returns a blank credential record */
export function emptyCertification(): CertificationPayload {
  return {
    name: { ...EMPTY_LOCALIZED },
    issuingOrganization: '',
    issueDate: null,
    expirationDate: null,
    credentialId: null,
    credentialUrl: null,
    description: { ...EMPTY_LOCALIZED },
  };
}

export interface CertificationFormProps {
  initialValue: CertificationPayload;
  onSubmit: (payload: CertificationPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  serverErrors?: ValidationErrors;
}

/** Create/update form for one professional credential. */
export function CertificationForm({
  initialValue,
  onSubmit,
  onCancel,
  saving,
  serverErrors = {},
}: CertificationFormProps): JSX.Element {
  const { t } = useTranslations();
  const [value, setValue] = useState<CertificationPayload>(initialValue);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const merged: ValidationErrors = { ...serverErrors, ...errors };

  const patch = useCallback((changes: Partial<CertificationPayload>): void => {
    setValue((current) => ({ ...current, ...changes }));
  }, []);

  const handleSubmit = async (): Promise<void> => {
    const validation = validateCertification(value, t('admin.required'));
    setErrors(validation);
    if (!isValid(validation)) {
      return;
    }
    await onSubmit(value);
  };

  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <LocalizedField
        label={t('admin.certificationEditor')}
        value={value.name}
        error={merged.name}
        onChange={(next) => patch({ name: next })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('admin.issuer')}
          value={value.issuingOrganization}
          required
          error={merged.issuingOrganization}
          onChange={(event) => patch({ issuingOrganization: event.target.value })}
        />
        <TextField
          label={t('profile.credentialId')}
          value={value.credentialId ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ credentialId: event.target.value })}
        />
        <TextField
          label={t('admin.issueDate')}
          type="date"
          value={value.issueDate ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ issueDate: event.target.value })}
        />
        <TextField
          label={t('admin.expirationDate')}
          type="date"
          value={value.expirationDate ?? ''}
          hint={t('common.optional')}
          error={merged.expirationDate}
          onChange={(event) => patch({ expirationDate: event.target.value })}
        />
        <TextField
          label={t('admin.credentialUrl')}
          value={value.credentialUrl ?? ''}
          hint={t('common.optional')}
          error={merged.credentialUrl}
          containerClassName="sm:col-span-2"
          onChange={(event) => patch({ credentialUrl: event.target.value })}
        />
      </div>

      <LocalizedField
        label={t('admin.description')}
        value={value.description}
        multiline
        rows={3}
        onChange={(next) => patch({ description: next })}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-ink-200/70 pt-4">
        <Button variant="ghost" icon={<X aria-hidden className="h-4 w-4" />} onClick={onCancel}>
          {t('admin.cancel')}
        </Button>
        <Button
          variant="primary"
          loading={saving}
          icon={<Save aria-hidden className="h-4 w-4" />}
          onClick={() => void handleSubmit()}
        >
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </div>
    </Card>
  );
}
