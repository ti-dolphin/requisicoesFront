import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import { ProductsTableModalProps } from "../../types";
import ProductsTable from "../tables/ProductsTable";
import CloseIcon from '@mui/icons-material/Close';
import { ItemsContext } from "../../context/ItemsContext";
import { useContext } from "react";
import { RequisitionContext } from "../../context/RequisitionContext";
const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "0.5px solid #000",
  boxShadow: 24,
  pt: 1,
  px: 1,
  pb: 2,
};

export const ProductsTableModal: React.FC<ProductsTableModalProps> = ({
  requisitionID,
  info
}) => {
  const {adding, toggleAdding, changing, toggleChanging}  = useContext(ItemsContext);
  const { toggleCreating, creating, toggleRefreshRequisition } = useContext(RequisitionContext);

  const handleCloseAll = ( ) =>  {
    if(adding && creating){ 
        toggleCreating();
        toggleAdding();
    }else if( adding ){ 
      toggleAdding();
    }else{ 
      toggleChanging();
    }
    toggleRefreshRequisition();
  }
 
  return (
    <>
      <Modal
        open={adding || changing[0]}
        onClose={handleCloseAll}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: "98vw", height: "98vh" }}>
          <Stack
            sx={{
              height: "100%",
              overflowY: "auto",
              width: "100%",
            }}
            spacing={1}
            direction="column"
          >
            <Stack direction="row" paddingLeft="1rem" justifyContent="space-between" alignItems="center">
              <Typography
                textAlign="center"
                sx={{
                  fontSize: {
                    xs: "12px",
                    md: "16px",
                  },
                  top: {
                    xs: "1rem",
                  },
                }}
              >
                {info}
              </Typography>
              <Button
                sx={{
                  color: "red",
                  margin: "2px",
                }}
                onClick={() => handleCloseAll()}
              >
                <CloseIcon />
              </Button>
            </Stack>

            <ProductsTable ID_REQUISICAO={requisitionID} />
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export { ProductsTable };
