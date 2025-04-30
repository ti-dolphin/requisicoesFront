import React, { useState, useEffect, useCallback, useContext } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import {
    Box,
    IconButton,
    Modal,
    Typography,
    Button,
    Paper,
    AlertColor,
    Alert,
    CircularProgress,
    Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import AddIcon from '@mui/icons-material/Add';
import { BaseButtonStyles } from "../../../utilStyles";
import { AlertInterface, RequisitionFile } from "../../types";
import {
    getRequisitionFiles,
    postRequisitionFile,
    deleteRequisitionFile,
    postRequisitionLinkFile,
} from "../../utils";
import { blue } from "@mui/material/colors";
import { userContext } from "../../context/userContext";
import typographyStyles from "../../utilStyles";
import { formatDate } from "../../../generalUtilities";

interface RequisitionFileListProps {
    requisitionId: number;
    height?: number;
    width?: number | string;
    itemSize?: number;
}

const RequisitionFileList: React.FC<RequisitionFileListProps> = ({
    requisitionId,
    height = 100,
    width = "100%",
    itemSize = 55,
}) => {
    const [requisitionFiles, setRequisitionFiles] = useState<RequisitionFile[]>([]);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<RequisitionFile | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<RequisitionFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertInterface | undefined>();
    const [attachLinkModal, setAttachLinkModal] = useState(false);
    const [link, setLink] = useState<string>("");
    const { user } = useContext(userContext)
    const displayAlert = useCallback((severity: AlertColor, message: string) => {
        setAlert({ severity, message });
        setTimeout(() => {
            setAlert(undefined);
        }, 3000);
    }, []);

    const fetchFiles = useCallback(async () => {
        if (!requisitionId) return;
        setIsLoading(true);
        try {
            const files = await getRequisitionFiles(requisitionId);
            setRequisitionFiles(files || []);
        } catch (error: any) {
            console.error("Error fetching requisition files:", error);
            displayAlert("error", "Erro ao buscar arquivos da requisição.");
        } finally {
            setIsLoading(false);
        }
    }, [requisitionId, displayAlert]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            displayAlert("warning", "Nenhum arquivo selecionado.");
            return; 
        }
        const formData = new FormData();
        formData.append("file", file);
        setIsLoading(true);
        if(user){ 
            try {
                const responseStatus = await postRequisitionFile(requisitionId, formData, user.CODPESSOA);
                if (responseStatus === 200) {
                    displayAlert("success", `Arquivo ${file.name} anexado com sucesso.`);
                    await fetchFiles();
                } else {
                    throw new Error(`API retornou status inesperado: ${responseStatus}`);
                }
            } catch (error: any) {
                console.error("Error uploading file:", error);
                displayAlert("error", `Erro ao anexar arquivo: ${error.message || 'Erro desconhecido'}`);
            } finally {
                setIsLoading(false);
                e.target.value = '';
            }
        }
    };

    const handleConfirmLink = async () => {
                            if (!link.trim()) {
                                displayAlert("warning", "O link não pode estar vazio.");
                                return;
                            }
                            setIsLoading(true);
                            if(user){ 
                                try {
                                    const responseStatus = await postRequisitionLinkFile(requisitionId, link, user.CODPESSOA);
                                    if (responseStatus === 200) {
                                        displayAlert("success", "Link anexado com sucesso.");
                                        await fetchFiles();
                                        setAttachLinkModal(false);
                                        setLink("");
                                    } else {
                                        throw new Error(`API retornou status inesperado: ${responseStatus}`);
                                    }
                                } catch (error: any) {
                                    console.error("Error attaching link:", error);
                                    displayAlert("error", `Erro ao anexar link: ${error.message || "Erro desconhecido"}`);
                                } finally {
                                    setIsLoading(false);
                                }
                            }
                        }

    const openConfirmDeleteModal = (file: RequisitionFile) => {
        setFileToDelete(file);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmDeleteModal = () => {
        setFileToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;

        setIsLoading(true);
        closeConfirmDeleteModal();

        try {
            const responseStatus = await deleteRequisitionFile(fileToDelete);
            if (responseStatus === 200) {
                displayAlert("success", `Arquivo ${fileToDelete.nome_arquivo} excluído com sucesso.`);
                setRequisitionFiles((prevFiles) =>
                    prevFiles.filter((f) => f.id !== fileToDelete.id)
                );
            } else {
                throw new Error(`API retornou status inesperado: ${responseStatus}`);
            }
        } catch (error: any) {
            console.error("Error deleting file:", error);
            displayAlert("error", `Erro ao excluir o arquivo: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenViewModal = (file: RequisitionFile) => {
        setSelectedFile(file);
        setOpenViewModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedFile(null);
    };
    const isXLSX = (url: string) => url?.toLowerCase().endsWith(".xlsx") || url?.toLowerCase().endsWith(".xls");
    const isPDF = (url: string) => url?.toLowerCase().endsWith(".pdf");
    const isImage = (url: string) => /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(url?.toLowerCase());
    const isLink = (url: string) => {
        const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
        return pattern.test(url);
    };
    const handleClickFile = (file: RequisitionFile) => {
        if (isPDF(file.arquivo) || isImage(file.arquivo)) {
            handleOpenViewModal(file);
            return;
        }
        if (isLink(file.nome_arquivo)) {
            window.open(file.arquivo, "_blank");
            return;
        }
        if(isXLSX(file.arquivo)) {
            window.open(file.arquivo, "_blank");
            return;
        }
        window.open(file.arquivo, "_blank");
    }

    const Row: React.FC<ListChildComponentProps> = ({ index, style }) => {
        const file = requisitionFiles[index];

        if (!file) return null;

        return (
            <Box
                style={style}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 1,
                    height: 30,
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                    gap: 1,
                    "&:hover": {
                        backgroundColor: "#f0f0f0",
                    },
                    cursor: "pointer",
                }}
                
            >
                <Typography
                    variant="body2"
                    sx={{
                        flexGrow: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 500,
                   
                        fontStyle: "italic",
                        color: "text.secondary",
                        "&:hover": {
                            color: blue[500],
                            textDecoration: "underline",
                        }
                    }}
                    onClick={() => handleClickFile(file)}
                >
                    {file.arquivo}
                </Typography>
                 <Stack direction="column" >
                    <Typography sx={{...typographyStyles.smallText}}>
                        {file.criado_em && formatDate(file.criado_em)}
                    </Typography>
                    <Typography sx={{ ...typographyStyles.smallText }}>
                        {file.criado_por_pessoa && file.criado_por_pessoa.NOME}
                    </Typography>
                 </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        aria-label="Visualizar arquivo"
                        size="small"
                        onClick={() => handleOpenViewModal(file)}
                        sx={{ color: 'primary.main', '&:hover': { backgroundColor: 'action.hover' } }}
                        title="Visualizar"
                    >
                        <FileOpenIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        aria-label="Excluir arquivo"
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            openConfirmDeleteModal(file);
                        }}
                        sx={{ color: 'error.main', '&:hover': { backgroundColor: 'action.hover' } }}
                        title="Excluir"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        );
    };

    return (
        <Paper
            elevation={1}
            sx={{
                width: "100%",
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: 200,
                overflow: "auto",
                position: 'relative',
            }}
        >

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {!isLoading && requisitionFiles.length > 0 && (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <FixedSizeList
                        height={height}
                        width={width}
                        itemCount={requisitionFiles.length}
                        itemSize={itemSize}
                        overscanCount={5}
                    >
                        {Row}
                    </FixedSizeList>
                </Box>
            )}
            {!isLoading && requisitionFiles.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 2 }}>
                    Nenhum arquivo anexado.
                </Typography>
            )}

         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="column"
                    gap={1} sx={{ width: '50%' }}>
                    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        * anexar documentos, planilhas, imagens ou links.
                    </Typography>
                    <Stack direction="row" gap={1}>
                        <Button
                            component="label"

                            startIcon={<AddIcon />}
                            sx={{ ...BaseButtonStyles, width: 'fit-content', height: 30 }}
                            disabled={isLoading}
                        >
                            Anexar
                            <input
                                type="file"
                                hidden
                                onChange={handleFileUpload}
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,application/pdf,image/*, .csv"
                            />
                        </Button>
                        <Button
                            component="label"
                            onClick={() => setAttachLinkModal(true)}
                            startIcon={<AddIcon />}
                            sx={{ ...BaseButtonStyles, width: 'fit-content', height: 30 }}
                            disabled={isLoading}
                        >
                            Link
                           
                        </Button>
                    </Stack>
                </Stack>
                {alert && (
                    <Alert
                        severity={alert.severity as AlertColor}
                        sx={{ mt: 1, padding: 1 }}
                        onClose={() => setAlert(undefined)}
                    >
                        {alert.message}
                    </Alert>
                )}
         </Box>
        
            <Modal
                open={openViewModal}
                onClose={handleCloseViewModal}
                aria-labelledby="view-file-modal-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                }}
            >
                <Paper
                    sx={{
                        position: "relative",
                        width: { xs: "95%", sm: "90%", md: "80%", lg: "70%" },
                        maxWidth: "1000px",
                        height: { xs: "85vh", md: "90vh" },
                        maxHeight: "95vh",
                        p: { xs: 1, sm: 2 },
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                        <Typography id="view-file-modal-title" variant="h6" component="h2" noWrap sx={{ maxWidth: 'calc(100% - 48px)' }}>
                            {selectedFile?.nome_arquivo || "Visualizar Arquivo"}
                        </Typography>
                        <IconButton
                            aria-label="Fechar modal"
                            onClick={handleCloseViewModal}
                            sx={{ color: "text.secondary" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: '1px solid #eee',
                            backgroundColor: '#f5f5f5',
                        }}
                    >
                        {selectedFile && isPDF(selectedFile.arquivo) && (
                            <iframe
                                src={selectedFile.arquivo}
                                title={`Visualizar PDF: ${selectedFile.nome_arquivo}`}
                                style={{ width: "100%", height: "100%", border: "none" }}
                            />
                        )}
                        {selectedFile && isImage(selectedFile.arquivo) && (
                            <Box
                                component="img"
                                src={selectedFile.arquivo}
                                alt={`Visualizar: ${selectedFile.nome_arquivo}`}
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                        {selectedFile && !isPDF(selectedFile.arquivo) && !isImage(selectedFile.arquivo) && (
                            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                Pré-visualização não disponível para este tipo de arquivo.
                                <br />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={selectedFile.arquivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 1 }}
                                >
                                    Abrir/Baixar Arquivo
                                </Button>
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Modal>

            <Modal
                open={isConfirmModalOpen}
                onClose={closeConfirmDeleteModal}
                aria-labelledby="confirm-delete-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper
                    sx={{
                        width: { xs: "90%", sm: "400px" },
                        p: 3,
                        textAlign: "center",
                    }}
                >
                    <Typography id="confirm-delete-title" variant="h6" sx={{ mb: 2 }}>
                        Confirmar Exclusão
                    </Typography>
                    <Typography sx={{ mb: 3 }}>
                        Tem certeza que deseja excluir o arquivo{" "}
                        <strong>{fileToDelete?.nome_arquivo}</strong>?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Button
                            onClick={confirmDelete}
                            variant="contained"
                            color="error"
                            sx={{ ...BaseButtonStyles}}
                        >
                            Confirmar
                        </Button>
                        <Button
                            onClick={closeConfirmDeleteModal}
                            sx={{ ...BaseButtonStyles }}
                        >
                            Cancelar
                        </Button>
                    </Box>
                </Paper>
            </Modal>

        <Modal
            open={attachLinkModal}
            onClose={() => setAttachLinkModal(false)}
            aria-labelledby="attach-link-modal-title"
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Paper
                sx={{
                    width: { xs: "90%", sm: "400px" },
                    p: 3,
                    textAlign: "center",
                }}
            >
                <Typography id="attach-link-modal-title" variant="h6" sx={{ mb: 2 }}>
                    Anexar Link
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Insira o link aqui"
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button
                        onClick={handleConfirmLink}
                        variant="contained"
                        color="primary"
                        sx={{ ...BaseButtonStyles }}
                    >
                        Confirmar
                    </Button>
                    <Button
                        onClick={() => {
                            setAttachLinkModal(false);
                            setLink("");
                        }}
                        sx={{ ...BaseButtonStyles }}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Paper>
        </Modal>

        </Paper>
    );
};

export default RequisitionFileList;
