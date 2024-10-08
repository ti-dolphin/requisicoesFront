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
import { userContext } from "../../context/userContext";
// import { userContext } from "../../context/userContext";

const RequisitionItemsTable: React.FC<requisitionItemsTableProps> = ({
  items,
  currentStatus,
}) => {
  const { user } = useContext(userContext);
  const [editItemsAllowed, setEditItemsAllowed] = useState<boolean>(
    currentStatus === "Em edição" || user?.PERM_COMPRADOR ? true : false
  );
  
  const [editItemsNotAllowedAlert, setEditItemsNotAllowedAlert] = useState(false);
  useEffect(() => {
    setEditItemsAllowed(currentStatus === "Em edição" || user?.PERM_COMPRADOR  ? true : false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus]);

  const columns = ["Materiais / Serviços", "Observação" , "Codigo", "OC", "Quantidade"];

  const {
    editing,
    deleting,
    selection,
    adding,
    changeSelection,
    toggleChanging,
    toggleEditing,
    toggleDeleting,
    setEditing,
    toggleEditingObservation,
    toggleRefreshItems,
  } = useContext(ItemsContext);

  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);

  const displayAlert = () => {
    setTimeout(() => {
      setEditItemsNotAllowedAlert(false);
    }, 3 * 1000);
    console.log("alert false");
    setEditItemsNotAllowedAlert(true);
  };

  const handleDelete = async (requisitionItems: Item[]) => {
    if (editItemsAllowed) {
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
    const promises = items.map(async (item) => {
      item.ATIVO = 0;
      await updateRequisitionItems([item], item.ID_REQUISICAO);
    });
    await Promise.all(promises);
    toggleRefreshItems();
  };

  const handleActivateItems = async (items: Item[]) => {
    const promises = items.map(async (item) => {
      item.ATIVO = 1;
      await updateRequisitionItems([item], item.ID_REQUISICAO);
    });
    await Promise.all(promises);
    toggleRefreshItems();
  };

  const handleCopyContent = async (selectedItems: Item[]) => {
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

  const createCopiedTable = (selectedItems: Item[]) => {
    const table = document.createElement("table");

    // Criando o cabeçalho da tabela
    table.appendChild(document.createElement("thead"));
    const tableHead = table.firstChild;
    tableHead?.appendChild(document.createElement("tr"));
    const tableHeadRow = tableHead?.firstChild;

    // Adicionando as colunas no cabeçalho
    const columns = ["Material/Serviço", "Quantidade", "Unidade"];
    columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      tableHeadRow?.appendChild(th);
    });

    // Criando o corpo da tabela
    table.appendChild(document.createElement("tbody"));
    const tableBody = table.childNodes[1];

    if (tableBody) {
      selectedItems.forEach((item) => {
        const tr = document.createElement("tr");
        tableBody.appendChild(tr);

        // Criando as células da linha
        const nameCell = document.createElement("td");
        const quantityCell = document.createElement("td");
        const unitCell = document.createElement("td");

        nameCell.textContent = item.nome_fantasia;
        quantityCell.textContent = String(item.QUANTIDADE);
        unitCell.textContent = item.UNIDADE || '';

        tr.appendChild(nameCell);
        tr.appendChild(quantityCell);
        tr.appendChild(unitCell);
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


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      changeSelection([...items]);
      return;
    }
    changeSelection([]);
  };

  const handleSelectItem = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: Item
  ) => {
    if (e.target.checked && selection.items.indexOf(item) === -1) {
      console.log("indexOfItem check: ", selection.items.indexOf(item));
      const selectedItems = [...selection.items];
      selectedItems.push(item);
      changeSelection(selectedItems);
      console.log("selectedItems: ", selectedItems);
      return;
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
          className="drop-shadow-lg"
          sx={{
            top: "10%",
            width: "400px",
            position: "absolute",
            left: "50%",
            marginLeft: "-200px",
          }}
          variant="filled"
          severity="warning"
        >
          Só é possível editar items quando o Status é 'Em edição'
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
                <TableCell align="left" sx={{ padding: 0 }}>
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
            {items.map((item, index) => (
              <TableRow
                key={item.ID}
                sx={{
                  backgroundColor:
                    item.ATIVO && item.ATIVO > 0 ? "transparent" : "#ececec",
                }}
              >
                <TableCell align="left" sx={{ padding: "0" }}>
                  <Stack
                    height="fit-content"
                    direction={{ xs: "column", md: "column" }}
                    alignItems="start"
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
                        {`${index + 1} - ${item.nome_fantasia}`}
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
                  </Stack>
                </TableCell>

                <TableCell>
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
                          color: item.ATIVO && item.ATIVO > 0 ? "blue" : "gray",
                        }}
                      >
                        {item.OBSERVACAO !== "null" && item.OBSERVACAO
                          ? item.OBSERVACAO
                          : "Observação"}
                      </Typography>
                    </Button>
                    <ItemFilesModal
                      currentStatus={currentStatus}
                      displayAlert={displayAlert}
                      editItemsAllowed={editItemsAllowed}
                      itemID={item.ID}
                    />
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
                        editItemsAllowed || adding
                          ? toggleEditing(item)
                          : displayAlert();
                      }}
                    >
                      <EditIcon
                        sx={{ color: "#2B3990" }}
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
