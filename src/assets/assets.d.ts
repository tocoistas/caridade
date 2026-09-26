// Tipos das importações estáticas de imagens (`import logo from '@/assets/logo.png'`).
//
// As declarações vêm do Next, mas em `next-env.d.ts`, que não é versionado e só
// existe depois de um build — o `npm run typecheck` do CI corre antes do build.
// Esta referência, versionada, torna a tipagem independente dessa ordem.
/// <reference types="next/image-types/global" />
