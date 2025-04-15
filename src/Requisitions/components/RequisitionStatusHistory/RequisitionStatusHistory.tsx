import { useEffect, useState } from 'react';
import { AlertInterface } from '../../types';
import { Box } from '@mui/material';
import { getStatusHistory } from '../../utils';


interface props {
    requisitionId: number;
}

const RequisitionStatusHistory = ({ requisitionId }: props) => {

  const [statusHistory, setstatusHistory] = useState<any>();
  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);


useEffect(() => {
    console.log("Status History:", statusHistory);
    console.log("Alert:", alert);
    console.log("Loading:", loading);
    console.log("setState: ", setLoading);
}, [statusHistory, alert, loading]);


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
         setstatusHistory(data);
      } catch (error) {
        console.error("Error fetching status changes:", error);
        displayAlert('error', 'Falha ao carregar histórico de status da requisição');
      }
    };

    fetchStatusChanges();
  }, []);

  return ( 
       <Box>

        </Box>
  )

};

export default RequisitionStatusHistory