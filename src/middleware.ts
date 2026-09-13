import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Aplica a todos os caminhos exceto ficheiros internos do Next, a API, as imagens
  // de partilha (/og) e ficheiros com extensão (assets estáticos, robots, llms.txt).
  matcher: ['/((?!api|og|_next|_vercel|.*\\..*).*)'],
};
