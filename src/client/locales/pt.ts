/** Brazilian Portuguese dictionary. Words follow pt-BR usage. */

import type { ThemeKey } from '../locales.js'

export const pt = {
  nav: 'Tema',
  'appearance.title': 'Aparência',
  'appearance.desc': 'Escuro / Claro / Sistema',
  'presets.title': 'Temas predefinidos',
  'presets.desc': 'Aplique esquemas de cores populares com um clique',
  'presets.disabled':
    'O tema personalizado está ativado — desative-o para escolher um predefinido',
  'sidebar.title': 'Barra lateral transparente',
  'sidebar.desc': 'Efeito de transparência do painel lateral, somente no macOS',
  'background.title': 'Imagem/vídeo de fundo',
  'background.add': 'Adicionar',
  'background.replace': 'Substituir',
  'background.remove': 'Remover',
  'background.opacity': 'Opacidade',
  'background.blur': 'Desfoque',
  'background.badType':
    'Apenas PNG / JPEG / WebP / AVIF / GIF / MP4 / WebM são suportados',
  'background.tooLarge': 'A imagem/vídeo tem mais de {0} MB — escolha outro',
  'background.uploadFailed':
    'Tema salvo, mas não foi possível enviar a imagem/vídeo de fundo',
  'scheme.light': 'Claro',
  'scheme.dark': 'Escuro',
  'scheme.system': 'Sistema',

  'custom.title': 'Tema personalizado',
  'custom.toggle.desc': 'Crie seu próprio tema personalizado',
  'custom.group.seeds': 'Primária/secundária',
  'custom.group.shiki': 'Bloco de código',
  'custom.mode.label': 'Aparência em edição',
  'custom.neutral.title': 'Neutro',
  'custom.neutral.desc': 'Superfícies e texto. Uma escala por aparência',
  'custom.neutral.lightest': 'Extremidade mais clara',
  'custom.neutral.darkest': 'Extremidade mais escura',
  'custom.neutral.roleBackground': 'Fundo',
  'custom.neutral.roleForeground': 'Primeiro plano',
  'custom.accent.title': 'Destaque',
  'custom.accent.desc': 'Botões e ênfase (deepseek e blue unificados)',
  'custom.green.title': 'Sucesso',
  'custom.green.desc': 'Estados de sucesso',
  'custom.amber.title': 'Aviso',
  'custom.amber.desc': 'Estados de aviso',
  'custom.red.title': 'Erro',
  'custom.red.desc': 'Estados de erro',
  'custom.border.title': 'Borda',
  'custom.border.desc':
    'Cor e opacidade de separadores e contornos; a borda mais forte é derivada automaticamente',
  'custom.shiki.desc': 'Cores dos nove tokens de sintaxe',
  'custom.seed.light': 'Claro',
  'custom.seed.dark': 'Escuro',
  'custom.save': 'Salvar',
  'custom.add': 'Adicionar tema personalizado',
  'custom.edit': 'Editar',
  'custom.export': 'Exportar',
  'custom.import': 'Importar tema',
  'custom.name.placeholder': 'Nome do tema',
  'custom.defaultName': 'Tema personalizado',
  'custom.inUse': 'Em uso',
  'custom.delete': 'Excluir',
  'custom.cancel': 'Cancelar',
  'custom.close': 'Fechar',
  'custom.toast.saved': 'Salvo',
  'custom.toast.failed': 'Falha na operação do arquivo de tema',
  'custom.toast.unavailable':
    'A API de arquivos de tema não está pronta — reinicie o serviço DSH',
  'custom.toast.exported': '«{0}» exportado',
  'custom.toast.imported': '«{0}» importado',
  'custom.importFailed.notArchive': 'Falha na importação: não é um arquivo de tema',
  'custom.importFailed.noDocument':
    'Falha na importação: o arquivo não contém theme.json',
  'custom.importFailed.badDocument':
    'Falha na importação: theme.json não é um tema válido',
  'custom.importFailed.tooNew':
    'Falha na importação: o arquivo de tema é mais recente que este plugin',
  'custom.importFailed.media':
    'Falha na importação: o tema contém um arquivo de mídia não suportado',
  'custom.importFailed.tooLarge':
    'Falha na importação: o arquivo excede o limite de tamanho',
  'custom.importFailed.other': 'Falha na importação: {0}',
  'custom.delete.title': 'Excluir este tema personalizado?',
  'custom.delete.desc': '«{0}» será removido. Isso não pode ser desfeito.',
  'custom.unsaved.title': 'Descartar as alterações não salvas?',
  'custom.unsaved.desc':
    'As alterações em «{0}» não foram salvas e serão perdidas ao fechar as configurações.',
  'custom.unsaved.confirm': 'Descartar e fechar',
  'custom.unsaved.leaveDesc':
    'As alterações em «{0}» não foram salvas. Descartá-las?',
  'custom.unsaved.leaveConfirm': 'Descartar alterações',
  'custom.unsaved.cancel': 'Continuar editando',

  'custom.css.title': 'Estilos personalizados',
  'custom.css.open': 'Abrir folha de estilos',
  'custom.css.copyPath': 'Copiar caminho',
  'custom.css.copied': 'Caminho copiado',
  'custom.css.copyFailed': 'Não foi possível copiar o caminho',
  'custom.css.newTheme':
    'Salve o tema primeiro para adicionar estilos personalizados',
  'custom.css.loading': 'Carregando…',
  'custom.css.loadFailed': 'Não foi possível ler a folha de estilos',
  'custom.css.openFailed': 'Não foi possível abrir a folha de estilos',
  'custom.css.saveFailed':
    'Não foi possível salvar a configuração de estilos personalizados',
  'custom.css.enable': 'Ativar estilos personalizados',
  'custom.css.tooLarge':
    'A folha de estilos tem mais de 256 KB e foi ignorada; abra-a e reduza',
  'custom.css.template.active': 'Aplica-se enquanto este tema estiver ativo.',
  'custom.css.template.variables':
    'Prefira sobrescrever variáveis CSS; o DSH pinta a interface a partir delas, por exemplo:',
  'custom.css.template.example': 'body { --dsw-alias-brand-primary: #7c5cff !important; }',
  'custom.css.template.classes':
    'Evite nomes de classes de componentes do DSH, como ._card_1pq26_9: o hash e o número da linha mudam entre versões, então uma regra pode deixar de corresponder após uma atualização.',
  'custom.css.template.classesHint':
    'Use atributos semânticos, como [data-code-block-banner] (barra do bloco de código), [data-terminal] (terminal) ou [role="dialog"] (diálogos):',
  'custom.css.template.exampleAttribute':
    '[data-code-block-banner] { background: var(--dsw-alias-bg-layer-2); }',
  'custom.css.template.dark': 'Aparência escura: html[data-ds-dark-theme] .selector { ... }',
  'custom.css.template.assets': 'Mídia do tema:',
  'custom.css.template.warning':
    'O CSS pode alterar toda a interface; guarde uma cópia antes de editar.',

  'shiki.constant': 'Constante',
  'shiki.string': 'String',
  'shiki.comment': 'Comentário',
  'shiki.keyword': 'Palavra-chave',
  'shiki.parameter': 'Parâmetro',
  'shiki.function': 'Função',
  'shiki.string-expression': 'String de modelo',
  'shiki.punctuation': 'Pontuação',
  'shiki.link': 'Link',
} satisfies Record<ThemeKey, string>
