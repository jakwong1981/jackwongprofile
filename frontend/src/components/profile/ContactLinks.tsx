// frontend/src/components/profile/ContactLinks.tsx
'use client';

import { AtSign, Github, Globe, Instagram, Linkedin, Phone, Facebook, BookHeart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Contact } from '@/types/profile';

interface ChannelDescriptor {
  key: keyof Contact;
  label: string;
  icon: LucideIcon;
  /** Turns the stored value into an `href`. */
  toHref: (value: string) => string;
}

/**
 * Declared once, in display order. Xiaohongshu has no Lucide glyph, so it borrows the
 * closest neutral mark rather than shipping a bespoke SVG.
 */
const CHANNELS: readonly ChannelDescriptor[] = [
  { key: 'email', label: 'Email', icon: AtSign, toHref: (value) => `mailto:${value}` },
  { key: 'phone', label: 'Phone', icon: Phone, toHref: (value) => `tel:${value.replace(/\s+/g, '')}` },
  { key: 'facebookUrl', label: 'Facebook', icon: Facebook, toHref: (value) => value },
  { key: 'instagramUrl', label: 'Instagram', icon: Instagram, toHref: (value) => value },
  { key: 'xiaohongshuUrl', label: '小紅書', icon: BookHeart, toHref: (value) => value },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, toHref: (value) => value },
  { key: 'githubUrl', label: 'GitHub', icon: Github, toHref: (value) => value },
  { key: 'websiteUrl', label: 'Website', icon: Globe, toHref: (value) => value },
] as const;

export interface ContactLinksProps {
  contact: Contact;
  className?: string;
}

/**
 * Renders every populated contact channel as a compact chip. Channels the operator has
 * not filled in are simply absent — no placeholder rows.
 */
export function ContactLinks({ contact, className }: ContactLinksProps): JSX.Element | null {
  const available = CHANNELS.flatMap((channel) => {
    const raw = contact[channel.key];
    if (typeof raw !== 'string' || raw.trim() === '') {
      return [];
    }
    return [{ channel, value: raw.trim() }];
  });

  if (available.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {available.map(({ channel, value }) => {
        const Icon = channel.icon;
        const href = channel.toHref(value);
        const external = href.startsWith('http');
        return (
          <li key={channel.key}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
            >
              <Icon aria-hidden className="h-3.5 w-3.5" />
              <span>{channel.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
