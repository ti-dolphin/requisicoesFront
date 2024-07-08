import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Stack } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface DeleteRequisitionItemModalProps {
    handleDelete: (value: number) => void;
    isDeleteRequisitionFileModalOpen: boolean;
    id: number;
    setIsDeleteRequisitionFileModalOpen: (value: boolean) => void;
}

const DeleteRequisitionItemModal = (
    { handleDelete, id, isDeleteRequisitionFileModalOpen, setIsDeleteRequisitionFileModalOpen }
     : DeleteRequisitionItemModalProps ) => {


    return (
        <div>
            <Modal
                open={isDeleteRequisitionFileModalOpen}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Tem certeza que deseja excluir este anexo?
                    </Typography>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <Button variant='outlined' sx={{ color: 'blue' }}
                             onClick={() => handleDelete(id)}>Sim </Button>
                        <Button variant='outlined' sx={{ color: 'red' }}
                             onClick={() => setIsDeleteRequisitionFileModalOpen(!isDeleteRequisitionFileModalOpen)}>Não</Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
}
export default DeleteRequisitionItemModal;


