import React, { useEffect, useState } from "react";
import {
  Item,
  deleteRequisitionItem,
  updateRequisitionItems,
} from "../../utils";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { requisitionItemsTableProps } from "../../types";
import DeleteRequisitionItemModal from "../modals/warnings/DeleteRequisitionITemModal";
import ItemObservationModal from "../modals/ItemObservation";
import ItemFilesModal from "../modals/ItemFilesModal";

const RequisitionItemsTable: React.FC<requisitionItemsTableProps> = ({
  items,
  refreshToggler,
  setRefreshToggler,
}) => {
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const [itemsBeingEdited, setItemsBeingEdited] = useState<Item[]>([]);
  const columns = ["Materiais / Serviços", "Codigo", "OC", "Quantidade"];
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editModeStyle, setEditModeStyle] = useState("");
  const [
    isDeleteRequisitionItemModalOpen,
    setIsDeleteRequisitionItemModalOpen,
  ] = useState<boolean>(false);
  const [itemBeingDeleted, setItemBeingDeleted] = useState<Item>();
  const [isObservationModalOpen, setIsObservationModalOpen] =
    useState<boolean>(false);
  useEffect(() => {
    setRequisitionItems(items);
    setItemsBeingEdited(items);
  }, [items, refreshToggler]);

  const handleSave = async () => {
    try {
      const requisitionID = Number(itemsBeingEdited[0].ID_REQUISICAO);
      await updateRequisitionItems(itemsBeingEdited, requisitionID);
      setRequisitionItems(itemsBeingEdited);
    } catch (e) {
      console.log(e);
    }

    setEditMode(false);
    setEditModeStyle("");
  };

  const handleActivateInput = () => {
    setEditMode(true);
    setEditModeStyle("border border-blue-500 ");
  };

  const handleDelete = async (requisitionItem: Item) => {
    const items = [...requisitionItems];
    try {
      await deleteRequisitionItem(
        Number(requisitionItem.ID_PRODUTO),
        requisitionItem.ID_REQUISICAO
      );
      items.splice(items.indexOf(requisitionItem), 1);
      setRequisitionItems(items);
      setIsDeleteRequisitionItemModalOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, item: Item) => {
    const { value, id } = e.target;
    const currentItems = itemsBeingEdited.map((item) => ({ ...item }));
    const editedItem = currentItems.find((value) =>
      value.nome_fantasia.includes(item.nome_fantasia)
    );
    if (editedItem && id === "inputQuantity") {
      editedItem.QUANTIDADE = Number(value);
    } else if (editedItem && id === "inputOc") {
      editedItem.OC = Number(value);
    }
    setItemsBeingEdited([...currentItems]);
  };

  const handleCancelItem = async (item: Item) => {
    item.ATIVO = 0;
    await updateRequisitionItems([item], item.ID_REQUISICAO);
    setRefreshToggler(!refreshToggler);
  };
  const handleActivateItem = async (item: Item) => {
    item.ATIVO = 1;
    await updateRequisitionItems([item], item.ID_REQUISICAO);
    setRefreshToggler(!refreshToggler);
  };

  return (
    // <div  className="border w-full p-2 overflow-auto overflow-y-scroll border-blue-100 flex flex-col items-center">
    <div className="realative w-full">
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
            {requisitionItems.map((item) => (
              <TableRow  key={item.ID}>
                
                <TableCell align="left">
                  <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography sx={{fontSize:{ 
                            xs : '12px',
                            md: '14px'
                          }}}>{item.nome_fantasia}</Typography>
                          <Stack direction="row"
                            spacing={1}
                            sx={{ flexWrap: 'nowrap' }}>
                            <button
                              onClick={() => {
                                setIsObservationModalOpen(true);
                                setItemsBeingEdited([item]);
                              }}
                              className="text-blue-700 hover:text-blue-600 hover:underline max-w-[300px] lg:max-w-[350px] overflow-hidden"
                            >
                              {(item.OBSERVACAO && item.OBSERVACAO !== 'null')
                                ? item.OBSERVACAO
                                : "observação"}
                            </button>
                            <ItemFilesModal itemID={item.ID} />
                          </Stack>
                  </Stack>
                </TableCell>

                <TableCell align="left">
                  {item.codigo}
                </TableCell>

                <TableCell align="left">
                  <input
                    id="inputOc"
                    onChange={(e) => handleChange(e, item)}
                    className={
                      item.ATIVO && item.ATIVO > 0
                        ? `${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`
                        : ` ${editModeStyle} w-[6rem] bg-gray-200 rounded-md p-1`
                    }
                    type="text"
                    disabled={editMode ? false : true}
                    value={
                      editMode
                        ? itemsBeingEdited.find((value) => value === item)?.OC
                        : item.OC && item.OC > 0
                          ? item.OC
                          : ""
                    }
                  />

                </TableCell>

                <TableCell  align="left">
                  <Stack direction="row">
                    <input
                      id="inputQuantity"
                      onChange={(e) => handleChange(e, item)}
                      className={
                        item.ATIVO && item.ATIVO > 0
                          ? `${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`
                          : ` ${editModeStyle} w-[6rem] bg-gray-200 rounded-md p-1`
                      }
                      type="text"
                      disabled={editMode ? false : true}
                      value={
                        editMode
                          ? itemsBeingEdited.find((value) => value === item)
                            ?.QUANTIDADE
                          : item.QUANTIDADE + ` ${item.UNIDADE}`
                      }
                    />
                    <button
                      id={String(item.ID_PRODUTO)}
                      className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                      onClick={() => handleActivateInput()}
                    >
                      <EditIcon
                        className={
                          item.ATIVO && item.ATIVO > 0
                            ? `cursor-pointer text-blue-600`
                            : `cursor-pointer text-blue-gray-100`
                        }
                      />
                    </button>
                    <button
                      id={String(item.ID_PRODUTO)}
                      className={
                        item.ATIVO && item.ATIVO > 0
                          ? `cursor-pointer text-red-600`
                          : `cursor-pointer text-blue-gray-100`
                      }
                      onClick={() => {
                        setIsDeleteRequisitionItemModalOpen(true);
                        setItemBeingDeleted(item);
                      }}
                    >
                      <DeleteForeverIcon />
                    </button>
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

      {/* <table className="hidden text-sm w-full text-left rtl:text-right text-gray-500 ">
        <thead className="text-xs text-white uppercase bg-gray-50 ">
          <tr className="border border-black">
            {columns.map((columnName) =>
              columnName === "Quantidade" ? (
                <th className="px-4 w-1/4 py-3 border text-black">
                  <h1 className="text-center">{columnName}</h1>
                </th>
              ) : (
                <th className="px-4  py-3 border text-black">
                  <h1 className="text-center">{columnName}</h1>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="">
          {requisitionItems.map((item) => (
            <>
              <tr
                className={
                  item.ATIVO && item.ATIVO > 0
                    ? ` border`
                    : ` border bg-gray-300`
                }
              >
                <td
                  scope="row"
                  className={
                    item.ATIVO && item.ATIVO > 0
                      ? `text-sm px-4 py-2 text-gray-900 whitespace-nowrap border`
                      : `text-sm px-4 py-2 text-gray-600 whitespace-nowrap border`
                  }
                >
                  <p className="overflow-x-auto  max-w-[500px]">
                    {item.nome_fantasia}
                  </p>
                  
                  
                    
                </td>
                <td
                  scope="row"
                  className={
                    item.ATIVO && item.ATIVO > 0
                      ? `text-sm px-4 py-2 text-gray-900 whitespace-nowrap border`
                      : `text-sm px-4 py-2 text-gray-600 whitespace-nowrap border`
                  }
                >
                  <p className="overflow-x-auto  max-w-[500px]">
                    {item.codigo}
                  </p>
                </td>
                <td
                  scope="row"
                  className={
                    item.ATIVO && item.ATIVO > 0
                      ? `text-sm px-1 py-1 text-gray-900 whitespace-nowrap border`
                      : `text-sm px-1 py-1 text-gray-600 whitespace-nowrap border`
                  }
                >
                  <input
                    id="inputOc"
                    onChange={(e) => handleChange(e, item)}
                    className={
                      item.ATIVO && item.ATIVO > 0
                        ? `${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`
                        : ` ${editModeStyle} w-[6rem] bg-gray-200 rounded-md p-1`
                    }
                    type="text"
                    disabled={editMode ? false : true}
                    value={
                      editMode
                        ? itemsBeingEdited.find((value) => value === item)?.OC
                        : item.OC && item.OC > 0
                        ? item.OC
                        : ""
                    }
                  />
                </td>
                <td className="px-4 py-2 flex gap-1 items-center justify-center">
                  <input
                    id="inputQuantity"
                    onChange={(e) => handleChange(e, item)}
                    className={
                      item.ATIVO && item.ATIVO > 0
                        ? `${editModeStyle} w-[6rem] bg-blue-100 rounded-md p-1`
                        : ` ${editModeStyle} w-[6rem] bg-gray-200 rounded-md p-1`
                    }
                    type="text"
                    disabled={editMode ? false : true}
                    value={
                      editMode
                        ? itemsBeingEdited.find((value) => value === item)
                            ?.QUANTIDADE
                        : item.QUANTIDADE + ` ${item.UNIDADE}`
                    }
                  />
                  <button
                    id={String(item.ID_PRODUTO)}
                    className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                    onClick={() => handleActivateInput()}
                  >
                    <EditIcon
                      className={
                        item.ATIVO && item.ATIVO > 0
                          ? `cursor-pointer text-blue-600`
                          : `cursor-pointer text-blue-gray-100`
                      }
                    />
                  </button>
                  <button
                    id={String(item.ID_PRODUTO)}
                    className={
                      item.ATIVO && item.ATIVO > 0
                        ? `cursor-pointer text-red-600`
                        : `cursor-pointer text-blue-gray-100`
                    }
                    onClick={() => {
                      setIsDeleteRequisitionItemModalOpen(true);
                      setItemBeingDeleted(item);
                    }}
                  >
                    <DeleteForeverIcon />
                  </button>
                  <Switch
                    checked={item.ATIVO ? item.ATIVO > 0 : false}
                    onChange={() =>
                      item.ATIVO && item.ATIVO > 0
                        ? handleCancelItem(item)
                        : handleActivateItem(item)
                    }
                  />
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>  */}

      {isObservationModalOpen && (
        <ItemObservationModal
          items={itemsBeingEdited}
          observation={itemsBeingEdited[0].OBSERVACAO}
          setIsObservationModalOpen={setIsObservationModalOpen}
          isObservationModalOpen={isObservationModalOpen}
        />
      )}
      {editMode && (
        <Button
          onClick={() => handleSave()}
          sx={{ padding: "1rem", margin: "2rem" }}
        >
          SALVAR
        </Button>
      )}
      {isDeleteRequisitionItemModalOpen && itemBeingDeleted && (
        <DeleteRequisitionItemModal
          isDeleteRequisitionItemModalOpen={isDeleteRequisitionItemModalOpen}
          setIsDeleteRequisitionItemModalOpen={
            setIsDeleteRequisitionItemModalOpen
          }
          handleDelete={handleDelete}
          item={itemBeingDeleted}
        />
      )}
    </div>
    // </div>
  );
};

export default RequisitionItemsTable;
