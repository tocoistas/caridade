import { Metadata } from 'next';
import ContactoForm from '@/components/ContactoForm';

export const metadata: Metadata = {
  title: 'Fale Connosco - Projecto Caridade',
  description: 'Tem alguma questão, sugestão ou gostaria de saber mais sobre o nosso trabalho? Entre em contacto!',
};

export default function ContactoPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-petroleo mb-4">Fale Connosco</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">Tem alguma questão, sugestão ou gostaria de saber mais sobre o nosso trabalho? Entre em contacto!</p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <ContactoForm />

          {/* Contact Information and Social Media */}
          <div>
            <h2 className="font-montserrat font-bold text-3xl text-petroleo mb-6">Informações de Contato</h2>
            <div className="bg-creme p-8 rounded-lg shadow-md space-y-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 text-petroleo" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span><strong>Endereço:</strong><br />Estrada da Pedreira, S/N<br />Bairro 17 de Setembro<br />Icolo e Bengo, Angola</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-petroleo" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span><strong>Telefone:</strong> +244 923 456 789</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-petroleo" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span><strong>E-mail:</strong> info@caridade.ao</span>
                </li>
              </ul>

              <h3 className="font-montserrat font-semibold text-xl text-petroleo mt-8 mb-4">Siga-nos nas Redes Sociais</h3>
              <div className="flex space-x-4">
                <a href="https://wa.me/244923456789?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Projecto%20Caridade." target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-terracotta rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors text-white" title="WhatsApp">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.04 2C7.34 2 3.58 5.76 3.58 10.46c0 1.95.62 3.81 1.7 5.38L2 22l6.27-1.65c1.48.81 3.19 1.25 4.5 1.25 4.7 0 8.46-3.76 8.46-8.46S16.74 2 12.04 2zm4.84 14.48c-.1.17-.26.24-.44.24-.18 0-.3-.06-.42-.18l-.97-.97c-.12-.12-.26-.18-.42-.18-.16 0-.3.06-.42.18l-.5.5c-.12.12-.24.18-.42.18-.18 0-.3-.06-.42-.18-.6-.6-1.2-1.2-1.8-1.8-.12-.12-.18-.26-.18-.42 0-.16.06-.3.18-.42l.5-.5c.12-.12.18-.26.18-.42 0-.18-.06-.3-.18-.42l-.97-.97c-.12-.12-.26-.18-.42-.18-.18 0-.3.06-.42.18L8.5 13.5c-.12.12-.18.26-.18.42 0 .18.06.3.18.42 1.2 1.2 2.4 2.4 3.6 3.6.12.12.26.18.42.18.18 0 .3-.06.42-.18l.5-.5c.12-.12.18-.26.18-.42 0-.18-.06-.3-.18-.42l.97-.97c.12-.12.26-.18.42-.18.18 0 .3.06.42.18l.5.5c.12.12.18.26.18-.42 0 .18-.06.3-.18.42z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/caridade.ao" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-petroleo rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors text-white" title="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-petroleo rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors text-white" title="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-petroleo rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors text-white" title="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
