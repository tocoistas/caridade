import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Doe Bens - Projecto Caridade',
  description: 'Cada item doado é um gesto de amor que chega diretamente às famílias que mais precisam. Veja como a sua contribuição pode fazer a diferença.',
};

export default function DoarBensPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Sua Doação Aquece Corações e Alimenta a Esperança.</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">Cada item doado é um gesto de amor que chega diretamente às famílias que mais precisam. Veja como a sua contribuição pode fazer a diferença.</p>
        </div>
      </section>

      {/* O que doar */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">O Que Pode Doar?</h2>
          <p className="text-center max-w-3xl mx-auto mb-12">Toda a doação é bem-vinda, mas alguns itens são essenciais para o nosso trabalho diário. Veja a nossa lista de necessidades prioritárias, que apoiam directamente o nosso eixo &apos;Mão que Ampara&apos;:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Card 1: Alimentos */}
            <div className="bg-creme-escuro rounded-lg shadow-md p-6 text-center flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Alimentos Não Perecíveis</h3>
              <div className="flex-grow text-left space-y-2">
                <p>- Arroz, feijão, fuba de milho</p>
                <p>- Massa, açúcar, sal</p>
                <p>- Óleo alimentar, leite em pó</p>
                <p>- Conservas (atum, salsichas)</p>
              </div>
            </div>
            {/* Card 2: Higiene */}
            <div className="bg-creme-escuro rounded-lg shadow-md p-6 text-center flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Higiene e Limpeza</h3>
              <div className="flex-grow text-left space-y-2">
                <p>- Sabonetes, pasta de dentes</p>
                <p>- Fraldas (criança e adulto)</p>
                <p>- Absorventes femininos</p>
                <p>- Detergente, lixívia</p>
              </div>
            </div>
            {/* Card 3: Vestuário */}
            <div className="bg-creme-escuro rounded-lg shadow-md p-6 text-center flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Vestuário e Calçado</h3>
              <div className="flex-grow text-left space-y-2">
                <p>- Roupas de criança e adulto</p>
                <p>- Sapatos e sandálias</p>
                <p>- Agasalhos e cobertores</p>
                <p>(Agradecemos que os itens estejam em bom estado)</p>
              </div>
            </div>
            {/* Card 4: Escolar */}
            <div className="bg-creme-escuro rounded-lg shadow-md p-6 text-center flex flex-col">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-3">Material Escolar</h3>
              <div className="flex-grow text-left space-y-2">
                <p>- Cadernos, livros</p>
                <p>- Lápis, canetas, borrachas</p>
                <p>- Mochilas, estojos</p>
                <p>- Giz, quadros pequenos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como e Onde Doar */}
      <section id="pontos-recolha" className="py-16 bg-creme-escuro">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Como e Onde Doar</h2>
          <p className="text-lg leading-relaxed mb-8">Pode entregar as suas doações diretamente na nossa sede. A sua generosidade é o motor da nossa missão e cada contribuição é recebida com enorme gratidão.</p>
          <div className="bg-white rounded-lg shadow-lg p-8 inline-block text-left">
            <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Ponto de Recolha Principal
            </h3>
            <p className="mb-2"><strong>Endereço:</strong> Estrada da Pedreira, S/N, Bairro 17 de Setembro, Icolo e Bengo, Angola</p>
            <p className="mb-2"><strong>Horário de Recepção:</strong> Segunda a Sexta, das 9h às 16h.</p>
            <p><strong>Contato para grandes doações:</strong> +244 923 456 789</p>
          </div>
        </div>
      </section>

      {/* Doações para a Saúde (Eixo 2) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Apoio à Saúde (Coração que Cuida)</h2>
          <p className="text-lg leading-relaxed mb-4">Além dos bens de primeira necessidade, o nosso eixo &quot;Coração que Cuida&quot; também precisa de apoio. Recebemos doações de material médico e de enfermagem para apoiar as nossas acções de saúde junto da comunidade.</p>
          <p className="text-lg leading-relaxed mb-6"><strong>Itens necessários:</strong> Luvas, máscaras, material de penso, medicamentos (dentro da validade), entre outros.</p>
          <p className="text-lg leading-relaxed">Se é um profissional de saúde ou representa uma entidade e deseja contribuir com este tipo de material, por favor <Link href="/#contato" className="text-terracotta font-semibold hover:underline">entre em contacto connosco</Link> para coordenarmos a melhor forma de receber a sua ajuda.</p>
        </div>
      </section>
    </main>
  );
}

