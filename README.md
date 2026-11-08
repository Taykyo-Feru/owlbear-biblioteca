# Biblioteca Externa para Owlbear Rodeo — versão 1.2

Projeto totalmente estático, sem build, sem npm, sem workflow: `index.html`, `manifest.json`, `icon.svg` e `.nojekyll` na **raiz do repositório**.

## Publicação

1. Na aba **Code** do GitHub, exclua ou substitua o `index.html` de teste pelo novo `index.html`.
2. Adicione `manifest.json` e `icon.svg` na raiz do repositório; inclua `.nojekyll` se conseguir carregar arquivos com ponto.
3. Em **Settings → Pages**, mantenha **Deploy from a branch → main → /(root)**.
4. Após a publicação, abra `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
5. Confira `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/manifest.json`.
6. No Owlbear Rodeo, adicione este link de `manifest.json` como extensão personalizada e ative-a em uma sala.

## Funções

- Biblioteca de links de imagens HTTPS.
- Miniaturas, categorias (mapa, token, objeto e anexo), campo de origem, pesquisa, edição e exclusão.
- Backup e importação JSON, com duplicatas por URL ignoradas.
- Tentativa de inserção na cena via SDK oficial do Owlbear Rodeo, carregado apenas ao clicar no botão Inserir na cena.
- Mensagens de erro visíveis. A interface **não precisa do SDK para abrir**.

## Limitações

- Os links ficam no `localStorage` do navegador/origem. Não sincroniza entre computadores. Use exportar backup.
- O servidor das imagens precisa aceitar exibição externa. Alguns links de compartilhamento do Drive/Dropbox não são URLs diretas.
- O SDK é importado sob demanda de `https://esm.sh/@owlbear-rodeo/sdk@3.1.0` e depende desse CDN estar disponível. Caso esteja bloqueado, o cadastro continua funcionando, mas inserir na cena falhará com mensagem.
- Imagens não são copiadas para o Owlbear; seus URLs devem continuar públicos.
- A inserção na cena depende de validação dentro do VTT real; não foi testada em sessão.
