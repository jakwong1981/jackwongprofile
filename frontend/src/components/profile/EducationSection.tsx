// frontend/src/components/profile/EducationSection.tsx
'use client';

import { ExternalLink, GraduationCap } from 'lucide-react';
import { Section } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateRange } from '@/lib/utils/date';
import type { Education } from '@/types/profile';

export interface EducationSectionProps {
  educations: readonly Education[];
}

/** Academic history, including grades and verifiable credential links where present. */
export function EducationSection({ educations }: EducationSectionProps): JSX.Element {
  const { t, tx, locale } = useTranslations();

  return (
    <Section id="education" title={t('profile.education')} meta={educations.length > 0 ? educations.length : undefined}>
      {educations.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<GraduationCap aria-hidden className="h-5 w-5" />} />
      ) : (
        <ol className="flex flex-col gap-6">
          {educations.map((education) => {
            const range = formatDateRange(education.startDate, education.endDate, false, locale, t('profile.present'));
            const institution = tx(education.localizedInstitution) || education.institution;
            const degreeLine = [tx(education.degree), tx(education.fieldOfStudy)]
              .filter((part) => part !== '')
              .join(' · ');
            const description = tx(education.description);

            return (
              <li key={education.id}>
                <article className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-ink-900">{institution}</h3>
                    {range !== '' ? <span className="text-xs tabular-nums text-ink-400">{range}</span> : null}
                  </div>

                  {degreeLine !== '' ? <p className="text-sm text-ink-600">{degreeLine}</p> : null}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                    {education.location ? <span>{education.location}</span> : null}
                    {education.grade ? (
                      <span>
                        {t('profile.grade')}: {education.grade}
                      </span>
                    ) : null}
                    {education.credentialId ? (
                      <span>
                        {t('profile.credentialId')}: {education.credentialId}
                      </span>
                    ) : null}
                    {education.credentialUrl ? (
                      <a
                        href={education.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-accent-600 transition hover:text-accent-700"
                      >
                        {t('profile.verify')}
                        <ExternalLink aria-hidden className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>

                  {description !== '' ? (
                    <p className="text-sm leading-relaxed text-ink-600">{description}</p>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
