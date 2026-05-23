export default function TermosServico() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-8">Termos de Serviço</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700">
        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">1. Termos</h2>
        <p className="mb-4">
          Ao aceder ao site Projecto Caridade da INSJCM, concorda em cumprir estes termos de serviço, todas 
          as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis 
          locais aplicáveis. Se não concordar com algum destes termos, está proibido de usar ou aceder a este site.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">2. Uso de Licença</h2>
        <p className="mb-4">
          É concedida permissão para descarregar temporariamente uma cópia dos materiais (informações ou software) 
          no site Projecto Caridade, apenas para visualização transitória pessoal e não comercial. Esta é a 
          concessão de uma licença, não uma transferência de título e, sob esta licença, o utilizador não pode:
        </p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li>Modificar ou copiar os materiais;</li>
          <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
          <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site;</li>
          <li>Remover quaisquer direitos de autor ou outras notações de propriedade dos materiais;</li>
          <li>Transferir os materiais para outra pessoa ou 'espelhar' os materiais em qualquer outro servidor.</li>
        </ul>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">3. Formulários e Submissões</h2>
        <p className="mb-4">
          Ao submeter qualquer formulário (Contacto, Voluntariado ou Cadastro de Beneficiários), garante que todas as 
          informações fornecidas são verdadeiras, precisas e actualizadas. A submissão de dados falsos em pedidos 
          de assistência social pode resultar na recusa do pedido.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">4. Isenção de Responsabilidade</h2>
        <p className="mb-4">
          Os materiais no site da Projecto Caridade são fornecidos 'como estão'. O Projecto Caridade não oferece 
          garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, 
          sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não 
          violação de propriedade intelectual ou outra violação de direitos.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">5. Limitações</h2>
        <p className="mb-4">
          Em nenhum caso o Projecto Caridade ou os seus parceiros/fornecedores serão responsáveis ​​por quaisquer 
          danos (incluindo, sem limitação, danos por perda de dados ou lucros ou devido a interrupção dos negócios) 
          decorrentes do uso ou da incapacidade de usar os materiais no site, mesmo que o Projecto Caridade ou um 
          representante autorizado tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">6. Modificações do Termo</h2>
        <p className="mb-4">
          O Projecto Caridade pode rever estes termos de serviço para o site a qualquer momento, sem aviso prévio. 
          Ao usar este site, concorda em ficar vinculado à versão actual destes termos de serviço.
        </p>

        <p className="mt-12 text-sm text-gray-500">
          Estes termos são efectivos a partir de <strong>Maio de 2026</strong>.
        </p>
      </div>
    </div>
  );
}