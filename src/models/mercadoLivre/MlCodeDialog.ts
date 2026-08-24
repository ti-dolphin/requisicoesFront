import { RequisitionItem } from "../requisicoes/RequisitionItem";

export interface MlCodeDialogProps {
  item: RequisitionItem | null;
  onClose: () => void;
}
