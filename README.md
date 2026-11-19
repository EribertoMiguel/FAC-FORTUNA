# OneState — Central de Operações

Aplicação web para uso exclusivo do administrador, com autenticação Supabase e dados compartilhados online.

## Funcionalidades
- Login exclusivo de administrador.
- Cadastro de membros e equipes (Carro 1, 2 e 3).
- Metas diárias individuais de essência e entrega.
- Lançamentos de produção e entregas.
- Geração em lote de produção e entregas pendentes.
- Painel diário, desempenho por equipe e relatórios.
- Backup JSON.
- Simulador de produção: estima ciclos possíveis, joias produzidas, saldo para entregas, necessidade de essência e projeção de 24 horas.
- Temporizador individual para cada máquina, com iniciar, pausar, reiniciar e controles coletivos; o estado dos contadores fica salvo no navegador.

## 1. Criar o projeto Supabase
1. Crie um projeto em https://supabase.com/.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Em Authentication > Users, crie o usuário administrador com e-mail e senha.
4. Copie o UUID do usuário criado.
5. No SQL Editor, execute o comando comentado no final de `supabase/schema.sql`, substituindo o UUID. Isso atribui `app_metadata.role = admin`.
6. Em Project Settings > API, copie Project URL e anon/public key.

## 2. Configurar a aplicação
Edite `js/config.js`:
- `SUPABASE_URL`: URL do projeto.
- `SUPABASE_ANON_KEY`: chave anon/public.

A chave anon/public pode estar no frontend quando as políticas RLS estão corretas. **Nunca publique a service_role key.**

## 3. Publicar no GitHub
1. Crie um repositório no GitHub, por exemplo `onestate`.
2. Envie todos os arquivos e pastas deste projeto para a raiz do repositório.
3. Não envie senhas, service_role keys ou arquivos `.env`.

## 4. Publicar na internet
Use Vercel (importando o repositório GitHub) ou GitHub Pages:
- Vercel: importe o repositório e publique.
- GitHub Pages: Settings > Pages > Deploy from a branch > `main` > `/root`.

O projeto usa JavaScript ES Modules e CDN. Hospede em HTTPS.

## Segurança
- O frontend verifica `app_metadata.role`.
- O banco aplica Row Level Security e só permite operações a usuários autenticados cujo `app_metadata.role` seja `admin`.
- Usuários sem login e usuários autenticados sem a função admin não conseguem ler nem alterar as tabelas.
- Não compartilhe a conta do administrador.
- Ative MFA no Supabase se disponível.

## Parâmetros iniciais do jogo
- 5 máquinas.
- 2.500 essências no armazém.
- 250 joias de capacidade do cofre.
- 10 essências por joia.
- 250 essências por máquina/ciclo.
- 482 minutos por ciclo (8h02).
- Entregas: 2 × 120 às 12h30 e 2 × 120 às 21h.

## Simulador e temporizadores
- O simulador é uma ferramenta de planejamento: não grava lançamentos no banco.
- Os temporizadores são independentes por máquina e guardam o estado no navegador usado pelo administrador. Não sincronizam entre computadores ou navegadores e não enviam notificações quando o ciclo termina.
- A projeção diária considera a produção contínua proporcional ao tempo de ciclo; a produção real pode variar conforme abastecimento, disponibilidade e regras do jogo.

## Limitações da primeira versão
- Sem recuperação de senha dentro da interface; redefina pelo painel Supabase.
- A geração em lote evita registros existentes da mesma pessoa/data/operação, mas não é um sistema de transações em lote.
- O administrador deve confirmar manualmente as entregas concluídas.
- A publicação e configuração do Supabase/GitHub exigem ações na conta do proprietário.
