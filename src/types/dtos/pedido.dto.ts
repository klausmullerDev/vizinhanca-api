export interface PedidoCreateDTO {
  titulo: string;
  descricao: string;
  imagem?: string;
  authorId: string;
}

export interface PedidoUpdateDTO {
  titulo?: string;
  descricao?: string;
  imagem?: string;
  status?: 'ABERTO' | 'FINALIZADO' | 'CANCELADO';
}