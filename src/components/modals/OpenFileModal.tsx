
import Button from '@mui/material/Button';
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
import { deleteRequisitionFile, getRequisitionFiles } from '../../utils';
import { anexoRequisicao } from '../../types';
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

interface OpenFileModal {
    ID_REQUISICAO: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OpenFileModal = ({ ID_REQUISICAO }: OpenFileModal) => {

    const [requisitionFiles, setRequisitionFiles] = useState<anexoRequisicao[]>([]);
    const [open, setOpen] = React.useState(false);
    const [refreshToggler, setRefreshToggler ] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const fetchRequisitionFiles = async () => {
        console.log('fetchRequisitionFiles');
        const data = await getRequisitionFiles(ID_REQUISICAO);
        if (data) {
            console.log('data: ', data);
            setRequisitionFiles(data);
            return; 
        } setRequisitionFiles([]);
    }

    React.useEffect(() => {
        console.log('useEffect');
        fetchRequisitionFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshToggler]);



    return (
        <div>
            <Button variant='outlined' onClick={handleOpen}>Anexos   <AttachFileIcon /></Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Stack direction="column" spacing={2}>
                        <Typography textAlign="center" id="modal-modal-title" variant="h6" component="h2">
                            Anexos da Requisição
                        </Typography>
                        <InputFile 
                            ID_REQUISICAO={ID_REQUISICAO}
                             setRefreshToggler = {setRefreshToggler} 
                                refreshToggler={refreshToggler} /> 
                        {
                            requisitionFiles.length > 0 &&
                            <InteractiveList 
                                refreshToggler={refreshToggler}
                                 setRefreshToggler={setRefreshToggler}
                                  requisitionFiles={requisitionFiles} />

                        }
                    </Stack>

                </Box>
            </Modal>
        </div>
    );
}

interface InteractiveListProps {
    requisitionFiles: anexoRequisicao[];
    setRefreshToggler : (value : boolean ) => void;
    refreshToggler : boolean;
    
}


function InteractiveList({ requisitionFiles, setRefreshToggler, refreshToggler }: InteractiveListProps) {

    const [dense] = React.useState(false);
    const [isDeleteRequisitionFileModalOpen, setIsDeleteRequisitionFileModalOpen ] = useState<boolean>(false);
    const [currentFileIdBeingDeleted, setCurrentFileIdbeingDeleted ] = useState<number>(0);
    const handleDelete = async (id: number ) => {
        const responseStatus = await deleteRequisitionFile(id);
        if(responseStatus === 200){ 
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
                        {requisitionFiles.map((item) => (
                                <ListItem
                                secondaryAction={<IconButton
                                    onClick={() => {
                                        setCurrentFileIdbeingDeleted(item.id);
                                         setIsDeleteRequisitionFileModalOpen(!isDeleteRequisitionFileModalOpen) }}
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




export default OpenFileModal