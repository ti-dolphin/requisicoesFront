import { useContext, useEffect, useState } from 'react';
import { AlertInterface, StatusChange } from '../../types';
import { Alert, AlertColor, Box } from '@mui/material';
import { getStatusHistory } from '../../utils';
import { RequisitionContext } from '../../context/RequisitionContext';
import StatusChangeRow from '../StatusChangeRow/StatusChangeRow';


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
         <StatusChangeRow key={row.id_alteracao} row={row} />
        ))}
    </Box>
  );

};

export default RequisitionStatusHistory