import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Badge, BadgeProps, Box, IconButton, Radio, RadioGroup, FormControlLabel, styled, Tooltip, Typography } from "@mui/material";
import { blue, green, red } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { set } from "lodash";
import { useIsMobile } from "./useIsMobile";
import FileIcon from '@mui/icons-material/FilePresent';
import { setViewingProductAttachment, setViewingStandardGuide, setProducts } from "../redux/slices/productSlice";
import { setFeedback } from "../redux/slices/feedBackSlice";
import { ProductService } from "../services/ProductService";
import CircleIcon from '@mui/icons-material/Circle';
import ClearIcon from '@mui/icons-material/Clear';
import { useProductPermissions } from "./productPermissionsHook";
import { ProductPatrimonyType } from "../models/Product";
import { formatQuantidade } from "../utils";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    padding: "0 4px",
  },
}));

interface UseProductColumnsParams {
  patrimonyTypes: ProductPatrimonyType[];
  onUpdatePatrimonyType: (productId: number, patrimonyTypeId: number | null) => Promise<void>;
  disablePatrimonyActions?: boolean;
}

export const useProductColumns = ({ patrimonyTypes, onUpdatePatrimonyType, disablePatrimonyActions = false }: UseProductColumnsParams) => {
  const dispatch = useDispatch();
  const {
    addingProducts,
    replacingItemProduct,
  } = useSelector((state: RootState) => state.requisitionItem);

  const { viewingProducts } = useSelector((state: RootState) => state.productSlice);

  const { isMobile } = useIsMobile();
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const user = useSelector((state: RootState) => state.user.user);
  const { editProductFieldsPermitted, hasStockPermission } = useProductPermissions(user);
  
  const togglePermission = async (row: any, field: string, currentValue: any) => {
    try {
      const payload: any = {};
      payload[field] = currentValue === 1 ? 0 : 1;
      await ProductService.update(row.ID, payload);
      
      // Fetch latest list and set it
      const refreshed = await ProductService.getMany();
      dispatch(setProducts(refreshed));
      dispatch(setFeedback({ message: 'Permissão atualizada', type: 'success' }));
    } catch (e: any) {
      console.error('Erro ao atualizar permissão', e);
      dispatch(setFeedback({ message: `Erro ao atualizar permissão: ${e.message || e}`, type: 'error' }));
    }
  };

  const addingProductsColumns: GridColDef[] = [
    {
      field: "ID",
      headerName: "ID",
      type: "number",
      flex: 0.1,
      editable: false,
    },
    {
      field: "codigo",
      headerName: "Código Produto",
      type: "string",
      flex: 0.5,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "descricao",
      headerName: "Descrição",
      type: "string",
      flex: 1,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "unidade",
      headerName: "Unidade",
      type: "string",
      flex: 0.2,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "quantidade_disponivel",
      headerName: "Disponivel",
      type: "number",
      flex: 0.2,
      editable: false,
      valueGetter: (value) => value || 0,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              height: "100%",
              padding: 1,
              backgroundColor: params.value > 0 ? green[200] : red[200],
            }}
          >
            <Typography fontSize="12px" fontWeight={"bold"}>
              {formatQuantidade(params.value)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "anexos",
      headerName: "anexos",
      flex: 0.15,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 1,
            }}
          >
            <IconButton onClick={() => { dispatch(setViewingProductAttachment(params.row.ID)) }}>
              <StyledBadge
                variant="standard"
                badgeContent={Array.isArray(params.row.anexos) ? params.row.anexos.length : 0}
                color="primary"
              >
                <FileIcon sx={{ fontSize: 14 }} />
              </StyledBadge>
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: "produto_padrao",
      headerName: "Produto Padrão",
      flex: 0.15,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 1,
            }}
          >
            <IconButton onClick={() => { dispatch(setViewingStandardGuide(params.row.ID)) }}>
              <StyledBadge
                variant="standard"
                badgeContent={(params.row.anexos || []).filter((a: any) => a.is_produto_padrao === true).length}
                color="secondary"
              >
                <FileIcon sx={{ fontSize: 14 }} />
              </StyledBadge>
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const mobileColumns: GridColDef[] = [
    {
      field: "codigo",
      headerName: "Código Produto",
      type: "string",
      flex: 0.5,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "descricao",
      headerName: "Descrição",
      type: "string",
      flex: 1,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "unidade",
      headerName: "Unidade",
      type: "string",
      flex: 0.2,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "quantidade_disponivel",
      headerName: "Disponivel",

      type: "number",
      flex: 0.2,
      editable: false,
      valueGetter: (value) => value || 0,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              height: "100%",
              padding: 1,
              backgroundColor: params.value > 0 ? green[200] : red[200],
            }}
          >
            <Typography fontSize="12px" fontWeight={"bold"}>
              {formatQuantidade(params.value)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "",
      headerName: "Anexos",
      flex: 0.2,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              height: "100%",
              padding: 1,
              backgroundColor: params.value > 0 ? green[200] : red[200],
            }}
          >
            <IconButton sx={{ height: 24, width: 24 }}>
              <FileIcon />
            </IconButton>
          </Box>
        );
      },
    }
  ];

  // Build viewing columns and include permission columns only for administrators
  const viewingProductsColumnsBase: GridColDef[] = [
    {
      field: "ID",
      headerName: "ID",
      type: "number",
      flex: 0.1,
      editable: false,
    },
    {
      field: "codigo",
      headerName: "Código Produto",
      type: "string",
      flex: 0.5,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "descricao",
      headerName: "Descrição",
      type: "string",
      flex: 1,
      editable: false,
      valueGetter: (value) => value || "",
    },
    {
      field: "unidade",
      headerName: "Unidade",
      type: "string",
      flex: 0.15,
      editable: false,
      valueGetter: (value) => value || "",
    },

    {
      field: "quantidade_estoque",
      headerName: "Estoque",
      type: "number",
      flex: 0.15,
      editable: editProductFieldsPermitted || hasStockPermission,
      valueGetter: (value) => value || 0,
      renderCell: (params: GridRenderCellParams) => formatQuantidade(params.value),
    },
    {
      field: "quantidade_reservada",
      headerName: "Reservado",
      type: "number",
      flex: 0.15,
      editable: false,
      valueGetter: (value) => value || 0,
      renderCell: (params: GridRenderCellParams) => formatQuantidade(params.value),
    },
    {
      field: "quantidade_disponivel",
      headerName: "Disponível",
      type: "number",
      flex: 0.15,
      editable: false,
      valueGetter: (value) => value || 0,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              height: "100%",
              padding: 1,

            }}
          >
            <Typography fontSize="12px" color={params.value > 0 ? green[600] : red[600]} fontWeight={"bold"}>
              {formatQuantidade(params.value)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "tipo_produto_patrimonio",
      headerName: "Patrimonio",
      flex: 0.35,
      minWidth: 210,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const rowValue = Number(params.row?.tipo_produto_patrimonio || 0);
        const canEditPatrimony = !!(editProductFieldsPermitted || user?.PERM_ADMINISTRADOR === 1);

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Tooltip title="Desmarcar patrimônio">
              <span>
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!canEditPatrimony || disablePatrimonyActions || rowValue === 0) return;
                    await onUpdatePatrimonyType(Number(params.row.ID), null);
                  }}
                  disabled={!canEditPatrimony || disablePatrimonyActions || rowValue === 0}
                >
                  <ClearIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>
            <RadioGroup
              row
              value={rowValue > 0 ? String(rowValue) : ""}
              onClick={(e) => e.stopPropagation()}
              sx={{ flexWrap: "nowrap", minWidth: 0 }}
              onChange={async (e) => {
                const nextValue = Number(e.target.value);
                if (!Number.isInteger(nextValue) || nextValue <= 0 || nextValue === rowValue) return;

                await onUpdatePatrimonyType(Number(params.row.ID), nextValue);
              }}
            >
              {patrimonyTypes.map((type) => (
                <FormControlLabel
                  key={type.id}
                  value={String(type.id)}
                  control={<Radio size="small" disabled={!canEditPatrimony || disablePatrimonyActions} />}
                  label={type.nome || `Tipo ${type.id}`}
                  sx={{
                    mr: 1,
                    whiteSpace: "nowrap",
                    '& .MuiFormControlLabel-label': { fontSize: 12 },
                  }}
                />
              ))}
            </RadioGroup>
          </Box>
        );
      },
    },
    {
      field: "anexos",
      headerName: "anexos",
      flex: 0.15,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 1,
            }}
          >
            <IconButton onClick={() => { dispatch(setViewingProductAttachment(params.row.ID)) }}>
              <StyledBadge
                variant="standard"
                badgeContent={Array.isArray(params.row.anexos) ? params.row.anexos.length : 0}
                color="primary"
              >
                <FileIcon sx={{ fontSize: 14 }} />
              </StyledBadge>
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: "produto_padrao",
      headerName: "Produto Padrão",
      flex: 0.15,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 1,
            }}
          >
            <IconButton onClick={() => { dispatch(setViewingStandardGuide(params.row.ID)) }}>
              <StyledBadge
                variant="standard"
                badgeContent={(params.row.anexos || []).filter((a: any) => a.is_produto_padrao === true).length}
                color="secondary"
              >
                <FileIcon sx={{ fontSize: 14 }} />
              </StyledBadge>
            </IconButton>
          </Box>
        );
      },
    },
  ];

  // If user is administrator, append permission columns
  const viewingProductsColumns: GridColDef[] = [...viewingProductsColumnsBase];
  if (user?.PERM_ADMINISTRADOR === 1) {
    viewingProductsColumns.push(
      {
        field: "perm_ti",
        headerName: "TI",
        flex: 0.1,
        editable: true,
        type: "boolean",
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); togglePermission(params.row, 'perm_ti', params.value); }}
              >
                <CircleIcon sx={{ fontSize: 14, color: params.value === 1 ? green[600] : red[600] }} />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "perm_operacional",
        headerName: "Operacional",
        flex: 0.1,
        editable: true,
        type: "boolean",
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); togglePermission(params.row, 'perm_operacional', params.value); }}>
                <CircleIcon sx={{ fontSize: 14, color: params.value === 1 ? green[600] : red[600] }} />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "perm_faturamento_direto",
        headerName: "Fat. Direto",
        flex: 0.1,
        editable: true,
        type: "boolean",
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); togglePermission(params.row, 'perm_faturamento_direto', params.value); }}>
                <CircleIcon sx={{ fontSize: 14, color: params.value === 1 ? green[600] : red[600] }} />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "perm_faturamento_dse",
        headerName: "Fat. DSE",
        flex: 0.1,
        editable: true,
        type: "boolean",
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); togglePermission(params.row, 'perm_faturamento_dse', params.value); }}>
                <CircleIcon sx={{ fontSize: 14, color: params.value === 1 ? green[600] : red[600] }} />
              </IconButton>
            </Box>
          );
        },
      }
    );
  }

  useEffect(() => {
    if (isMobile) {
      setColumns(mobileColumns);
      return;
    }
    if (addingProducts || replacingItemProduct) {
      setColumns(addingProductsColumns);
      return;
    }
    if (viewingProducts) {
      setColumns(viewingProductsColumns);
      return;
    }

  }, [
    isMobile,
    addingProducts,
    replacingItemProduct,
    viewingProducts,
    user?.PERM_ADMINISTRADOR,
    editProductFieldsPermitted,
    hasStockPermission,
    patrimonyTypes,
    dispatch,
  ]);
  return { columns };
}