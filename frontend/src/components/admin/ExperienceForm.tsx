// frontend/src/components/admin/ExperienceForm.tsx
'use client';

import { ChevronDown, ChevronUp, Plus, Save, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LocalizedField } from '@/components/admin/LocalizedField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckboxField, TextField } from '@/components/ui/Field';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { moveItem } from '@/lib/utils/transform';
import { isValid, validateExperience, type ValidationErrors } from '@/lib/validation/profileValidation';
import type { LocalizedText } from '@/types/api';
import type { ExperiencePayload, PositionPayload, ResponsibilityPayload } from '@/types/profile';

const EMPTY_LOCALIZED: LocalizedText = { en: null, zhHant: null, zhHans: null };

/** @returns a blank position row, defaulting its start date to the parent's */
export function emptyPosition(startDate: string): PositionPayload {
  return {
    id: null,
    title: { ...EMPTY_LOCALIZED },
    employmentType: null,
    startDate,
    endDate: null,
    currentRole: false,
    responsibilities: [],
  };
}

/** @returns a blank experience with one empty job title already in place */
export function emptyExperience(): ExperiencePayload {
  const today = new Date().toISOString().slice(0, 10);
  return {
    companyName: '',
    companyUrl: null,
    logoUrl: null,
    location: null,
    employmentType: null,
    startDate: today,
    endDate: null,
    currentRole: true,
    description: { ...EMPTY_LOCALIZED },
    positions: [emptyPosition(today)],
  };
}

export interface ExperienceFormProps {
  initialValue: ExperiencePayload;
  onSubmit: (payload: ExperiencePayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  /** Field errors reported by the backend, merged with the local ones. */
  serverErrors?: ValidationErrors;
}

/**
 * Create/update form for one employer and every job title held there.
 *
 * Positions carry their `id` through the round trip so the backend updates rows in place;
 * a position added here has `id: null` and is inserted.
 */
export function ExperienceForm({
  initialValue,
  onSubmit,
  onCancel,
  saving,
  serverErrors = {},
}: ExperienceFormProps): JSX.Element {
  const { t } = useTranslations();
  const [value, setValue] = useState<ExperiencePayload>(initialValue);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const merged: ValidationErrors = { ...serverErrors, ...errors };

  const patch = useCallback((changes: Partial<ExperiencePayload>): void => {
    setValue((current) => ({ ...current, ...changes }));
  }, []);

  const patchPosition = useCallback((index: number, changes: Partial<PositionPayload>): void => {
    setValue((current) => ({
      ...current,
      positions: current.positions.map((position, i) => (i === index ? { ...position, ...changes } : position)),
    }));
  }, []);

  const handleSubmit = async (): Promise<void> => {
    const validation = validateExperience(value, t('admin.required'));
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
          label={t('admin.companyName')}
          value={value.companyName}
          required
          error={merged.companyName}
          onChange={(event) => patch({ companyName: event.target.value })}
        />
        <TextField
          label="Company URL"
          value={value.companyUrl ?? ''}
          hint={t('common.optional')}
          error={merged.companyUrl}
          onChange={(event) => patch({ companyUrl: event.target.value })}
        />
        <TextField
          label={t('admin.location')}
          value={value.location ?? ''}
          hint={t('common.optional')}
          onChange={(event) => patch({ location: event.target.value })}
        />
        <TextField
          label="Employment type"
          value={value.employmentType ?? ''}
          hint={t('common.optional')}
          placeholder="Full-time"
          onChange={(event) => patch({ employmentType: event.target.value })}
        />
        <TextField
          label={t('admin.startDate')}
          type="date"
          value={value.startDate}
          required
          error={merged.startDate}
          onChange={(event) => patch({ startDate: event.target.value })}
        />
        <div className="flex flex-col gap-2">
          <TextField
            label={t('admin.endDate')}
            type="date"
            value={value.endDate ?? ''}
            disabled={value.currentRole}
            error={merged.endDate}
            onChange={(event) => patch({ endDate: event.target.value })}
          />
          <CheckboxField
            label={t('admin.currentRole')}
            checked={value.currentRole}
            onChange={(event) => patch({ currentRole: event.target.checked, endDate: null })}
          />
        </div>
      </div>

      <LocalizedField
        label={t('admin.description')}
        value={value.description}
        multiline
        rows={3}
        onChange={(next) => patch({ description: next })}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="section-label">{t('admin.jobTitle')}</span>
          <Button
            size="sm"
            icon={<Plus aria-hidden className="h-3.5 w-3.5" />}
            onClick={() => patch({ positions: [...value.positions, emptyPosition(value.startDate)] })}
          >
            {t('admin.addPosition')}
          </Button>
        </div>

        {merged.positions ? <p className="text-xs text-red-600">{merged.positions}</p> : null}

        <ol className="flex flex-col gap-4">
          {value.positions.map((position, index) => (
            <li key={position.id ?? `new-${index}`}>
              <PositionFieldset
                position={position}
                index={index}
                total={value.positions.length}
                errors={merged}
                onChange={(changes) => patchPosition(index, changes)}
                onMove={(direction) =>
                  patch({ positions: moveItem(value.positions, index, index + direction) })
                }
                onRemove={() => patch({ positions: value.positions.filter((_, i) => i !== index) })}
              />
            </li>
          ))}
        </ol>
      </div>

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

interface PositionFieldsetProps {
  position: PositionPayload;
  index: number;
  total: number;
  errors: ValidationErrors;
  onChange: (changes: Partial<PositionPayload>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

function PositionFieldset({
  position,
  index,
  total,
  errors,
  onChange,
  onMove,
  onRemove,
}: PositionFieldsetProps): JSX.Element {
  const { t } = useTranslations();

  const setResponsibility = (responsibilityIndex: number, content: LocalizedText): void => {
    onChange({
      responsibilities: position.responsibilities.map((item, i) =>
        i === responsibilityIndex ? { ...item, content } : item,
      ),
    });
  };

  const addResponsibility = (): void => {
    const next: ResponsibilityPayload = { id: null, content: { ...EMPTY_LOCALIZED } };
    onChange({ responsibilities: [...position.responsibilities, next] });
  };

  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-ink-200/80 bg-white/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-xs font-semibold text-ink-500">#{index + 1}</legend>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('admin.moveUp')}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ChevronUp aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('admin.moveDown')}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <ChevronDown aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('admin.removePosition')}
            disabled={total <= 1}
            onClick={onRemove}
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <LocalizedField
        label={t('admin.jobTitle')}
        value={position.title}
        error={errors[`positions.${index}.title`]}
        onChange={(next) => onChange({ title: next })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label={t('admin.startDate')}
          type="date"
          value={position.startDate}
          required
          error={errors[`positions.${index}.startDate`]}
          onChange={(event) => onChange({ startDate: event.target.value })}
        />
        <TextField
          label={t('admin.endDate')}
          type="date"
          value={position.endDate ?? ''}
          disabled={position.currentRole}
          error={errors[`positions.${index}.endDate`]}
          onChange={(event) => onChange({ endDate: event.target.value })}
        />
        <div className="flex items-end pb-2">
          <CheckboxField
            label={t('admin.currentRole')}
            checked={position.currentRole}
            onChange={(event) => onChange({ currentRole: event.target.checked, endDate: null })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="section-label">{t('profile.responsibilities')}</span>
          <Button size="sm" icon={<Plus aria-hidden className="h-3.5 w-3.5" />} onClick={addResponsibility}>
            {t('admin.addResponsibility')}
          </Button>
        </div>

        <ol className="flex flex-col gap-3">
          {position.responsibilities.map((responsibility, responsibilityIndex) => (
            <li
              key={responsibility.id ?? `new-${responsibilityIndex}`}
              className="flex items-start gap-2"
            >
              <LocalizedField
                label={`${responsibilityIndex + 1}.`}
                value={responsibility.content}
                multiline
                rows={2}
                onChange={(next) => setResponsibility(responsibilityIndex, next)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                aria-label={t('admin.delete')}
                className="mt-6"
                onClick={() =>
                  onChange({
                    responsibilities: position.responsibilities.filter((_, i) => i !== responsibilityIndex),
                  })
                }
              >
                <Trash2 aria-hidden className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ol>
      </div>
    </fieldset>
  );
}
