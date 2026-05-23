import { Metadata } from 'next';
import DoarDinheiroForm from '@/components/DoarDinheiroForm';

export const metadata: Metadata = {
  title: 'Doe Dinheiro - Projecto Caridade',
  description: 'Sua doação financeira constrói a ponte de esperança. Cada contribuição é um pilar que sustenta o nosso trabalho e permite-nos agir onde a necessidade é mais urgente.',
};

export default function DoarDinheiroPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Sua Doação Financeira Constrói a Ponte de Esperança</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">Cada contribuição, por menor que seja, é um pilar que sustenta o nosso trabalho e permite-nos agir onde a necessidade é mais urgente.</p>
        </div>
      </section>

      {/* Porquê doar dinheiro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Porquê a sua doação é tão importante?</h2>
          <p className="text-lg leading-relaxed mb-4">Enquanto as doações de bens são vitais, as contribuições financeiras oferecem-nos a <strong className="text-terracotta">flexibilidade</strong> de responder rapidamente a emergências, comprar alimentos específicos que estão em falta, adquirir medicamentos essenciais e cobrir custos operacionais que tornam todo o nosso trabalho possível.</p>
          <p className="text-lg leading-relaxed">A sua doação transforma-se em ajuda directa e eficiente, sendo a base do nosso eixo &quot;Ponte de Esperança&quot;, que liga a generosidade à necessidade.</p>
        </div>
      </section>

      {/* Opções de Doação */}
      <section id="doar-agora" className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">Faça a sua Doação</h2>
          <DoarDinheiroForm />
        </div>
      </section>

      {/* Transparência */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Transparência e Compromisso</h2>
          <p className="text-lg leading-relaxed">Assumimos o compromisso de utilizar cada doação com a máxima responsabilidade e transparência. Prestamos contas regularmente sobre a aplicação dos fundos, garantindo que a sua generosidade chega efectivamente a quem mais precisa. A sua confiança é o nosso bem mais valioso.</p>
        </div>
      </section>
    </main>
  );
}
