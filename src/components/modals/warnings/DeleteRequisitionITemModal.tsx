import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { DeleteRequisitionItemModalProps } from '../../../types';
import { Button, Stack } from '@mui/material';
import { ItemsContext } from '../../../context/ItemsContext';
import { useContext } from 'react';

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
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  boxShadow: 24,
  p: 4,
};

const DeleteRequisitionItemModal : React.FC<DeleteRequisitionItemModalProps> = ({
      handleDelete,
}) => {
  const { selection } = useContext(ItemsContext);
  const handleClose = () => toggleDeleting();
  const {deleting, toggleDeleting } = useContext(ItemsContext);
  return (
      <Modal
        open={deleting[0]}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{...style, gap:'2rem'}}>
          { 
           <>
              <Typography id="modal-modal-title" component="h2" align='center'>
                Tem certeza que deseja excluir os items selecionados?
              </Typography>
              <Stack direction="row" spacing={6}>
                <Button
                  onClick={() => handleDelete(selection.items)}
                  variant="outlined">Sim</Button>
                <Button
                  onClick={() => toggleDeleting()}
                  color='secondary'
                  variant="outlined" sx={{ color: 'red', border: '1px solid red', hover: 'color:secondary' }}>Não</Button>
              </Stack>
           </>
           }
        </Box>
      </Modal>
  );
}
export default DeleteRequisitionItemModal;
