import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RootState } from "../../redux/store";
import QuoteService from "../../services/requisicoes/QuoteService";
import { QuoteItemService } from "../../services/requisicoes/QuoteItemService";
import { Quote } from "../../models/requisicoes/Quote";
import { QuoteItem } from "../../models/requisicoes/QuoteItem";
import {
  calculateQuoteSubtotal,
  formatCurrency2To3,
  getQuoteItemObservation,
} from "../../utils";
import BaseDataTable from "../shared/BaseDataTable";
import { useSelectedQuoteItemColumns } from "../../hooks/requisicoes/useSelectedQuoteItemColumns";

export interface SelectedQuoteGroup {
  quote: Quote;
  selectedItems: QuoteItem[];
}

interface SelectedQuoteItemsDialogProps {
  open: boolean;
  onClose: () => void;
  idRequisicao: number;
  requisitionDescription?: string;
  requisitionProject?: string;
}

const PDF_MARGIN = 14;
const PDF_LINE_HEIGHT = 4.6;
const PDF_WRAP_TOLERANCE = 2;
const PDF_PRIMARY: [number, number, number] = [25, 118, 210];
const PDF_MUTED: [number, number, number] = [117, 117, 117];
const PDF_SUCCESS: [number, number, number] = [46, 125, 50];
const PDF_TEXT: [number, number, number] = [33, 33, 33];
const PDF_BORDER: [number, number, number] = [224, 224, 224];

const QUOTE_HEADER_WEIGHTS = [0.55, 1.5, 1, 1.2, 0.7, 1.25];
const ITEM_COLUMN_WEIGHTS = [0.7, 2.6, 0.45, 0.7, 0.8, 0.45, 0.45, 0.45, 0.85, 0.85];

type PdfColumnStyle = {
  cellWidth: number;
  halign?: "left" | "center" | "right";
  fontStyle?: "normal" | "bold";
  textColor?: [number, number, number];
};

const buildColumnStyles = (
  weights: number[],
  availableWidth: number,
  overrides: Record<number, Omit<PdfColumnStyle, "cellWidth">> = {}
): Record<number, PdfColumnStyle> => {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

  return weights.reduce<Record<number, PdfColumnStyle>>((styles, weight, index) => {
    styles[index] = {
      cellWidth: (weight * availableWidth) / totalWeight,
      ...overrides[index],
    };
    return styles;
  }, {});
};

const requisitionHeaderTextSx = {
  fontSize: {
    xs: "0.8rem",
    sm: "1.2rem",
  },
  fontWeight: 600,
  color: "primary.main",
} as const;

const SelectedQuoteItemsDialog: React.FC<SelectedQuoteItemsDialogProps> = ({
  open,
  onClose,
  idRequisicao,
  requisitionDescription,
  requisitionProject,
}) => {
  const [loading, setLoading] = useState(false);
  const [quoteGroups, setQuoteGroups] = useState<SelectedQuoteGroup[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<number[]>([]);

  const theme = useTheme();
  const items = useSelector((state: RootState) => state.requisitionItem.items);
  const columns = useSelectedQuoteItemColumns();

  const exportPdf = useCallback(
    async (groupsToExport: SelectedQuoteGroup[]) => {
      if (groupsToExport.length === 0) return;

      setIsExportingPdf(true);
      try {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const contentWidth = doc.internal.pageSize.getWidth() - PDF_MARGIN * 2;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const requisitionLines: string[] = doc.splitTextToSize(
          [
            idRequisicao ?? "-",
            requisitionDescription || "-",
            requisitionProject || "-",
          ].join(" | "),
          contentWidth - PDF_WRAP_TOLERANCE
        );

        const documentHeaderHeight = 10 + requisitionLines.length * PDF_LINE_HEIGHT;

        const splitSubtitle = (subtitle: string): string[] => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          return doc.splitTextToSize(subtitle, contentWidth - PDF_WRAP_TOLERANCE);
        };

        const drawDocumentHeader = (subtitleLines: string[] = []) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...PDF_PRIMARY);
          doc.text("Itens Cotados Selecionados", PDF_MARGIN, PDF_MARGIN + 4);

          doc.setFontSize(10);
          requisitionLines.forEach((line, index) => {
            doc.text(line, PDF_MARGIN, PDF_MARGIN + 10 + index * PDF_LINE_HEIGHT);
          });

          const nextY = PDF_MARGIN + documentHeaderHeight;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...PDF_MUTED);
          subtitleLines.forEach((line, index) => {
            doc.text(line, PDF_MARGIN, nextY + 2 + index * PDF_LINE_HEIGHT);
          });

          doc.setTextColor(0, 0, 0);
          return nextY + subtitleLines.length * PDF_LINE_HEIGHT + 4;
        };

        const getLastTableBottom = () =>
          (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
            ?.finalY ?? PDF_MARGIN;

        groupsToExport.forEach(({ quote, selectedItems }, groupIndex) => {
          if (groupIndex > 0) {
            doc.addPage();
          }

          const selectedTotal = selectedItems.reduce(
            (acc, item) =>
              acc +
              calculateQuoteSubtotal(
                Number(item.preco_unitario || 0),
                Number(item.quantidade_solicitada || 0),
                Number(item.IPI || 0),
                Number(item.ST || 0)
              ),
            0
          );

          const continuationLines = splitSubtitle(
            `Cotação #${quote.id_cotacao} | ${quote.fornecedor || "-"} (continuação)`
          );
          const continuationTop =
            PDF_MARGIN +
            documentHeaderHeight +
            continuationLines.length * PDF_LINE_HEIGHT +
            4;

          autoTable(doc, {
            startY: drawDocumentHeader(),
            head: [
              [
                "Cotação",
                "Fornecedor",
                "CNPJ Fornecedor",
                "Condição de pagamento",
                "Frete",
                "Total dos itens selecionados",
              ],
            ],
            body: [
              [
                `#${quote.id_cotacao}`,
                quote.fornecedor || "-",
                quote.cnpj_fornecedor || "-",
                quote.condicao_pagamento?.nome || "-",
                formatCurrency2To3(Number(quote.valor_frete || 0)),
                formatCurrency2To3(selectedTotal),
              ],
            ],
            theme: "plain",
            styles: {
              fontSize: 9,
              cellPadding: { top: 0.6, right: 3, bottom: 0.6, left: 0 },
              valign: "top",
              overflow: "linebreak",
            },
            headStyles: {
              fontSize: 7.5,
              fontStyle: "normal",
              textColor: PDF_MUTED,
            },
            bodyStyles: {
              fontStyle: "bold",
              textColor: PDF_TEXT,
            },
            columnStyles: buildColumnStyles(QUOTE_HEADER_WEIGHTS, contentWidth),
            didParseCell: (data) => {
              if (data.section === "body" && data.column.index === 5) {
                data.cell.styles.textColor = PDF_SUCCESS;
              }
            },
            margin: {
              left: PDF_MARGIN,
              right: PDF_MARGIN,
              top: continuationTop,
              bottom: PDF_MARGIN,
            },
          });

          autoTable(doc, {
            startY: getLastTableBottom() + 4,
            head: [
              [
                "Código",
                "Descrição do Produto",
                "Unidade",
                "Qtd. Solicitada",
                "Preço Unitário",
                "ICMS %",
                "IPI %",
                "ST %",
                "Subtotal",
                "Total",
              ],
            ],
            body: selectedItems.map((item) => {
              const unitPrice = Number(item.preco_unitario || 0);
              const requestedQuantity = Number(item.quantidade_solicitada || 0);
              const ipiPercent = Number(item.IPI || 0);
              const subtotal = unitPrice * requestedQuantity;
              const totalWithTaxes = calculateQuoteSubtotal(
                unitPrice,
                requestedQuantity,
                ipiPercent,
                Number(item.ST || 0)
              );

              const observacao = getQuoteItemObservation(item);
              const descricao =
                item.produto_descricao || item.descricao_item || "-";

              return [
                item.produto_codigo || "-",
                observacao ? `${descricao}\nObs.: ${observacao}` : descricao,
                item.produto_unidade || "-",
                requestedQuantity.toString(),
                formatCurrency2To3(unitPrice),
                `${Number(item.ICMS || 0)}%`,
                `${ipiPercent}%`,
                `${Number(item.ST || 0)}%`,
                formatCurrency2To3(subtotal),
                formatCurrency2To3(totalWithTaxes),
              ];
            }),
            theme: "grid",
            styles: {
              fontSize: 8,
              cellPadding: 1.5,
              valign: "middle",
              overflow: "linebreak",
              lineColor: PDF_BORDER,
              lineWidth: 0.1,
              textColor: PDF_TEXT,
            },
            headStyles: {
              fillColor: PDF_PRIMARY,
              textColor: 255,
              fontStyle: "bold",
              halign: "left",
            },
            columnStyles: buildColumnStyles(ITEM_COLUMN_WEIGHTS, contentWidth, {
              3: { halign: "right" },
            }),
            didParseCell: (data) => {
              if (data.section !== "body") return;

              if (data.column.index === 0) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = PDF_MUTED;
              }

              if (data.column.index === 1) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = [0, 0, 0];
              }

              if (data.column.index === 8 || data.column.index === 9) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = PDF_SUCCESS;
              }
            },
            rowPageBreak: "auto",
            margin: {
              left: PDF_MARGIN,
              right: PDF_MARGIN,
              top: continuationTop,
              bottom: PDF_MARGIN,
            },
            willDrawPage: (data) => {
              if (data.pageNumber > 1) {
                drawDocumentHeader(continuationLines);
              }
            },
          });
        });

        doc.save(`itens-cotados-req-${idRequisicao}.pdf`);
      } finally {
        setIsExportingPdf(false);
      }
    },
    [idRequisicao, requisitionDescription, requisitionProject]
  );

  const handleOpenSupplierDialog = useCallback(() => {
    if (quoteGroups.length === 0) return;
    setSelectedQuoteIds(quoteGroups.map(({ quote }) => quote.id_cotacao));
    setSupplierDialogOpen(true);
  }, [quoteGroups]);

  const toggleQuoteSelection = useCallback((quoteId: number, checked: boolean) => {
    setSelectedQuoteIds((prev) => {
      if (checked) {
        return prev.includes(quoteId) ? prev : [...prev, quoteId];
      }
      return prev.filter((id) => id !== quoteId);
    });
  }, []);

  const handleConfirmSupplierSelection = useCallback(async () => {
    const groupsToExport = quoteGroups.filter(({ quote }) =>
      selectedQuoteIds.includes(quote.id_cotacao)
    );

    if (groupsToExport.length === 0) {
      return;
    }

    setSupplierDialogOpen(false);
    await exportPdf(groupsToExport);
  }, [exportPdf, quoteGroups, selectedQuoteIds]);

  const fetchSelectedItems = useCallback(async () => {
    if (!idRequisicao) return;

    setLoading(true);
    try {
      const selectedItemCotacaoIds = new Set<number>(
        items
          .filter((item) => item.id_item_cotacao)
          .map((item) => item.id_item_cotacao as number)
      );

      if (selectedItemCotacaoIds.size === 0) {
        setQuoteGroups([]);
        return;
      }

      const quotes: Quote[] = await QuoteService.getAllQuotesByReq(idRequisicao);

      const groups = await Promise.all(
        quotes.map(async (quote) => {
          const allItems: QuoteItem[] = await QuoteItemService.getMany({
            id_cotacao: quote.id_cotacao,
          });
          const selectedItems = allItems.filter((qi) =>
            selectedItemCotacaoIds.has(qi.id_item_cotacao)
          );
          return { quote, selectedItems };
        })
      );

      setQuoteGroups(groups.filter((g) => g.selectedItems.length > 0));
    } finally {
      setLoading(false);
    }
  }, [idRequisicao, items]);

  useEffect(() => {
    if (open) {
      fetchSelectedItems();
    }
  }, [open, fetchSelectedItems]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                Itens Cotados Selecionados
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.75,
                  mt: 0.5,
                }}
              >
                <Typography component="span" sx={requisitionHeaderTextSx}>
                  {idRequisicao ?? "-"}
                </Typography>
                <Typography component="span" sx={requisitionHeaderTextSx}>
                  |
                </Typography>
                <Typography component="span" sx={requisitionHeaderTextSx}>
                  {requisitionDescription || "-"}
                </Typography>
                <Typography component="span" sx={requisitionHeaderTextSx}>
                  |
                </Typography>
                <Typography component="span" sx={requisitionHeaderTextSx}>
                  {requisitionProject || "-"}
                </Typography>
              </Box>
            </Box>
            <Stack data-html2pdf-hide direction="row" spacing={1} alignItems="center">
              {quoteGroups.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isExportingPdf ? <CircularProgress size={14} /> : <PictureAsPdfIcon />}
                  onClick={handleOpenSupplierDialog}
                  disabled={isExportingPdf || loading}
                >
                  {isExportingPdf ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              )}
              <IconButton onClick={onClose} color="error" size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : quoteGroups.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
              Nenhum item cotado selecionado foi encontrado para esta requisição.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {quoteGroups.map(({ quote, selectedItems }) => (
                <Paper key={quote.id_cotacao} variant="outlined" sx={{ p: 2 }}>
                  {/* Quote header */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    mb={1.5}
                    flexWrap="wrap"
                    alignItems={{ sm: "center" }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cotação #{quote.id_cotacao}
                      </Typography>
                      <Typography fontWeight={600} color="primary.main" fontSize="0.95rem">
                        {quote.fornecedor}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        CNPJ Fornecedor
                      </Typography>
                      <Typography fontSize="0.85rem">{quote.cnpj_fornecedor || "—"}</Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Condição de pagamento
                      </Typography>
                      <Typography fontSize="0.85rem">
                        {quote.condicao_pagamento?.nome || "—"}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Frete
                      </Typography>
                      <Typography fontSize="0.85rem">
                        {formatCurrency2To3(Number(quote.valor_frete))}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Total dos itens selecionados
                      </Typography>
                      <Typography fontSize="0.9rem" fontWeight={600} color="success.main">
                        {formatCurrency2To3(
                          selectedItems.reduce(
                            (acc, item) =>
                              acc +
                              calculateQuoteSubtotal(
                                Number(item.preco_unitario || 0),
                                Number(item.quantidade_solicitada || 0),
                                Number(item.IPI || 0),
                                Number(item.ST || 0)
                              ),
                            0
                          )
                        )}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Items table */}
                  <Box
                    sx={{
                      height: Math.min(
                        60 +
                          selectedItems.reduce(
                            (acc, item) =>
                              acc + (getQuoteItemObservation(item) ? 72 : 52),
                            0
                          ),
                        400
                      ),
                      width: "100%",
                      overflowX: "hidden",
                    }}
                  >
                    <BaseDataTable
                      rows={selectedItems}
                      columns={columns}
                      getRowId={(row) => row.id_item_cotacao}
                      getRowHeight={() => "auto"}
                      hideFooter={selectedItems.length < 25}
                      disableRowSelectionOnClick
                      isCellEditable={() => false}
                      theme={theme}
                      density="compact"
                      disableColumnMenu
                      sx={{
                        height: "100%",
                        width: "100%",
                        "& .MuiDataGrid-virtualScroller": {
                          overflowX: "hidden !important",
                        },
                        "& .MuiDataGrid-main": {
                          overflowX: "hidden",
                        },
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Box>

      <Dialog
        open={supplierDialogOpen}
        onClose={() => setSupplierDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Selecionar fornecedores para o PDF</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={0.5}>
            {quoteGroups.map(({ quote, selectedItems }) => (
              <FormControlLabel
                key={quote.id_cotacao}
                control={
                  <Checkbox
                    checked={selectedQuoteIds.includes(quote.id_cotacao)}
                    onChange={(event) =>
                      toggleQuoteSelection(quote.id_cotacao, event.target.checked)
                    }
                  />
                }
                label={`${quote.fornecedor || "Fornecedor"} | Cotação #${quote.id_cotacao} | ${selectedItems.length} item(ns)`}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierDialogOpen(false)} disabled={isExportingPdf}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSupplierSelection}
            variant="contained"
            disabled={isExportingPdf || selectedQuoteIds.length === 0}
          >
            Gerar PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default SelectedQuoteItemsDialog;
