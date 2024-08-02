/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import {
  Item,
  deleteRequisitionItem,
  updateRequisitionItems,
} from "../../utils";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { requisitionItemsTableProps } from "../../types";
import DeleteRequisitionItemModal from "../modals/warnings/DeleteRequisitionITemModal";
import ItemObservationModal from "../modals/ItemObservation";
import ItemFilesModal from "../modals/ItemFilesModal";
import { ItemsContext } from "../../context/ItemsContext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ItemActions from "./ItemActions";
// import { userContext } from "../../context/userContext";

const RequisitionItemsTable: React.FC<requisitionItemsTableProps> = ({
  items,
  currentStatus

}) => {

 
  const [editItemsAllowed, setEditItemsAllowed] = useState<boolean>(currentStatus === 'Em edição' ? true : false);
  const [editItemsNotAllowedAlert, setEditItemsNotAllowedAlert] = useState(false);
  useEffect(() => {
    setEditItemsAllowed(currentStatus === "Em edição" ? true : false);
  }, [currentStatus]);

  const columns = ["Materiais / Serviços", "Codigo", "OC", "Quantidade"];
  const {
    editing,
    deleting,
    selection,
    changeSelection,
    toggleChanging,
    toggleEditing,
    toggleDeleting,
    setEditing,
    toggleEditingObservation,
    toggleRefreshItems,
  } = useContext(ItemsContext);

  const [copiedAlert ,setCopiedAlert] = useState<boolean>(false);
  const displayAlert = ( ) => { 
    setTimeout(( ) =>  { 
      setEditItemsNotAllowedAlert(false);
    }, 3 * 1000);
    console.log('alert false')
    setEditItemsNotAllowedAlert(true);
  }
  const handleDelete = async (requisitionItems: Item[]) => {

   if(editItemsAllowed) {
     try {
       const deletePromises = requisitionItems.map((item) =>
         deleteRequisitionItem(Number(item.ID_PRODUTO), item.ID_REQUISICAO)
       );
       await Promise.all(deletePromises);
     } catch (e) {
       console.log("erro delete item: ", e);
     }
     toggleDeleting();
     toggleRefreshItems();
     return;
   }
    toggleDeleting();
    displayAlert();
  };

  const handleSave = async () => {
    if (editing[1]) {
      await updateRequisitionItems([editing[1]], editing[1]?.ID_REQUISICAO);
      toggleEditing();
      toggleRefreshItems();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    if (editing[1]) {
      setEditing([editing[0], { ...editing[1], [id]: value }]);
    }
  };

  const handleCancelItems = async (items: Item[]) => {
    items.forEach(async (item) =>  {
       item.ATIVO = 0;
       await updateRequisitionItems([item], item.ID_REQUISICAO);
    });
    toggleRefreshItems();
  };

  const handleActivateItems = async (items: Item[]) => {
    items.forEach( async (item) => { 
        item.ATIVO = 1;
        await updateRequisitionItems([item], item.ID_REQUISICAO);
    })
    toggleRefreshItems();
  };

  const handleCopyContent = async (selectedItems : Item[]) => {
    const tempDiv = document.createElement("div");
    const table = createCopiedTable(selectedItems);
    tempDiv.appendChild(table);
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    const type = "text/html";
    const blob = new Blob([tempDiv.innerHTML], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    await navigator.clipboard.write(data);
  };

  const createCopiedTable = (selectedItems : Item[]) => {
    const table = document.createElement("table");
    table.appendChild(document.createElement("thead"));
    const tableHead = table.firstChild;
    tableHead?.appendChild(document.createElement("tr"));
    const tableHeadRow = tableHead?.firstChild;
    const columns = ["Material/Serviço", "Quantidade"];
    columns.forEach((column, index) => {
      tableHeadRow?.appendChild(document.createElement("th"));
      if (tableHeadRow) {
        tableHeadRow.childNodes[index].textContent = column;
      }
    });
    table.appendChild(document.createElement("tbody"));
    const tableBody = table.childNodes[1];
    if (tableBody) {
      selectedItems.forEach((item, index) => {
        tableBody.appendChild(document.createElement("tr"));
        const tableRow = tableBody?.childNodes[index];
        if (tableRow) {
          tableRow.appendChild(document.createElement("td"));
          tableRow.appendChild(document.createElement("td"));
          tableRow.childNodes[0].textContent = item.nome_fantasia;
          tableRow.childNodes[1].textContent = String(item.QUANTIDADE) + ' ' + item.UNIDADE;
        }
      });
      table.style.fontFamily = "arial, sans-serif";
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      const cells = table.querySelectorAll("td");
      cells.forEach((cell) => {
        cell.style.border = "1px solid #dddddd";
        cell.style.textAlign = "left";
        cell.style.padding = "8px";
      });
    }
    setCopiedAlert(true);
    setTimeout(() => { 
      setCopiedAlert(false);
    }, 5000);
   
    console.log("table: ", table);
    return table;
  };

  const handleSelectAll = (e:React.ChangeEvent<HTMLInputElement> ) =>  { 
    if(e.target.checked){ 
          changeSelection([...items]);
          return
    }
    changeSelection([]);
  }

  const handleSelectItem = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: Item
  ) => {
    if(e.target.checked && selection.items.indexOf(item) === -1){ 
      console.log("indexOfItem check: ", selection.items.indexOf(item));
      const selectedItems = [...selection.items];
      selectedItems.push(item);
      changeSelection(selectedItems);
      console.log('selectedItems: ', selectedItems);
      return
    }
    const indexOfItem = selection.items.indexOf(item);
    console.log("indexofItem: ", indexOfItem);
    const selectedItems = [...selection.items];
    selectedItems.splice(indexOfItem, 1);
    console.log("selectedItems: ", selectedItems);
    changeSelection(selectedItems);
  };

  return (
    // <div  className="border w-full p-2 overflow-auto overflow-y-scroll border-blue-100 flex flex-col items-center">
    <Box sx={{ width: "100%", height: "100%" }}>
      {editItemsNotAllowedAlert && (
        <Alert
          sx={{
            position: "absolute",
            top: "20%",
            right: "40%",
            left: "40%",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
            animation: "-moz-initial",
          }}
          variant="filled"
          severity="warning"
        >
          Só é possível editar items quanado o Status é 'Em edição'
        </Alert>
      )}
      {copiedAlert && (
        <Alert
          sx={{
            position: "absolute",
            top: "10%",
            right: "45%",
            transition: "ease-in-out",
          }}
          variant="filled"
          severity="success"
        >
          Items Copiados para Área de transferência
        </Alert>
      )}
      <TableContainer component={Paper} sx={{ paddingX: "0.5rem" }}>
        <Table
          className="itemsTable"
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell align="left">
                  {column === "Quantidade" ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography>{column}</Typography>
                      <Stack direction="row" spacing={-1}>
                        <ItemActions
                          handleDelete={handleDelete}
                          handleCancelItems={handleCancelItems}
                          handleActivateItems={handleActivateItems}
                          handleCopyContent={handleCopyContent}
                        />
                        <Checkbox
                          onChange={(e) => handleSelectAll(e)}
                        ></Checkbox>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography>{column}</Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.ID}
                sx={{
                  backgroundColor:
                    item.ATIVO && item.ATIVO > 0 ? "transparent" : "#ececec",
                }}
              >
                <TableCell align="left">
                  <Stack
                    height="fit-content"
                    direction={{ xs: "column", md: "column" }}
                    alignItems="start"
                    spacing={0.5}
                  >
                    <Stack direction="row" alignItems="center">
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "12px",
                            md: "14px",
                          },
                        }}
                      >
                        {item.nome_fantasia}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          editItemsAllowed
                            ? toggleChanging(item)
                            : displayAlert()
                        }
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <Button
                        onClick={() =>
                          editItemsAllowed
                            ? toggleEditingObservation(item)
                            : displayAlert()
                        }
                      >
                        <Typography
                          sx={{
                            fontSize: "11px",
                            textTransform: "capitalize",
                            color:
                              item.ATIVO && item.ATIVO > 0 ? "blue" : "gray",
                          }}
                        >
                          {item.OBSERVACAO !== "null" && item.OBSERVACAO
                            ? item.OBSERVACAO
                            : "Observação"}
                        </Typography>
                      </Button>
                      <ItemFilesModal
                        displayAlert={displayAlert}
                        editItemsAllowed={editItemsAllowed}
                        itemID={item.ID}
                      />
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell align="left">{item.codigo}</TableCell>

                <TableCell align="left">
                  <Stack direction="row">
                    <input
                      onKeyDown={(e) => {
                        e.key === "Enter" && handleSave();
                      }}
                      id="OC"
                      onChange={(e) => handleChange(e)}
                      style={{
                        width: "6rem",
                        backgroundColor: "#e7eaf6",
                        paddingLeft: "6px",
                        borderRadius: "5px",
                        outline: "none",
                        border:
                          editing[1]?.ID === item.ID
                            ? "1px solid blue"
                            : "none",
                        height: "40px",
                      }}
                      type="text"
                      disabled={!(editing[0] && editing[1]?.ID === item.ID)}
                      value={
                        editing[1]?.ID === item.ID ? editing[1]?.OC : item.OC
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell align="left">
                  <Stack justifyContent="space-between" direction="row">
                    <input
                      id="QUANTIDADE"
                      onChange={(e) => handleChange(e)}
                      style={{
                        width: "6rem",
                        backgroundColor: "#e7eaf6",
                        paddingLeft: "6px",
                        borderRadius: "5px",
                        outline: "none",
                        border:
                          editing[1]?.ID === item.ID
                            ? "1px solid blue"
                            : "none",
                      }}
                      onKeyDown={(e) => {
                        e.key === "Enter" && handleSave();
                      }}
                      type="text"
                      disabled={!(editing[0] && editing[1]?.ID === item.ID)}
                      autoFocus
                      value={
                        editing[1]?.ID === item.ID
                          ? editing[1]?.QUANTIDADE
                          : `${item.QUANTIDADE} ${item.UNIDADE}`
                      }
                    />
                    <IconButton
                      id={String(item.ID)}
                      className="delete hover:bg-slate-300 rounded-sm p-[0.5]"
                      onClick={() => {
                        editItemsAllowed ? toggleEditing(item) : displayAlert();
                      }}
                    >
                      <EditIcon
                        className={
                          item.ATIVO && item.ATIVO > 0
                            ? `cursor-pointer text-blue-600`
                            : `cursor-pointer text-blue-gray-100`
                        }
                      />
                    </IconButton>
                    <Checkbox
                      checked={
                        selection.items.find((selected) => selected === item)
                          ? true
                          : false
                      }
                      onChange={(e) => handleSelectItem(e, item)}
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
