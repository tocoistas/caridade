import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Wrappers de navegação com conhecimento do idioma (mantêm o prefixo de locale).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
