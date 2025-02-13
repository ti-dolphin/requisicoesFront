import { SxProps, Theme } from '@mui/material/styles';

export const styles = {
    badge: {
        // Estilos para o Badge (se necessário)
    } as SxProps<Theme>,

    iconButton: {
        color: '#F7941E',
    } as SxProps<Theme>,

    modalContent: {
        minWidth: '260px',
        overflowY: 'scroll',
        backgroundColor: 'white',
      
        ':: -webkit-scrollbar': {
            display: 'none' 
        },
        paddingY: 2,
        borderRadius: 5,
        minHeight: 500,
        maxHeight: 600,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: {
            xs: '95%',
            sm: '400px',
            md: '500px',
            lg: '600px',
        },
    } as SxProps<Theme>,

    modalHeader: {
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'start',
        gap: 1,
        top: 0,
        transform: 'translateY(-1rem)',
        padding: 2,
        zIndex: 20,
        position: 'sticky',
        backgroundColor: 'white',
        width: '100%'

    } as SxProps<Theme>,

    closeIconButton: {
        color: 'red',
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 30,
    } as SxProps<Theme>,

    uploadButton: {
        // Estilos para o botão de upload (se necessário)
    } as SxProps<Theme>,

    loadingStack: {
        
        mt: 2,
        mx: 'auto'
    } as SxProps<Theme>,

    fileListStack: {
        gap: 1,
        padding: 1,
    } as SxProps<Theme>,

    card: {
        minHeight: 350,
        width: '100%',
    } as SxProps<Theme>,

    cardMedia: (file: any) => ({
        height: 300,
        borderRadius: 5,
        width: '100%',
        background: isImage(file) ? `url('${file.arquivo}')` : 'none',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    }) as SxProps<Theme>,

    cardContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: 1,
    } as SxProps<Theme>,

    fileName: {
        cursor: 'pointer',
        color: 'blue',
        textDecoration: 'underline',
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    } as SxProps<Theme>,

    deleteIconButton: {
        color: '#F7941E',
    } as SxProps<Theme>,

    imageModal: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: '90%',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        p: 2,
    } as SxProps<Theme>,

    imageModalCloseIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    } as SxProps<Theme>,

    imageModalBox: (fileSelected: string) => ({
        height: '100%',
        backgroundImage: `url('${fileSelected}')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
    }) as SxProps<Theme>,
};

// Funções auxiliares
const isImage = (file: any): boolean => {
    return file.arquivo && !isPDF(file.arquivo);
};

const isPDF = (arquivo: string): boolean => {
    return arquivo?.endsWith('.pdf');
};