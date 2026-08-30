// frontend/src/components/profile/CertificationSection.tsx
'use client';

import { Award, ExternalLink } from 'lucide-react';
import { Card, Section } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatMonthYear } from '@/lib/utils/date';
import type { Certification } from '@/types/profile';

export interface CertificationSectionProps {
  certifications: readonly Certification[];
}

/**
 * Credentials laid out as a responsive card grid — one column on phones, two from `sm`.
 * Cards rather than a list because each entry carries several short metadata pairs.
 */
export function CertificationSection({ certifications }: CertificationSectionProps): JSX.Element {
  const { t, tx, locale } = useTranslations();

  return (
    <Section
      id="certifications"
      title={t('profile.certifications')}
      meta={certifications.length > 0 ? certifications.length : undefined}
    >
      {certifications.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<Award aria-hidden className="h-5 w-5" />} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {certifications.map((certification) => {
            const issued = formatMonthYear(certification.issueDate, locale);
            const expires = formatMonthYear(certification.expirationDate, locale);
            const description = tx(certification.description);

            return (
              <li key={certification.id}>
                <Card className="flex h-full flex-col gap-2 p-4">
                  <h3 className="text-sm font-semibold leading-snug tracking-tight text-ink-900">
                    {tx(certification.name)}
                  </h3>
                  <p className="text-xs text-ink-500">{certification.issuingOrganization}</p>

                  {issued !== '' || expires !== '' ? (
                    <p className="text-[0.7rem] tabular-nums text-ink-400">
                      {[issued, expires].filter((part) => part !== '').join(' – ')}
                    </p>
                  ) : null}

                  {description !== '' ? (
                    <p className="text-xs leading-relaxed text-ink-500">{description}</p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[0.7rem] text-ink-400">
                    {certification.credentialId ? (
                      <span className="truncate">
                        {t('profile.credentialId')}: {certification.credentialId}
                      </span>
                    ) : null}
                    {certification.credentialUrl ? (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-accent-600 transition hover:text-accent-700"
                      >
                        {t('profile.verify')}
                        <ExternalLink aria-hidden className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
