export const dominioNiveis = [
  { nivel: 1, emoji: '🥴', descricao: 'Começando do zero' },
  { nivel: 2, emoji: '😅', descricao: 'Ainda confuso' },
  { nivel: 3, emoji: '🙂', descricao: 'Pegando o ritmo' },
  { nivel: 4, emoji: '😎', descricao: 'Mandando bem' },
  { nivel: 5, emoji: '🚀', descricao: 'Dominei!' },
]

export function obterDominio(nivel) {
  return dominioNiveis.find((item) => item.nivel === Number(nivel)) ?? dominioNiveis[0]
}
