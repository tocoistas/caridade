import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administração',
  // Área privada: não deve ser indexada pelos motores de busca.
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
