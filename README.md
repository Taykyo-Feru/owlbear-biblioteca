# Biblioteca Externa v1.3 — diagnóstico de conexão Owlbear

Esta atualização conserva os itens na mesma chave de armazenamento (`owlbear.external.library.static.v1`).

## Publicação (sem npm)

Suba para a RAIZ da branch main os arquivos `index.html`, `manifest.json`, `manifest-v130.json`, `icon.svg` e `.nojekyll`. Em Settings > Pages mantenha Deploy from a branch > main > /(root).

Primeiro abra https://taykyo-feru.github.io/owlbear-biblioteca/?v=130 e confirme versão 1.3. Depois confira que https://taykyo-feru.github.io/owlbear-biblioteca/manifest-v130.json mostra 1.3.0. No Owlbear, instale pelo endereço do manifesto versionado, como extensão nova, e abra na sala.

## O que mudou

- O SDK é inicializado quando o painel abre, sem aguardar clique em Inserir.
- A espera por onReady foi ampliada para 20 s, com leitura de isReady, timeout controlado e retry.
- Há segunda fonte para importar o SDK e mensagens de diagnóstico para diferenciar download e conexão.
- O cadastro e os backups continuam funcionando fora do Owlbear.

Não foi possível testar a conexão real numa sala Owlbear neste ambiente. O diagnóstico vai mostrar onde parou, sem afirmar que a inserção já está corrigida. Se o status ficar em Falha de inicialização, envie a mensagem completa do diagnóstico.
