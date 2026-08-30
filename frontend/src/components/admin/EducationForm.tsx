// frontend/src/components/admin/EducationForm.tsx
'use client';

import { Save, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LocalizedField } from '@/components/admin/LocalizedField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { isValid, validateEducation, type ValidationErrors } from '@/lib/validation/profileValidation';
import type { LocalizedText } from '@/types/api';
import type { EducationPayload } from '@/types/profile';

const EMPTY_LOCALIZED: LocalizedText = { en: null, zhHant: null, zhHans: null };

/** @returns a blank academic record */
export function emptyEducation(): EducationPayload {
  return {
    institution: '',
    localizedInstitution: { ...EMPTY_LOCALIZED },
    degree: { ...EMPTY_LOCALIZED },
    fieldOfStudy: { ...EMPTY_LOCALIZED },
    location: null,
    startDate: null,
    endDate: null,
    grade: null,
    credentialId: null,
    credentialUrl: null,
    description: { ...EMPTY_LOCALIZED },
  };
}

export interface EducationFormProps {
  initialValue: EducationPayload;
  onSubmit: (payload: EducationPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  serverErrors?: ValidationErrors;
}

/** Create/update form for one degree or academic programme. */
export function EducationForm({
  initialValue,
  onSubmit,
  onCancel,
  saving,
  serverErrors = {},
}: EducationFormProps): JSX.Element {
  const { t } = useTranslations();
  const [value, setValue] = useState<EducationPayload>(initialValue);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const merged: ValidationErrors = { ...serverErrors, ...errors };

  const patch = useCallback((changes: Partial<EducationPayload>): void => {
    setValue((current) => ({ ...current, ...changes }));
  }, []);

  const handleSubmit = async (): Promise<void> => {
    const validation = validateEducation(value, t('admin.required'));
    setErrors(validation);
    if (!isValid(validation)) {
      return;
    }
    await onSubmit(value);
  };

  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('admin.institution')}
          value={value.institution}
          required
          error={merged.institution}
          onChange={(event) => patch({ institution: event.target.value })}
        />
        <TextField
          label={t('admin.location')}
          value={value.location ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ location: event.target.value })}
        />
        <TextField
          label={t('admin.startDate')}
          type="date"
          value={value.startDate ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ startDate: event.target.value })}
        />
        <TextField
          label={t('admin.endDate')}
          type="date"
          value={value.endDate ?? ''}
          hint={t('common.optional')}
          error={merged.endDate}
          onChange={(event) => patch({ endDate: event.target.value })}
        />
        <TextField
          label={t('profile.grade')}
          value={value.grade ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ grade: event.target.value })}
        />
        <TextField
          label={t('profile.credentialId')}
          value={value.credentialId ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ credentialId: event.target.value })}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <LocalizedField
          label={t('admin.institution')}
          value={value.localizedInstitution}
          onChange={(next) => patch({ localizedInstitution: next })}
        />
        <LocalizedField label={t('admin.degree')} value={value.degree} onChange={(next) => patch({ degree: next })} />
        <LocalizedField
          label={t('admin.fieldOfStudy')}
          value={value.fieldOfStudy}
          onChange={(next) => patch({ fieldOfStudy: next })}
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
