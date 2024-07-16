/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import EditIcon from "@mui/icons-material/Edit";
import { Stack } from '@mui/material';
import { useState } from 'react';
import { ItemObservationModalProps } from '../../types';
import { updateRequisitionItems } from '../../utils';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 400,
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection : 'column',
    gap: '1rem',
    boxShadow: 24,
    p: 4,
};

export default function ItemObservationModal({
     items,  
             observation, 
                isObservationModalOpen, setIsObservationModalOpen }: ItemObservationModalProps) {

    const handleClose = () => setIsObservationModalOpen(false);
    const [currentObservation, setCurrentObservation] = useState(observation);
    const handleChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => { 
        const { value } = e.target;
        setCurrentObservation(value);
    }
    const handleSave = async( ) => { 
        items[0].OBSERVACAO = currentObservation;
        console.log(items);
         await updateRequisitionItems(
             items, 
             items[0].ID_REQUISICAO
         );
         setEditMode(false);
         setIsObservationModalOpen(false);
    }
    const [editMode, setEditMode ] = React.useState<boolean>(false);
    return (
        <div>
            <Modal
                open={isObservationModalOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} >
                    <Typography align='left' id="modal-modal-title" variant="h6" component="h2">
                        Observação
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <textarea
                            value={editMode ? currentObservation : observation}
                            onChange={handleChange}
                            disabled={!editMode}
                            autoFocus={editMode}
                            className={
                                editMode ? `border-blue-500 ` + `w-[90%] p-2 outline-none h-[200px] flex flex-wrap text-center border rounded-md`
                                    : `w-[90%]  outline-none h-[200px] flex flex-wrap text-center border rounded-md p-1`
                            }
                        />
                        <button
                            onClick={() => setEditMode(true)}
                            className="delete h-[40px] hover:bg-slate-300 rounded-sm p-[0.5]"
                        >
                            <EditIcon className="cursor-pointer text-blue-600" />
                        </button>
                    </Stack>
                    { 
                        editMode &&
                         <Button
                            onClick={handleSave}
                             sx={{alignSelf : 'start'}}>SALVAR</Button>
                    }
                </Box>
            </Modal>
        </div>
    );
}
