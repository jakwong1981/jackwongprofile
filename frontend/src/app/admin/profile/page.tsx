// frontend/src/app/admin/profile/page.tsx
'use client';

import { Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalizedField } from '@/components/admin/LocalizedField';
import { SplitPaneEditor } from '@/components/markdown/SplitPaneEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { CheckboxField, TextField } from '@/components/ui/Field';
import { ApiError, toErrorMessage } from '@/lib/api/errors';
import { profileApi } from '@/lib/api/profile';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useAdminProfile } from '@/lib/hooks/useAdminProfile';
import { useLocalDraft } from '@/lib/hooks/useLocalDraft';
import { useSaveShortcut } from '@/lib/hooks/useSaveShortcut';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { withTranslation } from '@/lib/i18n/locale';
import { formatDateTime } from '@/lib/utils/date';
import { toProfileUpdatePayload } from '@/lib/utils/transform';
import { isValid, validateProfile, type ValidationErrors } from '@/lib/validation/profileValidation';
import type { Locale } from '@/types/api';
import type { ProfileUpdatePayload } from '@/types/profile';

/** `localStorage` key holding the unsaved profile draft. */
const DRAFT_KEY = 'profile.admin.draft.profile';

/**
 * Profile editor. The biography is authored in the split-pane markdown workspace; the
 * whole form autosaves to `localStorage` every two seconds and ⌘S / Ctrl+S commits it to
 * the API.
 */
export default function AdminProfilePage(): JSX.Element {
  const { t, locale } = useTranslations();
  const { notify } = useToast();
  const { profile, loading, error, setProfile } = useAdminProfile();

  const [form, setForm] = useState<ProfileUpdatePayload | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const draftCheckedRef = useRef(false);

  const draft = useLocalDraft<ProfileUpdatePayload | null>(DRAFT_KEY, form, form !== null);

  // Seed the form once the aggregate arrives, preferring a newer local draft if one
  // survived an interrupted session.
  useEffect(() => {
    if (profile === null || draftCheckedRef.current) {
      return;
    }
    draftCheckedRef.current = true;

    const server = toProfileUpdatePayload(profile);
    const restored = draft.restore();
    if (restored !== null && JSON.stringify(restored) !== JSON.stringify(server)) {
      setForm(restored);
      notify(t('admin.draftRestored'), 'info');
      return;
    }
    setForm(server);
  }, [profile, draft, notify, t]);

  const patch = useCallback((changes: Partial<ProfileUpdatePayload>): void => {
    setForm((current) => (current === null ? current : { ...current, ...changes }));
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (form === null || profile === null || saving) {
      return;
    }

    const validation = validateProfile(form, t('admin.required'));
    setErrors(validation);
    if (!isValid(validation)) {
      notify(t('common.error'), 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = await profileApi.updateProfile(profile.id, form);
      setProfile(saved);
      setForm(toProfileUpdatePayload(saved));
      draft.discard();
      setErrors({});
      notify(t('admin.saved'), 'success');
    } catch (cause) {
      if (cause instanceof ApiError && cause.errors.length > 0) {
        // Surface server-side field errors in the same slots as the client-side ones.
        setErrors(Object.fromEntries(cause.errors.map((detail) => [detail.field, detail.message])));
      }
      notify(toErrorMessage(cause), 'error');
    } finally {
      setSaving(false);
    }
  }, [form, profile, saving, t, notify, setProfile, draft]);

  useSaveShortcut(() => {
    void handleSave();
  }, form !== null);

  if (loading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (error !== null || profile === null || form === null) {
    return <EmptyState title={t('common.error')} description={error ?? undefined} />;
  }

  // The biography is edited in the locale currently selected in the header, so an operator
  // switches language to write the next translation.
  const summaryValue = readSummary(form, locale);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.profileEditor')}</h1>
          <p className="text-xs text-ink-400">
            {draft.lastSavedAt === null
              ? t('admin.shortcutHint')
              : `${t('admin.draftSaved')} · ${formatDateTime(new Date(draft.lastSavedAt).toISOString(), locale)}`}
          </p>
        </div>
        <Button
          variant="primary"
          loading={saving}
          icon={<Save aria-hidden className="h-4 w-4" />}
          onClick={() => void handleSave()}
        >
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </header>

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('admin.fullName')}
            value={form.fullName}
            required
            error={errors.fullName}
            onChange={(event) => patch({ fullName: event.target.value })}
          />
          <TextField
            label={t('admin.slug')}
            value={form.slug}
            required
            error={errors.slug}
            onChange={(event) => patch({ slug: event.target.value })}
          />
          <TextField
            label={t('admin.companyName')}
            value={form.companyName ?? ''}
            hint={t('common.optional')}
            onChange={(event) => patch({ companyName: event.target.value })}
          />
          <TextField
            label={t('admin.location')}
            value={form.location ?? ''}
            hint={t('common.optional')}
            onChange={(event) => patch({ location: event.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LocalizedField
            label={t('admin.fullName')}
            value={form.localizedFullName}
            onChange={(next) => patch({ localizedFullName: next })}
          />
          <LocalizedField
            label={t('admin.jobTitle')}
            value={form.jobTitle}
            onChange={(next) => patch({ jobTitle: next })}
          />
        </div>

        <LocalizedField
          label={t('admin.headline')}
          value={form.headline}
          multiline
          rows={2}
          onChange={(next) => patch({ headline: next })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('admin.avatarUrl')}
            value={form.avatarUrl ?? ''}
            hint={t('common.optional')}
            error={errors.avatarUrl}
            onChange={(event) => patch({ avatarUrl: event.target.value })}
          />
          <div className="flex items-end pb-2">
            <CheckboxField
              label={t('admin.published')}
              checked={form.published === true}
              onChange={(event) => patch({ published: event.target.checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink-900">{t('profile.contact')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('admin.email')}
            type="email"
            value={form.email ?? ''}
            error={errors.email}
            onChange={(event) => patch({ email: event.target.value })}
          />
          <TextField
            label={t('admin.phone')}
            value={form.phone ?? ''}
            onChange={(event) => patch({ phone: event.target.value })}
          />
          <TextField
            label="Facebook"
            value={form.facebookUrl ?? ''}
            error={errors.facebookUrl}
            onChange={(event) => patch({ facebookUrl: event.target.value })}
          />
          <TextField
            label="Instagram"
            value={form.instagramUrl ?? ''}
            error={errors.instagramUrl}
            onChange={(event) => patch({ instagramUrl: event.target.value })}
          />
          <TextField
            label="小紅書 / Xiaohongshu"
            value={form.xiaohongshuUrl ?? ''}
            error={errors.xiaohongshuUrl}
            onChange={(event) => patch({ xiaohongshuUrl: event.target.value })}
          />
          <TextField
            label="LinkedIn"
            value={form.linkedinUrl ?? ''}
            error={errors.linkedinUrl}
            onChange={(event) => patch({ linkedinUrl: event.target.value })}
          />
          <TextField
            label="GitHub"
            value={form.githubUrl ?? ''}
            error={errors.githubUrl}
            onChange={(event) => patch({ githubUrl: event.target.value })}
          />
          <TextField
            label="Website"
            value={form.websiteUrl ?? ''}
            error={errors.websiteUrl}
            onChange={(event) => patch({ websiteUrl: event.target.value })}
          />
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <SplitPaneEditor
          label={`${t('admin.summary')} — ${locale}`}
          value={summaryValue}
          placeholder="## About&#10;&#10;- Markdown, tables, and task lists are supported."
          onChange={(next) => patch({ summary: withTranslation(form.summary, locale, next) })}
        />
      </Card>
    </div>
  );
}

/**
 * Reads the biography for exactly the active locale — unlike display code, the editor must
 * never fall back to another translation or the operator would overwrite the wrong one.
 */
function readSummary(form: ProfileUpdatePayload, locale: Locale): string {
  const summary = form.summary;
  if (!summary) {
    return '';
  }
  if (locale === 'en') {
    return summary.en ?? '';
  }
  if (locale === 'zh-Hant') {
    return summary.zhHant ?? '';
  }
  return summary.zhHans ?? '';
}
