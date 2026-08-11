import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService, {
  ML_CALLBACK_STATE,
} from "../../services/mercadoLivre/MercadoLivreService";

const MercadoLivreCallback = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || state !== ML_CALLBACK_STATE || processedRef.current) {
      return;
    }

    processedRef.current = true;

    const clearParams = () => {
      const params = new URLSearchParams(searchParams);
      params.delete("code");
      params.delete("state");
      setSearchParams(params, { replace: true });
    };

    MercadoLivreService.connect(code)
      .then(() => {
        dispatch(
          setFeedback({
            message: "Conta do Mercado Livre conectada com sucesso",
            type: "success",
          })
        );
      })
      .catch((err: any) => {
        dispatch(
          setFeedback({
            message:
              err?.response?.data?.error ||
              "Erro ao conectar a conta do Mercado Livre",
            type: "error",
          })
        );
      })
      .finally(clearParams);
  }, [searchParams, setSearchParams, dispatch]);

  return null;
};

export default MercadoLivreCallback;
