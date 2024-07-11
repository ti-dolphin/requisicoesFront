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
import { Button, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ProductsTableProps } from "../../types";


// eslint-disable-next-line react-refresh/only-export-components
export const style = {
  position: "absolute",
  borderRadius: "25px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
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
    console.log("handleSearchItem");
    if (e.key === "Enter" && e.currentTarget.value) {
      const { value } = e.currentTarget;
      const searchResults = await searchProducts(value.toUpperCase());
      console.log(searchResults);
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
    _e: React.MouseEvent<HTMLButtonElement>,
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

  const Row: React.FC<ListChildComponentProps> = ({ data, index, style }) => (
    <tr
      key={data[index].ID}
      style={style}
      className={
        currentSelectedItem?.ID === data[index].ID
          ? `border border-cyan-800 odd:bg-white flex gap-1 justify-around even:bg-gray-100 p-0  text-xs`
          : `border odd:bg-white flex gap-1 justify-around even:bg-gray-100 p-0  text-xs`
      }
    >
      <td
        scope="row"
        className="w-1/3  py-2 text-center font-normal text-[0.9rem] text-gray-900 whitespace-nowrap"
      >
        {data[index].nome_fantasia}
      </td>
      <td
        scope="row"
        className="w-1/3 py-2 relative gap-4 text-center font-semibold text-[0.9rem] text-gray-900 whitespace-nowrap"
      >
        {data[index].codigo}
        <button
          onClick={(e) => handleOpen(e, data[index])}
          id={data[index].ID}
          className="border-red-400 border-1 absolute right-1 py-1 text-blue-600 underline"
        >
          adicionar
        </button>
      </td>
    </tr>
  );

  return (
    <div className="h-[600px] border w-full relative mx-auto">
      <SearchAppBar
        addedItems={addedItems}
        handleSearch={handleSearchItem}
        caller="ItemsTable" refreshToggler={false}
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
          <Box sx={style}>
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

      <table className="w-full h-full table-fixed shadow-sm">
        <thead className="text-xs text-white uppercase bg-gray-900 ">
          <tr className="flex justify-around">
            <th scope="col" className="py-2">
              Material / Serviço
            </th>
            <th scope="col" className="py-2">
              Código TOTVS
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length ? (
            <AutoSizer className="absolute left-0">
              {({ height, width }) => (
                <List
                  className="List"
                  height={height}
                  itemCount={filteredRows.length}
                  itemSize={36}
                  width={width}
                  itemData={filteredRows}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          ) : (
            <h2 className=" text-center text-lg p-4">
              Busque os Materiais / Serviços Desejados
            </h2>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
