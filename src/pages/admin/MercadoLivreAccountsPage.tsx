import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import { MercadoLivreStatus } from "../../models/mercadoLivre/MercadoLivreOrder";
import UpperNavigation from "../../components/shared/UpperNavigation";

const MercadoLivreAccountsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useSelector((state: RootState) => state.user.user);
  const isAdmin = Number(loggedUser?.PERM_ADMINISTRADOR) === 1;

  const [status, setStatus] = useState<MercadoLivreStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");
      const data = await MercadoLivreService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setErro(err?.response?.data?.error || "Erro ao consultar as contas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStatus();
    }
  }, [isAdmin, loadStatus]);

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

  const handleDisconnect = async (mlUserId: string) => {
    try {
      await MercadoLivreService.disconnect(mlUserId);
      dispatch(setFeedback({ message: "Conta desconectada", type: "success" }));
      loadStatus();
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: err?.response?.data?.error || "Erro ao desconectar",
          type: "error",
        })
      );
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
        <UpperNavigation handleBack={() => navigate("/gestao-adm")} />
        <Alert severity="error" sx={{ mt: 3 }}>
          Você não tem permissão para acessar esta tela.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <UpperNavigation handleBack={() => navigate("/gestao-adm")} />

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={1}>
          Contas do Mercado Livre
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Cada aplicação cadastrada no .env autoriza uma conta. Antes de conectar
          a próxima, saia da conta atual no site do Mercado Livre — a autorização
          vale para quem estiver logado no navegador.
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {(status?.apps || []).map((app) => {
              const conta = (status?.contas || []).find(
                (item) => item.apelido === app.apelido && app.conectado
              );

              return (
                <Card key={app.indice} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600}>
                            Aplicação {app.indice}
                          </Typography>
                          <Chip
                            size="small"
                            label={app.conectado ? "Conectada" : "Não conectada"}
                            color={app.conectado ? "success" : "default"}
                          />
                        </Stack>
                        <Typography fontSize="0.8rem" color="text.secondary">
                          {app.conectado
                            ? `Conta: ${app.apelido || conta?.ml_user_id || "—"}`
                            : `Usa ML_CLIENT_ID${app.indice} do .env`}
                        </Typography>
                      </Box>

                      {app.conectado && conta ? (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<LinkOffIcon />}
                          onClick={() => handleDisconnect(conta.ml_user_id)}
                        >
                          Desconectar
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<LinkIcon />}
                          onClick={() => handleConnect(app.indice)}
                        >
                          Conectar
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {!status?.apps?.length && !erro && (
              <Alert severity="warning">
                Nenhuma aplicação configurada. Defina ML_CLIENT_ID1 e
                ML_CLIENT_SECRET1 no .env do backend.
              </Alert>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MercadoLivreAccountsPage;
