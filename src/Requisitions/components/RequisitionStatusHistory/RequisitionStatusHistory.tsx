import { useContext, useEffect, useState } from 'react';
import { AlertInterface, StatusChange } from '../../types';
import { Alert, AlertColor, Box } from '@mui/material';
import { getStatusHistory } from '../../utils';
import { Typography } from '@mui/material';
import typographyStyles from '../../utilStyles';
import { RequisitionContext } from '../../context/RequisitionContext';
import { formatDate } from '../../../generalUtilities';


interface props {
    requisitionId: number;
}

const RequisitionStatusHistory = ({ requisitionId }: props) => {
  const {refreshRequisition }= useContext(RequisitionContext);
  const [rows, setRows] = useState<StatusChange[]>();
  const [alert, setAlert] = useState<AlertInterface>();


  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  useEffect(() => {
    const fetchStatusChanges = async () => {
      try {
        const data = await getStatusHistory(requisitionId);
        console.log('data: ', data)
        setRows(data);
      } catch (error) {
        console.error("Error fetching status changes:", error);
        displayAlert(
          "error",
          "Falha ao carregar histórico de status da requisição"
        );
      }
    };

    fetchStatusChanges();
  }, [refreshRequisition]);

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        gap: 1,
        maxHeight: 300,
        overflowY: "scroll",
      }}
    >
      {alert && <Alert severity={alert?.severity as AlertColor}>{alert?.message}</Alert>}
      {rows &&
        rows.map((row) => (
          <Box
            key={row.id_alteracao}
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 2,
              marginBottom: 1,
              border: "1px solid #ccc",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              sx={{ ...typographyStyles.bodyText, textTransform: "capitalize" }}
            >
              {row.alterado_por_pessoa.NOME.toLowerCase()}
            </Typography>
            <Typography sx={{ ...typographyStyles.bodyText }}>
              alterou para "{row.status_nome}"
            </Typography>
            <Typography sx={{ ...typographyStyles.smallText }}>
              {formatDate(row.data_alteracao.toString())}
            </Typography>
          </Box>
        ))}
    </Box>
  );

};

export default RequisitionStatusHistory