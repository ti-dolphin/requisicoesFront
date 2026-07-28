import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  updateRequisitionField,
  setMode,
  setRequisition,
  clearRequisition,
  setLoading,
  setError,
  setCreating,
} from "../../redux/slices/requisicoes/requisitionSlice";
import { Box, Button, TextField, CircularProgress, Autocomplete, AutocompleteRenderInputParams, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Tooltip } from "@mui/material";
import HelpOutline from "@mui/icons-material/HelpOutline";
import { Requisition } from "../../models/requisicoes/Requisition";
import { useProjectOptions } from "../../hooks/projectOptionsHook";
import { FieldConfig, Option } from "../../types";
import { useRequisitionTypeOptions } from "../../hooks/requisicoes/useRequisitionTypeOptions";
import { useNavigate } from "react-router-dom";
import RequisitionService from "../../services/requisicoes/RequisitionService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { setRows } from "../../redux/slices/requisicoes/requisitionTableSlice";
import { setAddingProducts } from "../../redux/slices/requisicoes/requisitionItemSlice";
import ElegantInput from "../shared/ui/Input";
import OptionsField from "../shared/ui/OptionsField";
import { normalizeText } from "../../utils";



const RequisitionForm: React.FC = () => {
  const dispatch = useDispatch();
  const rows = useSelector((state: RootState) => state.requisitionTable.rows);
  const { projectOptions } = useProjectOptions();
  const { reqTypeOptions } = useRequisitionTypeOptions();
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const userOption = { id: user?.CODPESSOA || 0, name: user?.NOME || ''};
  const { requisition, mode, loading, error } = useSelector(
    (state: RootState) => state.requisition
  );

  const [tiposFaturamento, setTiposFaturamento] = useState<
    { id: number; nome_faturamento: string; escopo: number; descricao?: string }[]
  >([]);
  const [tipoFaturamentoSelecionado, setTipoFaturamentoSelecionado] = useState<number | null>(null);

  // Buscar tipos de faturamento ao montar
  useEffect(() => {
    RequisitionService.getAllFaturamentosTypes({ visible: 1 }).then((data) => {
      setTiposFaturamento(data);
      if (data && data.length > 0) setTipoFaturamentoSelecionado(data[0].id);
    });
  }, []);

  const fields: FieldConfig[] = [
    {
      label: "Descrição",
      field: "DESCRIPTION",
      type: "text",
      disabled: false,
      required: true,
      defaultValue: "",
      value: requisition.DESCRIPTION ?? "",
    },
    {
      label: "Projeto",
      field: "ID_PROJETO",
      type: "autocomplete",
      disabled: false,
      required: true,
      defaultValue: "",
      options: projectOptions,
      value: projectOptions.find((opt) => opt.id === requisition.ID_PROJETO)?.id || null,
    },
    {
      label: "Responsável",
      field: "ID_RESPONSAVEL",
      type: "autocomplete",
      disabled: true,
      defaultValue: user?.NOME || "",
      options: [userOption],
      value: userOption.id,
    },
  ];

 //setando usuário como responsável default

  
  const handleChange = (field: keyof Requisition) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(updateRequisitionField({ field, value: e.target.value }));
  };

  const handleChangeOptionField = (field : keyof Requisition, id: number) => {
    dispatch(updateRequisitionField({ field, value: id }));
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));

    if (!tipoFaturamentoSelecionado || !requisition.ID_PROJETO || !requisition.DESCRIPTION) {
      dispatch(setLoading(false));
      dispatch(setError("Todos os campos são obrigatórios."));
      return;
    }

    try {
        if (mode === "create") {
            // Busca o tipo selecionado para pegar o escopo e tipo_faturamento correspondente
            const tipoSelecionado = tiposFaturamento.find(t => t.id === tipoFaturamentoSelecionado);

            let id_status_requisicao = 1
            if (tipoSelecionado?.id === 3) {
              id_status_requisicao = 107
            } else if (tipoSelecionado?.id === 6) {
              id_status_requisicao = 115
            }

            const newRequisition = await RequisitionService.create({
              DESCRIPTION: requisition.DESCRIPTION,
              ID_PROJETO: requisition.ID_PROJETO,
              TIPO: 9,
              tipo_faturamento: tipoSelecionado ? tipoSelecionado.id : null,
              ID_RESPONSAVEL: requisition.ID_RESPONSAVEL,
              id_status_requisicao: id_status_requisicao,
              id_escopo_requisicao: tipoSelecionado
                ? tipoSelecionado.escopo
                : null,
            });
            dispatch(setRows([...rows, newRequisition]));
            dispatch(clearRequisition());
            dispatch(setLoading(false));
            dispatch(
                setFeedback({
                    message: "Requisição criada com sucesso!",
                    type: "success",
                })
            );
            handleClose();
            dispatch(setAddingProducts(true))
            navigate(`/requisicoes/${newRequisition.ID_REQUISICAO}`);
            return;
        }
    } catch (err: any) {
      dispatch(setLoading(false));
      dispatch(setError(err?.message || "Erro ao criar requisição."));
      dispatch(
        setFeedback({
            message: err?.message || "Erro ao criar requisição.",
            type: "error",
        })
      );
    }
  };

  const handleEdit = () => {
    dispatch(setMode("edit"));
  };

  const handleClose = () => {
    dispatch(clearRequisition());
    dispatch(setMode("view"));
    dispatch(setCreating(false));
    dispatch(setLoading(false));
  };


  const isReadOnly = mode === "view";

  useEffect(() => { 
    //setando user como responsável
    dispatch(setRequisition({
        ...requisition,
        ID_RESPONSAVEL : user?.CODPESSOA || 0,
        criado_por: {NOME: user?.NOME || '', CODPESSOA: user?.CODPESSOA || 0},
        alterado_por: {NOME: user?.NOME || '', CODPESSOA: user?.CODPESSOA || 0}
    }))
  }, [dispatch])

  // Função para exibir label do escopo
  const getEscopoLabel = (escopo: number) => {
    switch (escopo) {
      case 1: return "Estoque";
      case 2: return "Faturamento Dolphin";
      case 3: return "Compras Operacional";
      default: return "";
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
    >
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        textTransform="uppercase"
        fontWeight="600"
      >
        Nova requisição
      </Typography>
      {/* Descrição */}
      <ElegantInput 
        label="Descrição"
        required={true}
        value={String(requisition.DESCRIPTION ?? "")}
        onChange={handleChange("DESCRIPTION")}
        disabled={isReadOnly}
      />
      {/* Projeto */}
      <OptionsField
        options={projectOptions}
        label="Projeto"
        value={ projectOptions.find((opt) => opt.id === requisition.ID_PROJETO)?.id }
        optionHeight={60}
        required={true}
        onChange={(id) => handleChangeOptionField("ID_PROJETO", Number(id))}
        filterOption={(option, search) =>
          normalizeText(option.name).includes(normalizeText(search))
        }
        disabled={isReadOnly}
      />
      {/* Radios de tipos de faturamento - entre Projeto e Responsável */}
      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Tipo de Solicitação</FormLabel>
        <RadioGroup
          value={tipoFaturamentoSelecionado ?? ""}
          onChange={e => setTipoFaturamentoSelecionado(Number(e.target.value))}
        >
          {tiposFaturamento.map((tipo) => (
            <FormControlLabel
              key={tipo.id}
              value={tipo.id}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tipo.nome_faturamento}</span>
                  {tipo.descricao && (
                    <Tooltip title={tipo.descricao} arrow placement="right">
                      <HelpOutline sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                    </Tooltip>
                  )}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
      {/* Responsável */}
      <OptionsField
        options={[userOption]}
        label="Responsável"
        value={userOption.id}
        optionHeight={60}
        required={false}
        onChange={(id) => handleChangeOptionField("ID_RESPONSAVEL", Number(id))}
        disabled={true}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          {isReadOnly ? (
            <Button variant="contained" onClick={handleEdit}>
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "primary.main",
                  borderRadius: 2,
                  textTransform: "capitalize",
                }}
                type="submit"
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "error.main",
                  borderRadius: 2,
                  textTransform: "capitalize",
                  "&:hover": {
                    backgroundColor: "error.dark",
                  },
                }}
                onClick={handleClose}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      )}
      {error && (
        <Box color="error.main" mt={1}>
          {error}
        </Box>
      )}
    </Box>
  );
};

export default RequisitionForm;
