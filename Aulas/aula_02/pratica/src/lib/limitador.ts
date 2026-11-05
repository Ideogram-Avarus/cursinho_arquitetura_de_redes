/**
 * Limitador de requisições em memória (janela fixa).
 * Usado só no endpoint /api/limite para demonstrar o 429.
 */
export class Limitador {
  private contadores = new Map<string, { quantidade: number; reiniciaEm: number }>();

  constructor(
    public readonly limite: number,
    public readonly janelaMs: number,
  ) {}

  registrar(chave: string, agora = Date.now()) {
    let contador = this.contadores.get(chave);
    if (!contador || contador.reiniciaEm <= agora) {
      contador = { quantidade: 0, reiniciaEm: agora + this.janelaMs };
      this.contadores.set(chave, contador);
    }
    contador.quantidade++;

    return {
      permitido: contador.quantidade <= this.limite,
      restantes: Math.max(0, this.limite - contador.quantidade),
      segundosParaReiniciar: Math.ceil((contador.reiniciaEm - agora) / 1000),
    };
  }

  limpar() {
    this.contadores.clear();
  }
}
