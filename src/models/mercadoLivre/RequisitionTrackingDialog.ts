export interface ItemComPalavraChave {
  produto_descricao: string;
  palavras: string[];
}

export interface RequisitionTrackingDialogProps {
  open: boolean;
  onClose: () => void;
  codigos: string[];
  itensComPalavraChave?: ItemComPalavraChave[];
  palavrasChavePorCodigo?: Record<string, string[]>;
}
