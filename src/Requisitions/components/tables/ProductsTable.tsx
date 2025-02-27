import React, { useContext, useEffect, useState } from "react";
import {
  Item,
  Product,
  fetchItems,
  postRequistionItems,
  searchProducts,
  updateRequisitionItems,
} from "../../utils";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ProductsTableProps } from "../../types";
import { ItemsContext } from "../../context/ItemsContext";
import AddIcon from "@mui/icons-material/Add";

// eslint-disable-next-line react-refresh/only-export-components
export const style = {
  position: "absolute",
  borderRadius: "25px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "0.5px solid gray",
  boxShadow: 24,
  p: 4,
};



const RowContent: React.FC<{
  row: Product;
  columns: { width: number; label: string; dataKey: keyof Product }[];
  adding: boolean;
  handleOpen: (row: Product) => void;
  handleChangeItemProduct: (product: Product) => void;
}> = ({ row, columns, adding, handleOpen, handleChangeItemProduct }) => {
  return (
    <React.Fragment>
      {columns.map((column) =>
        column.dataKey === "nome_fantasia" ? (
          <TableCell
            sx={{ paddingY: "4px", width: column.width }}
            key={column.dataKey}
          >
            <Typography fontSize="small">{row[column.dataKey]}</Typography>
          </TableCell>
        ) : (
          <TableCell
            sx={{ paddingY: "4px", width: column.width }}
            key={column.dataKey}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
            >
              <Typography fontSize="small" >
                {row[column.dataKey]}
              </Typography>
              {adding ? (
                <IconButton onClick={() => handleOpen(row)} size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  onClick={() => handleChangeItemProduct(row)}
                  size="small"
                >
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    Substituir
                  </Typography>
                </Button>
              )}
            </Stack>
          </TableCell>
        )
      )}
    </React.Fragment>
  );
};

const ProductsTable: React.FC<ProductsTableProps> = ({ ID_REQUISICAO, TIPO }) => {
  const [currentSelectedItem, setCurrentSelectedItem] = useState<Product>();
  const [filteredRows, setFilteredRows] = useState<Product[]>([]);
  const [openQuantityInput, setOpenQuantityInput] = useState(false);
  const [refreshToggler, setRefreshToggler] = useState<boolean>(false);
  const [addedItems, setAddedItems] = useState<Item[]>([]);
  const { changing, adding, toggleChanging, toggleRefreshItems, refreshItems } =
    useContext(ItemsContext);
  const columns = [
    {
      width: 300,
      label: "Nome",
      dataKey: "nome_fantasia" as keyof Product,
    },
    {
      width: 300,
      label: "Codigo TOTVS",
      dataKey: "codigo" as keyof Product,
    },
  ];
  const fetchData = async () => {
    const itemsData = await fetchItems(ID_REQUISICAO);
    if (itemsData) setAddedItems([...itemsData]);
    console.log('itemsData: ', itemsData);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggler, refreshItems]);

  const handleAddItem = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if ("key" in e && e.key === "Enter" && adding) {
      const { id, value } = e.currentTarget;
      performPostItemCallout(id, value);
      return;
    }
  };

  const handleChangeItemProduct = async (product: Product) => {
    if (changing[1]) {
      const payload = { ...changing[1], ID_PRODUTO: product.ID };
      await updateRequisitionItems([payload], payload.ID_REQUISICAO);
      toggleChanging();
      toggleRefreshItems();
    }
  };

  const handleSearchItem = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      const { value } = e.currentTarget;
      if(TIPO)  {
        const searchResults = await searchProducts(value.toUpperCase(), TIPO);
        console.log("searchResults: ", searchResults);
        if (searchResults) setFilteredRows([...searchResults]);
      }


    }
  };

  const performPostItemCallout = async (id: string, value: string) => {
    const requestBody = [];
    requestBody.push({
      QUANTIDADE: Number(value),
      ID_PRODUTO: Number(id),
      ID_REQUISICAO: ID_REQUISICAO,
    });
    const reqIDParam = ID_REQUISICAO;
    const response = await postRequistionItems(
      requestBody,
      reqIDParam
    );
    if (response) {
      setOpenQuantityInput(false);
      setRefreshToggler(!refreshToggler);
    }
  };

  const handleOpen = (item: Product) => {
    setOpenQuantityInput(true);
    setCurrentSelectedItem({
      ...item,
    });
  };

  const handleClose = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setOpenQuantityInput(false);
    }
  };
  const VirtuosoTableComponents: TableComponents<Product> = {
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

  return (
    <Box>
      <SearchAppBar
        addedItems={addedItems}
        handleSearch={handleSearchItem}
        caller="ItemsTable"
        refreshToggler={false}
        setRefreshTooggler={setRefreshToggler}
      />
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openQuantityInput}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openQuantityInput}>
          <Box
            sx={{
              ...style,
              width: {
                xs: "90%",
                sm: "80%",
                md: "70%",
                lg: "40%",
              },
            }}
          >
            <Button
              onClick={() => setOpenQuantityInput(false)}
              sx={{ position: "absolute", right: "1rem", top: "1rem" }}
            >
              <CloseIcon />
            </Button>
            <Stack direction="column" spacing={2}>
              <Typography
                id="transition-modal-title"
                variant="h6"
                component="h2"
                sx={{ color: "#233142" }}
              >
                Insira a quantidade desejada
              </Typography>
              <input
                type="text"
                onKeyDown={handleAddItem}
                id={String(currentSelectedItem?.ID)}
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
              />
            </Stack>
          </Box>
        </Fade>
      </Modal>

      <Paper
        sx={{
          height: { xs: "600px", lg: "700px" },
        }}
        component={Paper}
      >
        <TableVirtuoso
          data={filteredRows}
          components={VirtuosoTableComponents}
          itemContent={(_index, row) => (
            <RowContent
              row={row}
              columns={columns}
              adding={adding}
              handleOpen={handleOpen}
              handleChangeItemProduct={handleChangeItemProduct}
            />
          )}
        />
      </Paper>
    </Box>
  );
};

export default ProductsTable;
