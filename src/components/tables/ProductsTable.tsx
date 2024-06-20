/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Item, Product, searchProducts } from "../../utils";
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

const findProduct = (products: Item[] | undefined, id: number) => {
  if (products) {
    const product = products.find((product) => product.ID_PRODUTO === id);
    if (product) return product;
    return false;
  } else return null;
};

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
  setIsCreating,
}) => {
  const [currentSelectedItem, setCurrentSelectedItem] = useState<Item>();
  const [filteredRows, setFilteredRows] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Item[]>([]);
  const [openQuantityInput, setOpenQuantityInput] = useState(false);

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    const { id, value } = e.currentTarget;
    console.log("id produto: ", id);
    const product = findProduct(quantities, Number(id));

    if (product) {
      const updatedQuantities = [...quantities];
      const indexOfProduct = updatedQuantities.indexOf(product);
      if (Number(value) > 0) {
        updatedQuantities[indexOfProduct].QUANTIDADE = Number(value);
      } else updatedQuantities.splice(indexOfProduct, 1);
      setQuantities(updatedQuantities);
    } else {
      const updatedQuantities = quantities;
      if (Number(value) > 0 && currentSelectedItem) {
        const addedItem = {
          ID_PRODUTO: Number(id),
          QUANTIDADE: Number(value),
          NOME: currentSelectedItem?.NOME,
          ID_REQUISICAO: ID_REQUISICAO,
          ID: 0,
        };
        updatedQuantities.push(addedItem);
      }

      setQuantities(updatedQuantities);
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    deleteItem(e.currentTarget.id);
  };

  const deleteItem = (id: string) => {
    const product = findProduct(quantities, Number(id));
    if (product) {
      const updatedQuantities = [...quantities];
      const indexOfProduct = updatedQuantities.indexOf(product);
      updatedQuantities.splice(indexOfProduct, 1);
      setQuantities(updatedQuantities);
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

  const handleOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    nome: string,
    quantities?: Item[]
  ) => {
    setOpenQuantityInput(true);
    const { id } = e.currentTarget;
    const item = findProduct(quantities, Number(id));

    if (item) {
      console.log("currentSelected ", {
        ID_REQUISICAO: ID_REQUISICAO,
        ID_PRODUTO: Number(id),
        NOME: nome,
        QUANTIDADE: item.QUANTIDADE,
        ID: 0,
      });
      setCurrentSelectedItem({
        ID_REQUISICAO: ID_REQUISICAO,
        ID_PRODUTO: Number(id),
        NOME: nome,
        QUANTIDADE: item.QUANTIDADE,
        ID: 0,
      });
    } else {
      console.log("currentSelected ", {
        ID_REQUISICAO: ID_REQUISICAO,
        ID_PRODUTO: Number(id),
        NOME: nome,
        QUANTIDADE: 0,
        ID: 0,
      });
      setCurrentSelectedItem({
        ID_REQUISICAO: ID_REQUISICAO,
        ID_PRODUTO: Number(id),
        NOME: nome,
        QUANTIDADE: 0,
        ID: 0,
      });
    }
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
        currentSelectedItem?.ID_PRODUTO === data[index].ID
          ? `border border-cyan-800 odd:bg-white flex gap-1 justify-around even:bg-gray-100 p-0  text-xs`
          : `border odd:bg-white flex gap-1 justify-around even:bg-gray-100 p-0  text-xs`
      }
    >
      <td
        scope="row"
        className="w-1/3  py-2 text-center font-normal text-[0.9rem] text-gray-900 whitespace-nowrap"
      >
        {data[index].NOME}
      </td>
      <td
        scope="row"
        className="w-1/3 py-2 relative gap-4 text-center font-semibold text-[0.9rem] text-gray-900 whitespace-nowrap"
      >
        {data[index].codigo}
        <button
          onClick={(e) => handleOpen(e, data[index].NOME, quantities)}
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
        openQuantityInput={openQuantityInput}
        handleQuantityChange={handleQuantityChange}
        handleDelete={handleDelete}
        handleClose={handleClose}
        handleSearch={handleSearchItem}
        handleOpen={handleOpen}
        addedItems={quantities}
        currentSelectedItem={currentSelectedItem}
        setIsCreating={setIsCreating}
        caller="ItemsTable"
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
                onChange={handleQuantityChange}
                id={String(currentSelectedItem?.ID_PRODUTO)}
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={handleClose}
              />
            </Stack>
          </Box>
        </Fade>
      </Modal>
      <table className="w-full h-full table-fixed shadow-sm">
        <thead className="text-xs text-white uppercase bg-gray-900 ">
          <tr className="flex justify-around">
            <th scope="col" className="py-2">
              Produto
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
              Busque os Produtos Desejados
            </h2>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default ProductsTable;
