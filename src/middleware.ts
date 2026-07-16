import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Aplica a todos os caminhos exceto ficheiros internos do Next, a API e
  // ficheiros com extensão (assets estáticos).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
