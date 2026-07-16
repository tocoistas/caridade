import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section id="inicio" className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Restaurando dignidade.<br />Partilhando esperança.</h1>
            <p className="text-lg md:text-xl mb-8">Uma iniciativa independente e global de solidariedade que apoia pessoas e famílias em situação de vulnerabilidade, onde quer que estejam.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#ajudar" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">Quero Ajudar</Link>
              <Link href="#beneficiarios" className="bg-petroleo hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">Preciso de Ajuda</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação do Projecto */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">O Projecto Caridade</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3">
                <Image src="/img/logo.png" alt="Logo do Projecto Caridade" width={200} height={200} className="w-auto h-auto mb-6 rounded-lg " priority />

              </div>
              <div className="md:w-2/3">
                <p className="text-lg leading-relaxed mb-6">O <strong className="text-terracotta">Projecto Caridade</strong> é uma iniciativa que visa apoiar pessoas e famílias em situação de vulnerabilidade social com a provisão de bens essenciais, apoio à saúde física e mental e conexão com doadores.</p>
                <p className="text-lg leading-relaxed">É uma expressão concreta de solidariedade em acção, fundamentada nos princípios de dignidade humana e cuidado com os mais necessitados, sem distinção de origem, credo ou nacionalidade. Acreditamos que pequenos gestos de solidariedade podem transformar vidas e restaurar a dignidade humana.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eixos de Acção */}
      <section id="eixos" className="py-16 bg-cremeEscuro">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">Nossos Eixos de Acção</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mão que Ampara */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 16V8.5C20 7.4 19.1 6.5 18 6.5H17.5V5.5C17.5 4.4 16.6 3.5 15.5 3.5C14.4 3.5 13.5 4.4 13.5 5.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.5 9.5V5.5C13.5 4.4 12.6 3.5 11.5 3.5C10.4 3.5 9.5 4.4 9.5 5.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 7.5V5.5C9.5 4.4 8.6 3.5 7.5 3.5C6.4 3.5 5.5 4.4 5.5 5.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 10.5V5.5C5.5 4.4 4.6 3.5 3.5 3.5C2.4 3.5 1.5 4.4 1.5 5.5V14.5C1.5 17.8 4.2 20.5 7.5 20.5H13.5C16.8 20.5 19.5 17.8 19.5 14.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">Mão que Ampara</h3>
              <p className="text-center mb-4">Doação de alimentos, roupas e produtos de higiene para famílias em situação de vulnerabilidade.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Cestas básicas mensais
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Roupas e calçados
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Kits de higiene pessoal
                </li>
              </ul>
            </div>

            {/* Coração que Cuida */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                  <path d="M12 13v-1h-1a1 1 0 110-2h1V9a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0z" fill="white" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">Coração que Cuida</h3>
              <p className="text-center mb-4">Consultas com profissionais de saúde e apoio psicológico para quem mais precisa.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Atendimento médico básico
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Apoio psicológico
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Orientação familiar
                </li>
              </ul>
            </div>

            {/* Ponte de Esperança */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7a3 3 0 100 6 3 3 0 000-6z" fill="currentColor" />
                  <path d="M4.5 12.5L19.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4 text-center">Ponte de Esperança</h3>
              <p className="text-center mb-4">Plataforma de conexão entre necessidades específicas e doadores dispostos a ajudar.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Cadastro de necessidades
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Conexão com doadores
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-terracotta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Acompanhamento de doações
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como Ajudar */}
      <section id="ajudar" className="py-16 bg-petroleo text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl mb-3 text-center">Junte-se à nossa missão</h2>
          <p className="text-center max-w-2xl mx-auto mb-12">Existem várias formas de contribuir com o Projecto Caridade. Cada gesto de solidariedade faz diferença na vida de quem mais precisa.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Ser Voluntário */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">Seja Voluntário</h3>
              <p className="mb-6">Doe seu tempo e talentos para ajudar nas diversas actividades do projecto.</p>
              <Link href="/voluntario" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">Seja Voluntário</Link>
            </div>

            {/* Doar Bens */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12V8h-4V4h-8v4H4v4H0v8h8v-8H4V8h4V4h8v4h4v4h4v8h-8v-8h4z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">Doe Bens</h3>
              <p className="mb-6">Contribua com alimentos, roupas, produtos de higiene e outros itens essenciais.</p>
              <Link href="/doar-bens" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">Saiba Como Doar</Link>
            </div>

            {/* Doar Dinheiro */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-terracotta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-3">Doe Dinheiro</h3>
              <p className="mb-6">Faça uma contribuição financeira para ajudar a manter os projectos em funcionamento.</p>
              <Link href="/doar-dinheiro" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-6 py-2 rounded-md inline-block transition-all transform hover:scale-105">Doe Agora</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-16 bg-creme">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-12 text-center">Testemunhos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testemunho 1 */}
            <div className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
              <p className="italic mb-6 relative z-10">&quot;Quando perdi meu emprego durante a pandemia, não sabia como iria alimentar meus três filhos. O Projecto Caridade não apenas nos forneceu alimentos, mas também me ajudou a encontrar um novo trabalho. Serei eternamente grata.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-terracotta rounded-full flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold">Maria S.</h4>
                  <p className="text-sm text-gray-600">Beneficiária</p>
                </div>
              </div>
            </div>

            {/* Testemunho 2 */}
            <div className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
              <p className="italic mb-6 relative z-10">&quot;Ser voluntário no Projecto Caridade transformou minha visão de mundo. Ver o impacto direto que podemos ter na vida das pessoas é uma experiência que não tem preço. Cada sorriso que recebemos é a nossa maior recompensa.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-petroleo rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold">João P.</h4>
                  <p className="text-sm text-gray-600">Voluntário há 2 anos</p>
                </div>
              </div>
            </div>

            {/* Testemunho 3 */}
            <div className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
              <p className="italic mb-6 relative z-10">&quot;Como médica, sempre quis ajudar além do consultório. No Projecto Caridade, posso oferecer atendimento a quem realmente não tem acesso. É gratificante ver a recuperação de pessoas que, sem esse apoio, não teriam como cuidar da saúde.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-terracotta rounded-full flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold">Ana C.</h4>
                  <p className="text-sm text-gray-600">Médica voluntária</p>
                </div>
              </div>
            </div>

            {/* Testemunho 4 */}
            <div className="testimonial-card bg-white rounded-lg shadow-lg p-8 relative">
              <p className="italic mb-6 relative z-10">&quot;Minha empresa começou a doar mensalmente para o Projecto Caridade e decidimos visitar para ver o trabalho de perto. Ficamos impressionados com a seriedade e o impacto real que cada contribuição tem. É um trabalho que merece todo o nosso apoio.&quot;</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-petroleo rounded-full flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat font-semibold">Roberto M.</h4>
                  <p className="text-sm text-gray-600">Doador empresarial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Beneficiários */}
      <section id="beneficiarios" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6 text-center">Para quem precisa de ajuda</h2>

            <div className="bg-creme rounded-lg p-8 mb-8">
              <h3 className="font-montserrat font-semibold text-xl text-petroleo mb-4">Como receber apoio do Projecto Caridade</h3>
              <p className="mb-4">Se você ou sua família está passando por dificuldades e precisa de apoio, o Projecto Caridade está aqui para ajudar. Nosso processo de cadastro é simples e acolhedor.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta">Quem pode receber ajuda:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Famílias em situação de vulnerabilidade social
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Pessoas desempregadas ou com renda insuficiente
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Idosos em situação de abandono
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Pessoas com necessidades especiais de saúde
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-montserrat font-medium text-lg mb-2 text-terracotta">Documentos necessários:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Documento de identificação
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Comprovante de residência
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Comprovante de renda (se houver)
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-petroleo mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Documentos dos dependentes (se houver)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link href="/cadastro-beneficiario" className="bg-terracotta hover:bg-opacity-90 text-white font-montserrat font-medium px-8 py-3 rounded-md inline-block transition-all transform hover:scale-105">Quero Fazer Cadastro</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

