/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { userContext } from '../../Requisitions/context/userContext';
import { MovementationChecklist } from '../types';
import { dateTimeRenderer, getPatrimonyNotifications } from '../utils';
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import ErrorIcon from "@mui/icons-material/Error";

import { checklistContext } from '../context/checklistContext';
import ChecklistItemsModal from '../modals/ChecklistItemsModal';

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
//   {
//     width: 150,
//     label: "Patrimônio",
//     dataKey: "id_patrimonio",
//     numeric: true,
//   },

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
  //   {
  //     width: 200,
  //     label: "Nome",
  //     dataKey: "nome",
  //   },
  //   {
  //     width: 200,
  //     label: "Responsável",
  //     dataKey: "responsavel_movimentacao",
  //     numeric: true,
  //   },
  //   {
  //     width: 150,
  //     label: "Responsável Tipo",
  //     dataKey: "responsavel_tipo",
  //     numeric: true,
  //   },
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

   const getNotifications = async () => {
     console.log("getNotifications");
     if (user) {
       const notifications = await getPatrimonyNotifications(user);
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
     return (
       isTypeResponsable(notification) &&
       !notification.aprovado &&
       notification.realizado
     );
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
                    ? isLate()
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

    const isLate = ( ) => { 
      const creationDate = new Date(row.data_criacao);
      const today = new Date();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3);
      return creationDate < threeDaysAgo;
    }

    // const isCurrentResponsable = (row : MovementationChecklist) => { 
    //     return row.responsavel_movimentacao === user?.CODPESSOA;
    // }

     return (
       <React.Fragment>
         {columns.map((column) => (
           <TableCell
             sx={{
               cursor: "pointer"
             }}
             onClick={() => handleOpenChecklist(row)}
             key={column.dataKey}
             align={column.numeric || false ? "left" : "left"}
           >
             {isDateValue(column)
               ? renderDateValue(column)
               : renderValue(column)}
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
    <Box sx={{ height: "95vh", width: "100%", padding: "2rem" }}>
      <Stack sx={{}}></Stack>
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
      <ChecklistItemsModal />
    </Box>
  );
}

export default ChecklistTasks



