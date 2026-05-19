-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - MILESTONE 2 (TABELA DE PRECIFICAÇÃO E ITENS DE SERVIÇO)
-- Criação da tabela de itens de serviço para precificação unificada e gerenciável pelo gestor.

CREATE TABLE IF NOT EXISTS public.service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL,
  category_title text NOT NULL,
  category_image text,
  name text NOT NULL UNIQUE,
  default_price numeric NOT NULL,
  default_duration_hours numeric NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Permitir leitura pública de itens de serviço" ON public.service_items;
CREATE POLICY "Permitir leitura pública de itens de serviço" ON public.service_items
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir modificação por gestores" ON public.service_items;
CREATE POLICY "Permitir modificação por gestores" ON public.service_items
  FOR ALL TO authenticated
  USING (public.is_operator(auth.uid()))
  WITH CHECK (public.is_operator(auth.uid()));

-- Popula os 120 itens de serviço padrão (10 categorias x 12 sub-blocos cada)
INSERT INTO public.service_items (category_id, category_title, category_image, name, default_price, default_duration_hours) VALUES
-- Limpeza Doméstica
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza Geral Padrão', 120.00, 4),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza Profunda / Faxina Pesada', 180.00, 6),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Passar Roupas', 70.00, 3),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Lavar Roupas', 60.00, 2.5),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza de Vidros e Janelas', 80.00, 3),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Organização de Armários e Closets', 100.00, 4),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza de Geladeira e Forno Interno', 50.00, 2),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza de Sacadas e Varandas', 45.00, 1.5),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Arrumação de Camas e Troca de Enxoval', 35.00, 1),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza de Tapetes e Estofados', 90.00, 3),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza Pós-Mudança / Pós-Obra', 240.00, 8),
('limpeza_domestica', 'Limpeza Doméstica', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop', 'Limpeza de Paredes e Azulejos de Cozinha/Área', 70.00, 2.5),

-- Pequenos Reparos (Elétrica)
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Trocar Resistência de Chuveiro', 85.00, 2),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Trocar Tomada ou Interruptor', 60.00, 1.5),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Luminária ou Lustre', 110.00, 2.5),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Ventilador de Teto', 130.00, 3),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Trocar Disjuntor no Quadro', 70.00, 1.5),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Campainha', 45.00, 1),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Trocar Reator de Lâmpada', 50.00, 1.2),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Fita LED', 80.00, 2),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Passar Cabo de Rede/Telefone', 95.00, 2.5),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Suporte de TV com Passagem de Cabos', 120.00, 3),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Reparo em Fiação Rompida de Eletrodoméstico', 55.00, 1.5),
('pequenos_reparos_eletrica', 'Pequenos Reparos (Elétrica)', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop', 'Instalar Sensor de Presença', 65.00, 1.5),

-- Pequenos Reparos (Hidráulica)
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Consertar Torneira Pingando', 65.00, 1.5),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Reparo em Válvula Hydra ou Caixa Acoplada', 75.00, 2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Desentupir Pia de Cozinha ou Banheiro', 90.00, 2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Desentupir Vaso Sanitário', 95.00, 2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Trocar Sifão de Pia', 50.00, 1),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Trocar Flexível de Ducha ou Torneira', 40.00, 1),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Instalar Filtro de Água', 55.00, 1.2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Instalar Máquina de Lavar Roupa/Louça', 80.00, 1.8),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Trocar Reparo de Registro', 85.00, 2.2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Instalar Chuveiro Novo (Instalação Hidráulica)', 90.00, 2),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Eliminar Vazamento em Conexão Exposta', 70.00, 1.5),
('pequenos_reparos_hidraulica', 'Pequenos Reparos (Hidráulica)', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop', 'Limpeza de Caixa de Gordura', 150.00, 3),

-- Pequenos Reparos (Pintura)
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Parede Única (Destaque)', 180.00, 6),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Cômodo Completo', 350.00, 12),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Aplicação de Textura ou Grafiato', 250.00, 8),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pequenos Retoques de Massa Corrida', 120.00, 4),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Verniz ou Pintura em Portas e Portais', 140.00, 5),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Grelhas e Grades Metálicas', 110.00, 4),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Tratamento e Pintura Anti-mofo', 130.00, 4),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Lixamento e Preparação de Paredes', 90.00, 3),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Teto', 160.00, 5),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Rodapés e Guarnições', 75.00, 3),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Portão Externo', 220.00, 8),
('pequenos_reparos_pintura', 'Pequenos Reparos (Pintura)', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop', 'Pintura de Azulejos (Tinta Epóxi)', 290.00, 10),

-- Pequenos Reparos (Alvenaria)
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Fixação de Prateleiras e Nichos', 90.00, 2),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Instalar Suporte de TV em Parede de Alvenaria', 95.00, 2),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Troca de Azulejo ou Cerâmica Quebrada', 140.00, 4),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Rejuntamento de Pisos e Azulejos', 110.00, 5),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Pequeno Reparo de Reboco ou Reboco Caído', 130.00, 4),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Fixação de Acessórios de Banheiro', 60.00, 1.5),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Instalar Varal de Teto ou Parede', 75.00, 2),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Instalação de Espelhos Grandes na Parede', 120.00, 3),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Chumbamento de Caixa de Luz ou Suporte', 85.00, 2),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Fechamento de Furos e Rasgos de Tubulação', 100.00, 3),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Instalação de Ralo Grelha ou Ralo Linear', 95.00, 2.5),
('pequenos_reparos_alvenaria', 'Pequenos Reparos (Alvenaria)', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop', 'Assentamento de Soleira ou Pingadeira', 115.00, 3),

-- Montador de Móveis e Instalações
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Guarda-Roupa Solteiro', 130.00, 3),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Guarda-Roupa Casal Grande', 250.00, 6),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Cama Casal/Solteiro', 90.00, 2),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Mesa de Jantar com Cadeiras', 110.00, 2.5),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Painel de TV ou Rack', 120.00, 3),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Escrivaninha ou Cadeira de Escritório', 70.00, 1.5),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Instalação de Cortinas e Persianas', 65.00, 1.5),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Fixação de Quadros, Espelhos e Varões', 55.00, 1),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Armário de Cozinha Aéreo', 140.00, 3.5),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Montagem de Comoda ou Criado-Mudo', 80.00, 2),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Reparo em Portas de Armário (Dobradiças/Regulagem)', 50.00, 1.2),
('montador_de_moveis', 'Montador de Móveis e Instalações', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop', 'Desmontagem de Móveis para Mudança', 100.00, 2.5),

-- Cuidado de Animais (Pet Care)
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Passeio com Cão Pequeno / Médio (Dog Walking)', 30.00, 1),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Passeio com Cão Grande / Porte Gigante', 45.00, 1),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Hospedagem Domiciliar de Cão (Diária)', 70.00, 24),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Hospedagem Domiciliar de Gato (Diária)', 55.00, 24),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Pet Sitting (Visita de 1 hora para Alimentar e Limpar)', 40.00, 1),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Banho Domiciliar em Cão Pequeno', 50.00, 1.5),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Escovação e Higiene Oral Domiciliar', 35.00, 0.8),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Administração de Medicamentos / Curativos', 40.00, 0.5),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Transporte de Pet para Veterinário ou Petshop', 60.00, 1.5),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Adestramento Básico / Comportamento (Sessão)', 90.00, 1.2),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Corte de Unhas e Limpeza de Ouvidos de Pet', 30.00, 0.5),
('cuidado_de_animais', 'Cuidado de Animais (Pet Care)', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop', 'Hospedagem de Pet por Turno / Day Care (Até 12h)', 50.00, 12),

-- Cozinha e Gastronomia
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Almoço Familiar Padrão (Até 4 pessoas)', 120.00, 3),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Marmitas Saudáveis para a Semana (10 potes)', 190.00, 5),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Serviço de Cozinheiro para Jantar Especial', 280.00, 4),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Salgadinhos para Festas (Cento)', 90.00, 3),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Confeitaria: Bolo de Aniversário Simples (2kg)', 110.00, 3.5),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Sopas e Caldos de Inverno', 80.00, 2),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Cozinha Vegetariana / Vegana (Preparo Completo)', 130.00, 3),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Organização e Higienização da Despensa e Geladeira', 75.00, 2.5),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Café da Manhã Premium ou Brunch', 90.00, 2.2),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Docinhos Tradicionais (Cento)', 80.00, 2.5),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Auxiliar de Cozinha para Eventos (Limpeza e Apoio)', 140.00, 6),
('cozinha_gastronomia', 'Cozinha e Gastronomia', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop', 'Preparo de Petiscos e Tábua de Frios Gourmet', 95.00, 2),

-- Telhados e Calhas
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Limpeza de Calhas e Condutores', 120.00, 2),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Substituição de Telhas Quebradas (Cerâmica)', 150.00, 3),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Aplicação de Manta Asfáltica Autoadesiva', 180.00, 4),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Impermeabilização com Manta Líquida', 220.00, 5),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Desobstrução de Condutores de Água Pluvial', 90.00, 2),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Conserto de Rufo ou Pingadeira Metálica', 130.00, 3),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Instalação de Tela Protetora Contra Folhas', 110.00, 2.5),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Pintura Impermeabilizante de Telhado', 250.00, 6),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Vedação de Parafusos em Telhas de Fibrocimento/Zinco', 95.00, 2.5),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Fixação de Calha Desprendida', 85.00, 1.8),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Inspeção Completa de Infiltração em Forros/Telhados', 70.00, 1.5),
('telhados_calhas', 'Telhados e Calhas', 'https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop', 'Instalação de Calha Nova (Metro Linear)', 160.00, 4),

-- Apoio em Mudanças (Carga/Descarga)
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Ajudante de Carga e Descarga (Até 4h)', 130.00, 4),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Ajudante de Carga e Descarga (Período de 8h)', 220.00, 8),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Embalagem de Louças, Livros e Objetos Frágeis', 95.00, 3),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Montagem e Fechamento de Caixas (Kit Mudança)', 70.00, 2.5),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Transporte Interno de Móveis Pesados', 90.00, 2),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Carregamento de Entulho ou Sobras (Sacos)', 110.00, 3),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Organização de Caixas Pós-Mudança nos Cômodos', 85.00, 3),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Proteção de Móveis com Plástico Bolha', 75.00, 2.2),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Apoio no Içamento Manual Simples', 120.00, 2),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Descarte Ecológico de Móveis Velhos', 100.00, 2.5),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Ajudante para Pequeno Carreto / Transporte', 140.00, 4),
('apoio_mudancas', 'Apoio em Mudanças (Carga/Descarga)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop', 'Desmontagem e Proteção de Eletrodomésticos para Transporte', 80.00, 2)
ON CONFLICT (name) DO UPDATE SET
  default_price = EXCLUDED.default_price,
  default_duration_hours = EXCLUDED.default_duration_hours,
  category_id = EXCLUDED.category_id,
  category_title = EXCLUDED.category_title,
  category_image = EXCLUDED.category_image;
