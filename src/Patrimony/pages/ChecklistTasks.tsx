/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppBar, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { userContext } from '../../Requisitions/context/userContext';
import { MovementationChecklist } from '../types';
import { dateTimeRenderer, getPatrimonyNotifications } from '../utils';
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import ErrorIcon from "@mui/icons-material/Error";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";

import { checklistContext } from '../context/checklistContext';
import ChecklistItemsModal from '../modals/ChecklistItemsModal';
import { useNavigate } from 'react-router-dom';

interface ColumnData {
  dataKey: keyof MovementationChecklist;
  label: string;
  numeric?: boolean;
  width?: number;
}

const columns: ColumnData[] = [
  {
    width: 150,
    label: "Checklist",
    dataKey: "id_checklist_movimentacao",
    numeric: true,
  },
  {
    width: 150,
    label: "Movimentação",
    dataKey: "id_movimentacao",
    numeric: true,
  },
  {
    width: 180,
    label: "Data de Criação",
    dataKey: "data_criacao",
  },
  {
    width: 100,
    label: "Realizado",
    dataKey: "realizado",
    numeric: true,
  },

  {
    width: 180,
    label: "Data de Realização",
    dataKey: "data_realizado",
  },
  {
    width: 100,
    label: "Aprovado",
    dataKey: "aprovado",
    numeric: true,
  },
  {
    width: 180,
    label: "Data de Aprovação",
    dataKey: "data_aprovado",
  },
  {
    width: 250,
    label: "Observação",
    dataKey: "observacao",
  },
  { 
    width: 200,
    label: 'Projeto',
    dataKey: 'descricao_projeto',
    numeric: false
  },
  {
    width: 200,
    label: "Responsável",
    dataKey: "nome_responsavel",
    numeric: true,
  },
  
];

const VirtuosoTableComponents: TableComponents<MovementationChecklist> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow sx={{ backgroundColor: "#2B3990"}}>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? "left" : "left"}
          style={{ width: column.width }}
          
        >
          <Typography fontSize="small" fontFamily="Roboto" color="white">
            {column.label}
          </Typography>
        </TableCell>
      ))}
    </TableRow>
  );
}

const ChecklistTasks = () => {
   const [notifications, setNotifications] = useState<MovementationChecklist[]>();
   const { user } = useContext(userContext);
   const { toggleChecklistOpen, refreshChecklist } = useContext(checklistContext);
  const navigate = useNavigate();

   const getNotifications = async () => {
     console.log("getNotifications");
     if (user) {
       const notifications = await getPatrimonyNotifications(user);
       console.log('notifications: ', notifications);
       const filteredNotifications = notifications.filter(
         (notification: MovementationChecklist) => {
           if (responsableForTypeNotification(notification)) {
             return notification;
           }
           if (responsableForPatrimonyNotification(notification)) {
             return notification;
           }
         }
       );
       setNotifications(filteredNotifications);
     }
   };

   const responsableForPatrimonyNotification = (
     notification: MovementationChecklist
   ) => {
     return isMovimentationResponsable(notification) && !notification.realizado;
   };

   const responsableForTypeNotification = (
     notification: MovementationChecklist
   ) => {
      if (isTypeResponsable(notification)) {
        if (!notification.aprovado && notification.realizado) {
          return true; //para aprovação
        }
        //para aprovar
        if (
          !notification.aprovado &&
          !notification.realizado && 
          isLate(notification)
        ) {
          return true;
        }
      }
      return false;
     
   };

   const isTypeResponsable = (checklist: MovementationChecklist) => {
     return checklist.responsavel_tipo === user?.responsavel_tipo;
   };

   const isMovimentationResponsable = (checklist: MovementationChecklist) => {
     console.log(
       "isMoveRespnsable: ",
       checklist.responsavel_movimentacao === user?.CODPESSOA
     );
     return checklist.responsavel_movimentacao === user?.CODPESSOA;
   };

     const handleBack = () => {
       navigate("/patrimony");
     };
     const isLate = (row : MovementationChecklist ) => { 
      const creationDate = new Date(row.data_criacao);
      const today = new Date();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3);
      return creationDate < threeDaysAgo;
    }

   function rowContent(_index: number, row: MovementationChecklist) {
     const isDateValue = (column: ColumnData) => {
       return (
         column.dataKey === "data_aprovado" ||
         column.dataKey === "data_realizado" ||
         column.dataKey === "data_criacao"
       );
     };

     const renderDateValue = (column: ColumnData) => {
       const date = dateTimeRenderer(row[column.dataKey] || "");
       return date === "Invalid Date, Invalid Date" ? "" : date;
     };

     const renderValue = (column : ColumnData) => {
        if (column.dataKey === "aprovado") {
          return (
            <ErrorIcon
              sx={{
                color:
                  toBeAproved(row) && isTypeResponsable(row)
                    ? "#ff9a3c"
                    : "gray",
              }}
            ></ErrorIcon>
          );
        }
        if (column.dataKey === "realizado") {
          return (
            <ErrorIcon
              sx={{
                color:
                  toBeDone(row)
                    ? isLate(row)
                      ? "red"
                      : "#ff9a3c"
                    : "gray",
              }}
            ></ErrorIcon>
          );
        }
        return row[column.dataKey];
     };

     const handleOpenChecklist = (row: MovementationChecklist) => {
    
       toggleChecklistOpen(row);
     };
     const toBeDone = (row : MovementationChecklist ) => { 
       return !row.aprovado && !row.realizado;
     }
     const toBeAproved = (row : MovementationChecklist ) => { 
        return row.realizado && !row.aprovado;
    }

  
     return (
       <React.Fragment>
         {columns.map((column) => (
           <TableCell
             sx={{
               cursor: "pointer",
               paddingY: "0.5rem",
             }}
             onClick={() => handleOpenChecklist(row)}
             key={column.dataKey}
             align={column.numeric || false ? "left" : "left"}
           >
             <Typography fontSize="small">
               {isDateValue(column)
                 ? renderDateValue(column)
                 : renderValue(column)}
             </Typography>
           </TableCell>
         ))}
       </React.Fragment>
     );
   }

   useEffect(() => {
     getNotifications();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshChecklist]);


  return (
    <Box
      sx={{
        height: "85vh",
        width: "100%",
        padding: {
          xs: 0.2,
          sm: 2,
          md: 3,
          lg: 2,
          xl: 1,
        },
      }}
    >
      <Box>
        <AppBar
          position="static"
          sx={{
            boxShadow: "none",
            backgroundColor: "#2B3990",
            height: {
              xs: "5rem",
              sm: "4rem",
              md: "4rem",
              lg: "4rem",
              xl: "4rem",
            },
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "0.4rem",
            paddingX: "2rem",
            border: "1px solid white",
          }}
        >
          <Box display="flex" alignItems="center" flexGrow={1} flexShrink={1}>
            <IconButton
              onClick={handleBack}
              sx={{
                color: "#F7941E",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
                zIndex: 1000, // Coloca o ícone acima do modal
              }}
            >
              <ArrowLeftIcon />
            </IconButton>
            <Typography
              variant="h6"
              textAlign="center"
              fontSize="medium"
              fontFamily="Roboto"
              padding={2}
            >
              { 
                notifications?.length ? `Checklists Pendentes do Patrimônio: ${notifications[0].nome_patrimonio} | 000${notifications[0].id_patrimonio}` : 
                `Não há checklists pendentes`
              }
             
            </Typography>
          </Box>
        </AppBar>
      </Box>
      <TableVirtuoso
        data={notifications}
        components={{
          ...VirtuosoTableComponents,
          TableRow: (props) => (
            <TableRow
              {...props}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#e7eaf6" },
              }}
            />
          ),
        }}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        paddingY="0.4rem"
        paddingX="2rem"
      >
        {notifications && (
          <Typography
            variant="body2"
            color="blue"
            fontWeight="semibold"
            fontFamily="Roboto"
          >
            Total de Checklists: {notifications.length}
          </Typography>
        )}
      </Box>
      <ChecklistItemsModal />
    </Box>
  );
}

export default ChecklistTasks



