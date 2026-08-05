import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { SimilarOpportunitiesModalProps } from "../../models/oportunidades/Opportunity";
import { similarOpportunitiesModalStyle } from "../../styles/oportunidades/similarOpportunitiesModalStyle";

const SimilarOpportunitiesModal: React.FC<SimilarOpportunitiesModalProps> = ({
  open,
  opportunities,
  onClose,
  onCreateNew,
  onLinkTo,
}) => {

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={similarOpportunitiesModalStyle}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon color="error" />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <WarningAmberIcon color="warning" />
          <Typography variant="h6" fontWeight={600} color="warning.main">
            Propostas Semelhantes Encontradas
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Foram encontradas propostas com nomes semelhantes. Deseja vincular à proposta encontrada?
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ overflow: "auto", maxHeight: 300, mb: 2 }}>
          <List dense>
            {opportunities.map((opp) => (
              <ListItem
                key={opp.CODOS}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {opp.isVinculada && (
                      <Chip
                        size="small"
                        icon={<LinkIcon />}
                        label="Vinculada"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => onLinkTo(opp.CODOS)}
                      startIcon={<LinkIcon />}
                    >
                      Vincular
                    </Button>
                  </Stack>
                }
              >
                <ListItemButton sx={{ pr: 20 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {opp.NOME}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="text" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={onCreateNew}>
            Criar Nova Proposta
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SimilarOpportunitiesModal;
