import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import { MercadoLivreApp } from "../../models/mercadoLivre/MercadoLivreOrder";

const ConnectAccountsAlert = () => {
  const dispatch = useDispatch();
  const [apps, setApps] = useState<MercadoLivreApp[]>([]);

  const loadStatus = useCallback(async () => {
    try {
      const status = await MercadoLivreService.getStatus();
      setApps(status.apps || []);
    } catch {
      setApps([]);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConnect = async (indice: number) => {
    try {
      const { url } = await MercadoLivreService.getAuthorizationUrl(indice);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao gerar link de conexão",
          type: "error",
        })
      );
    }
  };

  return (
    <Alert severity="info">
      <Stack spacing={1}>
        <span>
          Conecte as contas do Mercado Livre. Saia da conta atual no site do
          Mercado Livre antes de conectar a segunda, senão a autorização repete a
          mesma conta.
        </span>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {apps.map((app) => (
            <Button
              key={app.indice}
              size="small"
              variant="outlined"
              disabled={app.conectado}
              onClick={() => handleConnect(app.indice)}
            >
              {app.conectado
                ? `Conta ${app.indice} conectada${app.apelido ? `: ${app.apelido}` : ""}`
                : `Conectar conta ${app.indice}`}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Alert>
  );
};

export default ConnectAccountsAlert;
