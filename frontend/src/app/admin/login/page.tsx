// frontend/src/app/admin/login/page.tsx
'use client';

import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField, PasswordField } from '@/components/ui/Field';
import { authApi } from '@/lib/api/auth';
import { ApiError, toErrorMessage } from '@/lib/api/errors';
import { readSession } from '@/lib/api/token-store';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useTranslations } from '@/lib/i18n/LocaleProvider';

/** Administrator sign-in. On success the session is persisted and the portal opens. */
export default function AdminLoginPage(): JSX.Element {
  const { t } = useTranslations();
  const router = useRouter();
  const { notify } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Someone arriving with a live session has no business on the sign-in screen.
  useEffect(() => {
    if (readSession() !== null) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (username.trim() === '' || password === '') {
      setError(t('admin.required'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await authApi.login({ username: username.trim(), password });
      notify(t('admin.signIn'), 'success');
      router.replace('/admin');
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : toErrorMessage(cause);
      setError(message);
      notify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <LocaleSwitcher />
        </div>

        <Card className="p-6 sm:p-7">
          <div className="mb-6 flex flex-col gap-1.5 text-center">
            <h1 className="text-lg font-semibold tracking-tight text-ink-900">{t('admin.signInTitle')}</h1>
            <p className="text-xs leading-relaxed text-ink-400">{t('admin.signInSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <TextField
              label={t('admin.username')}
              value={username}
              autoComplete="username"
              autoFocus
              required
              onChange={(event) => setUsername(event.target.value)}
            />
            <PasswordField
              label={t('admin.password')}
              value={password}
              autoComplete="current-password"
              required
              onChange={(event) => setPassword(event.target.value)}
              {...(error ? { error } : {})}
            />
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<LogIn aria-hidden className="h-4 w-4" />}
              className="mt-1 w-full"
            >
              {t('admin.signIn')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
