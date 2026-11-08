# Biblioteca Externa v1.0.0 — reconstruída do zero

Extensão para Owlbear Rodeo feita com **HTML, CSS e JavaScript puros**. A interface não depende de npm, Vite, React, build:pages ou SDK para aparecer. O SDK é carregado **separadamente e de forma opcional** quando aberta dentro de um iframe do Owlbear; erros na integração não deixam a tela branca.

## Publicar no repositório já existente

1. Acesse `https://github.com/Taykyo-Feru/owlbear-biblioteca`.
2. **Exclua os arquivos antigos** do repositório ou, preferencialmente, crie um repositório novo para evitar que workflows antigos concorram com este. Se usar o antigo, remova o workflow `.github/workflows/deploy.yml` antes de enviar o novo.
3. Envie os arquivos **dentro** desta pasta para a raiz de seu repositório (incluindo `.github/workflows/pages.yml` e `scripts/manifest.mjs`). Não envie o ZIP em si.
4. Em **Settings → Pages → Source**, selecione **GitHub Actions**.
5. Em **Actions**, execute **Publicar Biblioteca Externa (sem build)** ou faça commit na branch `main`.
6. Confira o manifesto: `https://taykyo-feru.github.io/owlbear-biblioteca/manifest.json`.
7. No perfil de Owlbear Rodeo, use esse URL para adicionar a extensão e habilite-a na sala.

O workflow gera automaticamente URLs absolutas no manifesto, respeitando seu usuário e nome do repositório. Não há npm install nem compilação.

## Teste em duas etapas

- **Fora do Owlbear:** abra `https://taykyo-feru.github.io/owlbear-biblioteca/` e cadastre uma imagem pública HTTPS. A interface deve funcionar imediatamente. O status será `Modo biblioteca`.
- **Dentro do Owlbear:** abra a extensão em uma sala com cena ativa. O status deve exibir `Owlbear conectado`, e o botão Inserir poderá adicionar a imagem na cena. O primeiro acesso ao SDK usa CDN (jsDelivr, com fallback esm.sh). Se os CDNs forem bloqueados, o diagnóstico dirá isso, mas a biblioteca continuará funcionando.

## O que faz

- Cadastra links diretos de imagens e suas origens (qualquer hospedagem pública que entregue a imagem).
- Categorias: mapas, tokens/personagens, objetos, montarias e anexos visuais.
- Pesquisa, pré-visualização, remoção, duplicatas evitadas.
- Backup exportável/importável em JSON.
- Tenta inserir no Owlbear via SDK, camada correspondente e tamanho selecionado.

## Limitações importantes

- Links de páginas de compartilhamento (Drive, Dropbox etc.) **não são necessariamente links diretos**. Muitos hosts impedem carregamento cruzado ou aplicação na cena.
- O catálogo é salvo em `localStorage` do navegador/origem — não sincroniza com o GitHub nem outros dispositivos.
- A conexão SDK usa importação ESM de CDNs terceirizados. Caso não estejam acessíveis, a integração não funcionará; a interface continua visível e mostra diagnóstico.
- O uso de imagem em `ADD_ITEMS` depende das regras de acesso do provedor externo e da compatibilidade de tipo/camada. Deve ser validado em uma sala real do Owlbear.
- Não existe upload nem autenticação de contas privadas nesta versão.

## Diagnóstico (em caso de falha)

1. Verifique se `/` mostra a interface. Se mostrar, a publicação está correta.
2. Abra `manifest.json` e confira `action.popover` apontando para seu endereço GitHub Pages.
3. Se o SDK não conectar, veja a mensagem `Diagnóstico` no rodapé da interface. Use F12/Console só se necessário.

## Desenvolvedor

Para testar localmente sem npm: `python -m http.server 8000` e visite `http://localhost:8000/`. A interface estática pode até abrir diretamente o `index.html`, com ressalvas do armazenamento. Para publicar, somente o GitHub Pages é necessário.
