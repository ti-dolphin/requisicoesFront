import { useContext, useState } from "react";
import { PatrimonyFile } from "../../types";
import { PatrimonyFileContext } from "../../context/patrimonyFileContext";
import FileViewer from "../../../crm/components/modals/FileViewer/FileViewer";
import { Card, CardMedia, Box, Typography, IconButton } from "@mui/material";
import { basicCardContentStyles } from "../../../utilStyles";
import { styles } from "../modals/PatrimonyFileModal;/PatirmonyFileModal.styles";
import DeleteIcon from "@mui/icons-material/Delete";

interface PatrimonyFileCardProps {
    file: PatrimonyFile;

}

const PatrimonyFileCard: React.FC<PatrimonyFileCardProps> = ({
    file
}: PatrimonyFileCardProps) => {

    const [fileSelected, setFileSelected] = useState<string | null>();
    const { toggleDeletingPatrimonyFile } = useContext(PatrimonyFileContext);
    const handleOpenLink = (url: string) => {
        window.open(url, "_blank");
    };

    const openFile = (file: PatrimonyFile) => {
        console.log({ isPd: isPDF(file.arquivo) })
        setFileSelected(file.arquivo);
    };

    const isPDF = (arquivo: string): boolean => {
        return arquivo?.endsWith('.pdf');
    };

    const truncateText = (text: string, maxLength: number): string => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...'; // Adiciona "..." ao final
        }
        return text;
    };

    const handleCloseImageModal = () => {
        setFileSelected(null);
    };

    return (
        <Card
            key={file.id_anexo_patrimonio}
            sx={{
                ...basicCardContentStyles,
                minHeight: 350,
                width: '100%',
                gap: 2,
            }}
            className="border border-gray-300"
        >
            <div style={{ position: 'relative', width: '100%' }}>
                <CardMedia
                    component={isPDF(file.arquivo) ? 'object' : 'div'}
                    data={isPDF(file.arquivo) ? file.arquivo : undefined}
                    src={isPDF(file.arquivo) ? undefined : file.arquivo}
                    type={isPDF(file.arquivo) ? 'application/pdf' : undefined}
                    sx={styles.cardMedia(file)}
                />
                {/* Overlay transparente para capturar cliques */}
                <div
                    onClick={() => openFile(file)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer', // Mostra que a área é clicável
                        zIndex: 1, // Garante que o overlay fique acima do <object>
                    }}
                />
            </div>

            <Box>
                <Typography
                    onClick={() => handleOpenLink(file.arquivo)}
                    fontSize="small"
                    sx={styles.fileName}
                >
                    {truncateText(file.nome_arquivo, 20)}
                </Typography>
                <IconButton
                    onClick={() => toggleDeletingPatrimonyFile(true, file)}
                    sx={styles.deleteIconButton}
                >
                    <DeleteIcon />
                </IconButton>

                <FileViewer
                    fileViewerOpen={!!fileSelected}
                    fileUrl={fileSelected || ''}
                    fileName={fileSelected || ''}
                    isPDF={isPDF}
                    handleCloseFileViewer={handleCloseImageModal}
                />
            </Box>
        </Card>
    );
};

export default PatrimonyFileCard;