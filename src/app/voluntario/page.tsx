import { Metadata } from 'next';
import VoluntarioForm from '@/components/VoluntarioForm';

export const metadata: Metadata = {
  title: 'Seja Voluntário - Projecto Caridade',
  description: 'O seu tempo e talento são os dons mais preciosos que pode oferecer. Torne-se um voluntário e ajude-nos a levar esperança e dignidade a quem mais precisa.',
};

export default function VoluntarioPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Junte-se a Nós. Seja a Mudança.</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">O seu tempo e talento são os dons mais preciosos que pode oferecer. Torne-se um voluntário e ajude-nos a levar esperança e dignidade a quem mais precisa.</p>
        </div>
      </section>

      {/* Porquê Ser Voluntário */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Porquê Ser Voluntário?</h2>
          <p className="text-lg leading-relaxed mb-4">No coração do Projecto Caridade está a convicção de que a solidariedade se manifesta através de acções. Os nossos voluntários são a força motriz por trás de cada cesta básica entregue, de cada peça de roupa doada e de cada sorriso de alívio. Ao ser voluntário, você não está apenas a doar o seu tempo; está a investir em vidas, a construir comunidade e a ser um agente de transformação social.</p>
          <p className="text-lg leading-relaxed">Cada hora dedicada faz uma diferença imensurável na vida das famílias que apoiamos.</p>
        </div>
      </section>

      {/* Áreas de Voluntariado */}
      <section className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">Oportunidades de Voluntariado</h2>
          <p className="text-center max-w-3xl mx-auto mb-12">O nosso eixo &quot;Mão que Ampara&quot; precisa de ajuda em várias frentes. Veja onde você pode encaixar os seus talentos:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Organização */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center transform transition-transform hover:scale-105 flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Organização e Logística</h3>
              <p className="flex-grow">Apoio na recepção, triagem e organização de doações de alimentos, roupas e produtos de higiene. Manter o nosso armazém organizado é fundamental para uma distribuição eficiente.</p>
            </div>
            {/* Card 2: Distribuição */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center transform transition-transform hover:scale-105 flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Distribuição de Bens</h3>
              <p className="flex-grow">Participar nos dias de distribuição, ajudando a montar as cestas básicas e a entregar os bens às famílias beneficiárias com um sorriso e uma palavra de conforto.</p>
            </div>
            {/* Card 3: Cadastro */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center transform transition-transform hover:scale-105 flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Acolhimento e Cadastro</h3>
              <p className="flex-grow">Ajudar no processo de cadastro de novas famílias, realizando entrevistas de acolhimento para entender as suas necessidades de forma digna e respeitosa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Inscrição */}
      <section id="formulario" className="py-16 bg-white">
        <VoluntarioForm />
      </section>
    </main>
  );
}