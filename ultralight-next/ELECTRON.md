# App de computador (Electron)

O mesmo código do site agora também pode ser empacotado como um aplicativo
de computador (Windows, Mac e Linux), sem afetar o deploy web na Hostinger.

## Como funciona

- `npm run build` / deploy na Hostinger: continua igual, sem nenhuma mudança.
- `ELECTRON_BUILD=true next build` gera uma exportação estática em `out/`,
  que é servida localmente (`http://127.0.0.1:<porta>`) pelo Electron em
  `electron/main.js` + `electron/server.js`.

## Rodar em modo de desenvolvimento (testar o app de computador)

```bash
npm run electron:start
```

## Gerar o instalador

```bash
npm run electron:dist:win    # gera o instalador .exe (precisa rodar em Windows)
npm run electron:dist:mac    # gera o .dmg (precisa rodar em um Mac)
npm run electron:dist:linux  # gera o AppImage (Linux)
```

> Instaladores `.exe` e `.dmg` só podem ser gerados rodando o comando na
> própria plataforma (Windows/Mac), pois dependem de ferramentas nativas
> daquele sistema. Não é possível gerar um `.exe` ou `.dmg` a partir de Linux.
> Uma alternativa é usar um pipeline de CI (ex.: GitHub Actions com matrix
> de Windows/Mac/Linux) para gerar os três instaladores automaticamente.

O instalador final fica em `dist-electron/`.
