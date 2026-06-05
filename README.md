# Modelia CRM

Mini CRM com chat para uma persona/modelo de IA atender contatos, registrar historico e organizar envio de fotos autorizadas.

## Como abrir

Abra o arquivo `index.html` no navegador para testar localmente. Em producao, publique no Cloudflare Pages com o binding D1 `DB`.

## O que ja esta pronto

- Lista de leads com busca por nome, telefone, interesse, origem ou tag.
- Funil com etapas: Novo, Em contato, Proposta e Ganho.
- Chat por lead com respostas rapidas e registro de foto por URL.
- Galeria de fotos em WebP dentro do CRM para anexar no chat.
- Cadastro de novo lead.
- Notas, proximas acoes e dados do contato.
- Persistencia em Cloudflare D1 via Pages Functions.
- Fallback local usando `localStorage` quando a API nao esta disponivel.

## Cloudflare Pages + D1

1. Crie o banco:

```bash
npx wrangler d1 create modelia
```

2. Copie o `database_id` gerado para `wrangler.toml`.

3. Aplique a migracao:

```bash
npx wrangler d1 migrations apply modelia
```

4. Publique no Pages apontando para este repositorio.

## Proximos passos sugeridos

- Conectar envio real pela Meta WhatsApp Cloud API.
- Guardar arquivos em R2 em vez de apenas URL externa.
- Adicionar autenticacao do painel.
- Adicionar usuarios, tarefas, anexos e historico de vendas.

## Webhook Meta

Endpoint publico:

`https://modelia.pages.dev/api/webhooks/meta`

Use o valor configurado em `META_VERIFY_TOKEN` como token de verificacao no painel da Meta. O webhook recebe mensagens do WhatsApp, cria o contato quando necessario e salva o historico no D1.

## Imagens das modelos

As imagens ficam em `imagens-modelos/`. Os arquivos convertidos para WebP ficam em `imagens-modelos/webp/` e aparecem automaticamente como cards no CRM quando seguem o padrao `modelo-01.webp`, `modelo-02.webp`, etc.

## Observacoes de operacao

Para mensagens e fotos no WhatsApp, trabalhe apenas com contatos que deram opt-in, mantenha registro de consentimento e use somente imagens autorizadas de pessoas adultas.
