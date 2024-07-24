/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from "react";
import {
  Item,
  deleteRequisitionItem,
  updateRequisitionItems,
} from "../../utils";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { requisitionItemsTableProps } from "../../types";
import DeleteRequisitionItemModal from "../modals/warnings/DeleteRequisitionITemModal";
import ItemObservationModal from "../modals/ItemObservation";
import ItemFilesModal from "../modals/ItemFilesModal";
import { ItemsContext } from "../../context/ItemsContext";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


const RequisitionItemsTable: React.FC<requisitionItemsTableProps> = ({ items }) => {
  const columns = ["Materiais / Serviços", "Codigo", "OC", "Quantidade"];
  const {
    editing,
    deleting,
    toggleChanging,
    toggleEditing,
    toggleDeleting,
    setEditing,
    toggleEditingObservation,
    toggleRefreshItems } = useContext(ItemsContext)

  const handleDelete = async (requisitionItem: Item) => {
    try {
        await deleteRequisitionItem(
        Number(requisitionItem.ID_PRODUTO),
        requisitionItem.ID_REQUISICAO
      );
      toggleDeleting();
      toggleRefreshItems();
    } catch (e) {
      console.log('erro delete item: ', e);
    }
  };
  const handleSave = async () => {
    if (editing[1]) {
      await updateRequisitionItems([editing[1]], editing[1]?.ID_REQUISICAO)
      toggleEditing();
      toggleRefreshItems();
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    if (editing[1]) {
      setEditing([editing[0], { ...editing[1], [id]: value }]);
    }
  };

  const handleCancelItem = async (item: Item) => {
    item.ATIVO = 0;
    await updateRequisitionItems([item], item.ID_REQUISICAO);
    toggleRefreshItems()
  };

  const handleActivateItem = async (item: Item) => {
    item.ATIVO = 1;
    await updateRequisitionItems([item], item.ID_REQUISICAO);
    toggleRefreshItems()
  };

  return (
    // <div  className="border w-full p-2 overflow-auto overflow-y-scroll border-blue-100 flex flex-col items-center">
    <Box sx={{ width: '100%', height: '100%' }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell align="left">{column}</TableCell>
              ))}

            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.ID}
                sx={{ backgroundColor: item.ATIVO && item.ATIVO > 0 ? 'transparent' : '#ececec'}}
              >

                <TableCell align="left">
                  <Stack direction="column" alignItems="start" spacing={0.5}>
                    <Stack direction="row" alignItems="center">
                          <Typography sx={{
                          fontSize: {
                            xs: '12px',
                            md: '14px'
                          }
                        }}>{item.nome_fantasia}
                          </Typography>
                          <IconButton onClick={() => toggleChanging(item)}>
                            <ArrowDropDownIcon />
                          </IconButton>
                    </Stack>
                    <Stack direction="row"
                      spacing={1}
                      sx={{ flexWrap: 'nowrap' }}>
                      <Button onClick={() => toggleEditingObservation(item)}>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            textTransform: 'capitalize',
                            color: item.ATIVO && item.ATIVO > 0 ? 'blue' : 'gray'
                          }}>
                          {item.OBSERVACAO !== 'null' && item.OBSERVACAO ?
                            item.OBSERVACAO : 'Observação'}
                        </Typography>
                      </Button>
                      <ItemFilesModal itemID={item.ID} />
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell align="left">
                  {item.codigo}
                </TableCell>

                <TableCell align="left">
                  <Stack direction="row">
                    <input
                      id="OC"
                      onChange={(e) => handleChange(e)}
                      style={{ width: '6rem', backgroundColor: '#e7eaf6', paddingLeft: '6px', borderRadius: '5px', outline: 'none', border: editing[1]?.ID === item.ID ? '1px solid blue' : 'none', height: '40px' }}
                      type="text"
                      disabled={!(editing[0] && editing[1]?.ID === item.ID)} value={editing[1]?.ID === item.ID ? editing[1]?.OC : item.OC}
                    />

                  </Stack>
                </TableCell>

                <TableCell align="left">
                  <Stack direction="row">
                    <input
                      id='QUANTIDADE'
                      onChange={(e) => handleChange(e)}
                      style={{ width: '6rem', backgroundColor: '#e7eaf6', paddingLeft: '6px', borderRadius: '5px', outline: 'none', border: editing[1]?.ID === item.ID ? '1px solid blue' : 'none' }}
                      type="text"
                      disabled={!(editing[0] && editing[1]?.ID === item.ID)}
                      autoFocus
                      value={editing[1]?.ID === item.ID ? editing[1]?.QUANTIDADE : item.QUANTIDADE}
                    />
                    <IconButton
                      id={String(item.ID)}
                      className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                      onClick={() => toggleEditing(item)}
                    >
                      <EditIcon
                        className={
                          item.ATIVO && item.ATIVO > 0
                            ? `cursor-pointer text-blue-600`
                            : `cursor-pointer text-blue-gray-100`
                        }
                      />
                    </IconButton>
                    <IconButton
                      id={String(item.ID_PRODUTO)}
                      className={
                        item.ATIVO && item.ATIVO > 0
                          ? `cursor-pointer text-red-600`
                          : `cursor-pointer text-blue-gray-100`
                      }
                      onClick={() => toggleDeleting(item)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                    <Switch
                      checked={item.ATIVO ? item.ATIVO > 0 : false}
                      onChange={() =>
                        item.ATIVO && item.ATIVO > 0
                          ? handleCancelItem(item)
                          : handleActivateItem(item)
                      }
                    />
                  </Stack>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ItemObservationModal />

      {editing[0] && (
        <Button
          onClick={() => handleSave()}
          sx={{ padding: "1rem", margin: "2rem" }}
        >
          SALVAR
        </Button>
      )}
      {deleting[0] && (
        <DeleteRequisitionItemModal handleDelete={handleDelete} />
      )}
    </Box>
    // </div>
  );
};

export default RequisitionItemsTable;
