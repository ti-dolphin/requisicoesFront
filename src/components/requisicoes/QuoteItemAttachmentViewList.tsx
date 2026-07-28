import { Box, Typography, CircularProgress, List, ListItem, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { RequisitionItemAttachment } from '../../models/requisicoes/RequisitionItemAttachment';
import BaseViewFileDialog from '../shared/BaseVIewFileDialog';
import StyledLink from '../shared/StyledLink';
import { RequisitionItemAttachmentService } from '../../services/requisicoes/RequisitionItemAttachmentService';

interface QuoteItemAttachmentViewListProps {
  id_item_requisicao: number;
}

/**
 * Componente para visualização de anexos de item de requisição (somente leitura).
 * Usado na tela de cotação para visualizar anexos do item da requisição original.
 */
const QuoteItemAttachmentViewList = ({ id_item_requisicao }: QuoteItemAttachmentViewListProps) => {
  const [attachments, setAttachments] = useState<RequisitionItemAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RequisitionItemAttachment | null>(null);

  const openViewFile = (file: RequisitionItemAttachment) => {
    setSelectedFile(file);
  };

  const closeViewFile = () => {
    setSelectedFile(null);
  };

  const fetchAttachments = async () => {
    if (!id_item_requisicao) return;
    setLoading(true);
    try {
      // Na cotação só interessam os anexos comuns (tipo 1); NFs ficam de fora
      const attachments = await RequisitionItemAttachmentService.getByRequisitionItem(id_item_requisicao, 1);
      setAttachments(attachments);
    } catch (error: any) {
      setError("Erro ao buscar anexos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_item_requisicao) {
      fetchAttachments();
    }
  }, [id_item_requisicao]);

  return (
    <Box>
      {error && (
        <Typography color="error" mb={1}>
          {error}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {attachments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum anexo encontrado para este item.
            </Typography>
          )}
          {attachments.map((file) => (
            <ListItem
              key={file.id_anexo_item_requisicao}
              divider
              sx={{ height: 100 }}
            >
              <Stack direction="column" alignItems="start" gap={0.2}>
                <Box
                  component={"img"}
                  sx={{ height: 50, width: 50, borderRadius: 2, boxShadow: 1 }}
                  src={file.arquivo}
                  alt={file.nome_arquivo || "Anexo"}
                />
                <StyledLink
                  link={file.arquivo}
                  onClick={() => {
                    const fileExtensions = [
                      ".pdf",
                      ".jpg",
                      ".jpeg",
                      ".png",
                      ".doc",
                      ".docx",
                      ".xls",
                      ".xlsx",
                    ];
                    const isFile = fileExtensions.some((ext) =>
                      file.arquivo.toLowerCase().includes(ext)
                    );
                    if (isFile) {
                      openViewFile(file);
                    } else if (
                      file.arquivo.startsWith("http://") ||
                      file.arquivo.startsWith("https://")
                    ) {
                      window.open(file.arquivo, "_blank");
                    }
                  }}
                />
                {file.nome_arquivo && (
                  <Typography fontSize="11px" color="text.secondary">
                    {file.nome_arquivo}
                  </Typography>
                )}
              </Stack>
            </ListItem>
          ))}
        </List>
      )}
      <BaseViewFileDialog
        open={selectedFile !== null}
        onClose={closeViewFile}
        fileUrl={selectedFile?.arquivo || ""}
        title={"Visualizar anexo"}
      />
    </Box>
  );
};

export default QuoteItemAttachmentViewList;
