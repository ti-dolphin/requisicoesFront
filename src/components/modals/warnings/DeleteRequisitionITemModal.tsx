import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { DeleteRequisitionItemModalProps } from '../../../types';
import { Button, Stack } from '@mui/material';


const style = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  height: 200,
  bgcolor: 'background.paper',
  border: 'none',
  boxShadow: 24,
  padding: 2,
  zIndex: 10
};

const DeleteRequisitionItemModal : React.FC<DeleteRequisitionItemModalProps> = ({
      isDeleteRequisitionItemModalOpen,
      setIsDeleteRequisitionItemModalOpen,
      handleDelete,
      item
}) => {
  
  const handleClose = () => setIsDeleteRequisitionItemModalOpen(false);

  return (
      <Modal
        open={isDeleteRequisitionItemModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{...style, gap:'2rem'}}>
          <Typography id="modal-modal-title"  component="h2" align='center'>
            Tem certeza que deseja excluir o item "{item.nome_fantasia}" ?
          </Typography>
          <Stack direction="row" spacing={6}>
                  <Button
                   onClick={() => handleDelete(item)}
                   variant="outlined">Sim</Button>
                  <Button
                   onClick={() => setIsDeleteRequisitionItemModalOpen(false)}
                   color='secondary'
                    variant="outlined" sx={{color: 'red', border: '1px solid red', hover: 'color:secondary'}}>Não</Button>
          </Stack>
        </Box>
      </Modal>
  );
}
export default DeleteRequisitionItemModal;
