/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IconButton, Stack } from '@mui/material';
import { useContext } from 'react';
import { updateRequisitionItems } from '../../utils';
import { ItemsContext } from '../../context/ItemsContext';
import CloseIcon from '@mui/icons-material/Close';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { 
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '40%',
        xl: '30%'
    },
    height: 'fit-content',
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection : 'column',
    gap: '1rem',
    boxShadow: 24,
    p: 4,
};

const ItemObservationModal = () => {
    const {editingObservation, toggleEditingObservation, setEditingObservation, toggleRefreshItems } = useContext(ItemsContext);
    const handleClose = () => toggleEditingObservation();
    const handleChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => { 
        const { value } = e.target;
        if(editingObservation[1]){ 
            setEditingObservation([true, { ...editingObservation[1], OBSERVACAO: value }]);
        }
    }
    const handleSave = async( ) => { 
       if(editingObservation[0] && editingObservation[1]){ 
           await updateRequisitionItems(
               [editingObservation[1]],
               editingObservation[1].ID_REQUISICAO
           );
           toggleEditingObservation();
           toggleRefreshItems() 
     }
    }
    return (
      <Box>
        <Modal
          open={editingObservation[0]}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <IconButton
              onClick={() => toggleEditingObservation()}
              sx={{ position: "absolute", top: "1rem", right: "1rem" }}
            >
              <CloseIcon sx={{ color: "red" }} />
            </IconButton>
            <Typography
              align="left"
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Observação
            </Typography>
            <Stack direction="row" spacing={2}>
              <textarea
                style={{
                  border: "1px solid",
                  width: "90%",
                }}
                value={
                  editingObservation[1]?.OBSERVACAO === "null"
                    ? ""
                    : editingObservation[1]?.OBSERVACAO
                }
                onChange={handleChange}
                disabled={!editingObservation[0]}
                autoFocus={editingObservation[0]}
              />
            </Stack>
            {editingObservation[0] && (
              <Button onClick={handleSave} sx={{ alignSelf: "start" }}>
                SALVAR
              </Button>
            )}
          </Box>
        </Modal>
      </Box>
    );
}
export default ItemObservationModal;