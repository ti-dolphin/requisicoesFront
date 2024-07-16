
import Modal from '@mui/material/Modal';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import InputFile from '../../pages/requisitionDetail/components/InputFile';
import { Stack } from '@mui/material';
import { deleteItemFile, fetchItemFiles } from '../../utils';
import { InteractiveListProps, ItemFile } from '../../types';
import { useState } from 'react';
import DeleteRequisitionFileModal from './warnings/DeleteRequisitionFileModal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 500,
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '1px solid #000',
    padding: '1rem',
    boxShadow: 24,
    p: 4,
};
interface ItemFilesModalProps{ 
    itemID : number;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ItemFilesModal = ({ itemID }: ItemFilesModalProps) => {

    const [ItemFiles, setItemFiles] = useState<ItemFile[]>([]);
    const [open, setOpen] = React.useState(false);
    const [refreshToggler, setRefreshToggler] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const getItemFiles = async () => {
         console.log('fetchItemFiles');
         const response = await fetchItemFiles(itemID);
         if (response) {
             console.log('response: ', response);
             setItemFiles(response.data);
             return;
         } setItemFiles([]);
    }

    React.useEffect(() => {
        console.log('useEffect');
        getItemFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshToggler]);

    return (
        <>
            <button
                 onClick={handleOpen}
                className='cursor-pointer text-blue-800 hover:text-blue-500'><AttachFileIcon sx={{ rotate: '45deg' }} /></button>
                <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Stack direction="column" spacing={2}>
                        <Typography textAlign="center" id="modal-modal-title"  component="h2">
                            Anexos do Item
                        </Typography>

                        <InputFile
                            id={itemID}
                            setRefreshToggler={setRefreshToggler}
                            refreshToggler={refreshToggler} caller='ItemFilesModal' />
                        {
                            ItemFiles.length > 0 &&
                            <InteractiveList
                                refreshToggler={refreshToggler}
                                setRefreshToggler={setRefreshToggler}
                                files={ItemFiles} />

                        }
                    </Stack>

                </Box>
            </Modal>
        </>
    );
}



function InteractiveList({ files, setRefreshToggler, refreshToggler }: InteractiveListProps) {

    const [dense] = React.useState(false);
    const [isDeleteRequisitionFileModalOpen, setIsDeleteRequisitionFileModalOpen] = useState<boolean>(false);
    const [currentFileIdBeingDeleted, setCurrentFileIdbeingDeleted] = useState<number>(0);
    const handleDelete = async (id: number) => {
        const responseStatus = await deleteItemFile(id);
        if (responseStatus === 200) {
            setIsDeleteRequisitionFileModalOpen(false);
            setRefreshToggler(!refreshToggler);
            return;
        }
    }

    return (
        <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
            <Grid item xs={12} md={6}>
                <Demo>
                    <List dense={dense}>
                        {files.map((item) => (
                            <ListItem
                                secondaryAction={<IconButton
                                    onClick={() => {
                                        setCurrentFileIdbeingDeleted(item.id);
                                        setIsDeleteRequisitionFileModalOpen(!isDeleteRequisitionFileModalOpen)
                                    }}
                                    edge="end" aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <a
                                            href={item.arquivo}
                                            target='blank'
                                            download
                                        >
                                            <FolderIcon />

                                        </a>
                                    </Avatar>
                                </ListItemAvatar>
                                <a
                                    href={item.arquivo}
                                    target='blank'
                                    download
                                    className='hover:text-blue-600 hover:underline'
                                >
                                    {item.nome_arquivo}
                                </a>
                            </ListItem>
                        ))
                        }
                    </List>
                </Demo>
            </Grid>
            <DeleteRequisitionFileModal
                isDeleteRequisitionFileModalOpen={isDeleteRequisitionFileModalOpen}
                setIsDeleteRequisitionFileModalOpen={setIsDeleteRequisitionFileModalOpen}
                handleDelete={handleDelete}
                id={currentFileIdBeingDeleted} />
        </Box>
    );
}

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));




export default ItemFilesModal;