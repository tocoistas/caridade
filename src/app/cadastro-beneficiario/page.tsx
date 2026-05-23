import { Metadata } from 'next';
import CadastroBeneficiarioForm from '@/components/CadastroBeneficiarioForm';

export const metadata: Metadata = {
  title: 'Cadastro de Beneficiário - Projecto Caridade',
  description: 'Preencha o formulário para solicitar apoio. A sua informação será tratada com total confidencialidade e respeito.',
};

export default function CadastroBeneficiarioPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Estamos aqui para ajudar.</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">Preencha o formulário abaixo para solicitar apoio. A sua informação será tratada com total confidencialidade e respeito.</p>
        </div>
      </section>

      {/* Informações Importantes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">Antes de começar</h2>
          <p className="text-lg leading-relaxed mb-8 text-center">Para agilizar o seu processo, por favor, leia com atenção os critérios e tenha os documentos necessários à mão.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-creme-escuro p-6 rounded-lg">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Critérios de Elegibilidade</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Famílias em comprovada situação de vulnerabilidade social.</li>
                <li>Pessoas desempregadas ou com renda insuficiente para o sustento básico.</li>
                <li>Idosos em situação de abandono ou com poucos recursos.</li>
                <li>Pessoas com necessidades de saúde que não conseguem cobrir.</li>
              </ul>
            </div>
            <div className="bg-creme-escuro p-6 rounded-lg">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Documentos Necessários</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Cópia do Bilhete de Identidade do responsável.</li>
                <li>Comprovativo de morada (recibo de água, luz ou declaração do bairro).</li>
                <li>Comprovativo de renda (se aplicável).</li>
                <li>Cópia do B.I. dos outros membros do agregado familiar.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Cadastro */}
      <section id="formulario" className="py-16 bg-creme-escuro">
        <CadastroBeneficiarioForm />
      </section>
    </main>
  );
}