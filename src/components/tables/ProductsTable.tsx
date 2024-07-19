/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Item, Product, fetchItems, postRequistionItem, searchProducts } from "../../utils";
import SearchAppBar from "../../pages/requisitionHome/components/SearchAppBar";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ProductsTableProps } from "../../types";


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

const ProductsTable: React.FC<ProductsTableProps> = ({
  ID_REQUISICAO,
}) => {
  const [currentSelectedItem, setCurrentSelectedItem] = useState<Product>();
  const [filteredRows, setFilteredRows] = useState<Product[]>([]);
  const [openQuantityInput, setOpenQuantityInput] = useState(false);
  const [refreshToggler, setRefreshToggler ] = useState<boolean>(false);
  const [addedItems, setAddedItems ] = useState<Item[]>([]);

  const fetchData = async ( ) => { 
    const itemsData = await fetchItems(ID_REQUISICAO);
    if(itemsData) setAddedItems([...itemsData]);
  }
  
  useEffect(() => { 
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggler])

  const handleAddItem =  (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if('key' in e && e.key === 'Enter'){ 
            const { id, value } = e.currentTarget;
            performPostItemCallout(id, value);
    }
  };

  const handleSearchItem = async (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === "Enter" && e.currentTarget.value) {
      const { value } = e.currentTarget;
      const searchResults = await searchProducts(value.toUpperCase());

      if (searchResults) setFilteredRows([...searchResults.data]);
    }
  };

  const performPostItemCallout = async (id: string, value: string) => {
    const requestBody = [];
    requestBody.push(
      {
        QUANTIDADE: Number(value),
        ID_PRODUTO: Number(id),
        ID_REQUISICAO: ID_REQUISICAO
      }
    );
    const reqIDParam = ID_REQUISICAO;
    const response = await postRequistionItem(
      requestBody,
      `/requisition/requisitionItems/${reqIDParam}`
    );
    if(response){ 
      setOpenQuantityInput(false);
      setRefreshToggler(!refreshToggler);
    }
  }

  const handleOpen = (
    item: Product
  ) => {
    setOpenQuantityInput(true);
    setCurrentSelectedItem({
      ...item
    });
  };

  const handleClose = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setOpenQuantityInput(false);
    }
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
          <Box sx={{...style, width: { 
            xs :'90%',
            sm: '80%',
            md: '70%',
            lg: '40%'
          }}}>
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Nome</TableCell>
              <TableCell align="left">Codigo TOTVS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow
                key={row.ID}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="left">{row.nome_fantasia}</TableCell>
                <TableCell align="left">
                  <Stack alignItems="center" spacing={1} direction="row">
                    <Typography>{row.codigo}</Typography>
                    <Button  onClick={() => handleOpen(row)}> Adicionar</Button>
                  </Stack>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductsTable;
