import { MercadoLivreOrder } from "./MercadoLivreOrder";

export interface TrackingListProps {
  orders: MercadoLivreOrder[];
  palavrasChavePorCodigo?: Record<string, string[]>;
}
