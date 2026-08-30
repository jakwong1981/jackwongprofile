// frontend/src/components/profile/ExperienceSection.tsx
'use client';

import { Building2, ExternalLink } from 'lucide-react';
import { Section } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateRange } from '@/lib/utils/date';
import type { Experience, Position } from '@/types/profile';

export interface ExperienceSectionProps {
  experiences: readonly Experience[];
}

/**
 * Resume-format work history. One block per employer; every job title held there is a
 * nested row with its own date range and itemised duties, which is what the one-to-many
 * company→title model is for.
 */
export function ExperienceSection({ experiences }: ExperienceSectionProps): JSX.Element {
  const { t } = useTranslations();

  return (
    <Section id="experience" title={t('profile.experience')} meta={experiences.length > 0 ? experiences.length : undefined}>
      {experiences.length === 0 ? (
        <EmptyState title={t('profile.empty')} icon={<Building2 aria-hidden className="h-5 w-5" />} />
      ) : (
        <ol className="flex flex-col gap-8">
          {experiences.map((experience) => (
            <li key={experience.id}>
              <ExperienceEntry experience={experience} />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function ExperienceEntry({ experience }: { experience: Experience }): JSX.Element {
  const { t, tx, locale } = useTranslations();

  const range = formatDateRange(
    experience.startDate,
    experience.endDate,
    experience.currentRole,
    locale,
    t('profile.present'),
  );
  const description = tx(experience.description);

  return (
    <article className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-ink-900">
          {experience.companyUrl ? (
            <a
              href={experience.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-accent-600"
            >
              {experience.companyName}
              <ExternalLink aria-hidden className="h-3.5 w-3.5 text-ink-300" />
            </a>
          ) : (
            experience.companyName
          )}
        </h3>
        {range !== '' ? <span className="text-xs tabular-nums text-ink-400">{range}</span> : null}
      </div>

      {experience.location || experience.employmentType ? (
        <p className="-mt-3 text-xs text-ink-400">
          {[experience.location, experience.employmentType].filter(Boolean).join(' · ')}
        </p>
      ) : null}

      {description !== '' ? <p className="text-sm leading-relaxed text-ink-600">{description}</p> : null}

      <ol className="flex flex-col gap-5 border-l border-ink-200 pl-5">
        {experience.positions.map((position) => (
          <li key={position.id}>
            <PositionEntry position={position} />
          </li>
        ))}
      </ol>
    </article>
  );
}

function PositionEntry({ position }: { position: Position }): JSX.Element {
  const { t, tx, locale } = useTranslations();

  const range = formatDateRange(
    position.startDate,
    position.endDate,
    position.currentRole,
    locale,
    t('profile.present'),
  );

  return (
    <div className="relative flex flex-col gap-2">
      <span aria-hidden className="absolute -left-[1.6rem] top-2 h-1.5 w-1.5 rounded-full bg-ink-300" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h4 className="text-sm font-medium text-ink-800">{tx(position.title)}</h4>
        {range !== '' ? <span className="text-[0.7rem] tabular-nums text-ink-400">{range}</span> : null}
      </div>

      {position.employmentType ? (
        <p className="-mt-1.5 text-[0.7rem] text-ink-400">{position.employmentType}</p>
      ) : null}

      {position.responsibilities.length > 0 ? (
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-ink-600 marker:text-ink-300">
          {position.responsibilities.map((responsibility) => (
            <li key={responsibility.id}>{tx(responsibility.content)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
