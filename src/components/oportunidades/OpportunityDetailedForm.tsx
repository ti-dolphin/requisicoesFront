import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  AutocompleteRenderInputParams,
  Autocomplete,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Opportunity } from "../../models/oportunidades/Opportunity";
import { FieldConfig, Option } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import OpportunityService from "../../services/oportunidades/OpportunityService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { RootState } from "../../redux/store";
import { useOppDetailedFields } from "../../hooks/oportunidades/useOppDetailedFields";
import {
  formatCurrency,
  formatDateStringtoISOstring,
  getDateStringFromISOstring,
  getDateInputValue,
} from "../../utils";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";
import CurrencyInput from "../shared/ui/CurrencyInput";
import EmailIcon from "@mui/icons-material/Email";

const OpportunityDetailedForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.user);
  const [opportunity, setOpportunity] = useState<Partial<Opportunity>>({});
  const [formData, setFormData] = useState<any>({});
  const { fieldsMap } = useOppDetailedFields(user, opportunity);
  const [deletingOpp, setDeletingOpp] = useState<Partial<Opportunity> | null>(
    null
  );
  const [finalizeConfirmOpen, setFinalizeConfirmOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const getNumericValue = (value: unknown) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const liveTotalValue =
    getNumericValue(formData.VALORFATDIRETO ?? opportunity.VALORFATDIRETO) +
    getNumericValue(formData.VALORFATDOLPHIN ?? opportunity.VALORFATDOLPHIN);

  const validateBeforeSave = () => {
    const status = formData.CODSTATUS ?? opportunity.CODSTATUS;
    const dataInicio = formData.DATAINICIO ?? opportunity.DATAINICIO
    const dataEntrega = formData.DATAENTREGA ?? opportunity.DATAENTREGA

    if ([9, 11, 12].includes(status)) {
      if (!dataInicio || dataInicio === '') {
        return {
          error: true,
          message: 'Data de envio inicial precisa estar preenchida.'
        }
      }
    } 
    if ([11, 12, 13].includes(status)) {
      if (!dataEntrega || dataEntrega === '') {
        return {
          error: true,
          message: 'Data de Fechamento precisa estar preenchida.'
        }
      }
    }
    return { error: false, message: '' }
  }

  const { CODOS } = useParams();

  const verifyStatus = () => {
    if (user?.PERM_ADMINISTRADOR === 1) return true;
    
    if (!opportunity || !opportunity.status) return false;
    
    // Permite que o vendedor da oportunidade edite mesmo quando ganha (status 11)
    // if (opportunity.responsavel?.CODPESSOA === user?.CODPESSOA) return true;
    
    const declinedStatutes = [11, 12, 13]
    return !declinedStatutes.includes(opportunity.status.CODSTATUS);
  }

  const saveOpp = async () => {
    if (!CODOS) return;
    const status = formData.CODSTATUS ?? opportunity.CODSTATUS;
    const valid = validateBeforeSave()
    if (valid.error) {
      dispatch(setFeedback({ message: valid.message, type: "error" }));
      return;
    }

    if ([11, 12, 13].includes(status)) {
      setFinalizeConfirmOpen(true);
      return;
    }
    confirmSaveOpp()
  };

  const confirmSaveOpp = async () => {
    try {
      const opp = await OpportunityService.update(
        Number(CODOS),
        formData,
        user ? user : undefined
      );
      setOpportunity(opp);
      dispatch(
        setFeedback({
          message: "Oportunidade salva com sucesso",
          type: "success",
        })
      );
    } catch (error) {
      setFeedback({ message: "Erro ao salvar oportunidade", type: "error" });
    }
  }

  const handleResendSoldEmail = async () => {
    if (!CODOS) return;
    setResendingEmail(true);
    try {
      await OpportunityService.sendSoldOpportunityEmail(
        Number(CODOS),
        formData,
        user ? user : undefined
      );
      dispatch(
        setFeedback({
          message: "E-mail de ganho reenviado com sucesso",
          type: "success",
        })
      );
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Erro ao reenviar e-mail de ganho",
          type: "error",
        })
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const handleTextFieldChange = (
    field: FieldConfig,
    value: any,
    fieldMapKey: string
  ) => {
    const updatedOpp = { ...opportunity, [field.field]: value };
    const fields = fieldsMap.get(fieldMapKey)?.map((f) => f.field);
    let payload = { ...formData };
    if (fieldMapKey === "datas") {
      console.log("[handleTextFieldChange] fieldMapKey=datas");
      console.log("field:", field);
      console.log("value:", value);
      console.log("updatedOpp:", updatedOpp);
      console.log("fields:", fields);
      fields?.forEach((f) => {
        const formattedDate = formatDateStringtoISOstring(
          String(updatedOpp[f as keyof Opportunity])
        );
        console.log(`Formatando campo ${f}:`, updatedOpp[f as keyof Opportunity], "->", formattedDate);
        payload = {
          ...payload,
          [f]: formattedDate,
        };
      });
      console.log("payload final:", payload);
      setFormData(payload);
      setOpportunity(updatedOpp);
      // debouncedSave(payload);
      return;
    }
    fields?.forEach((f) => {
      payload = { ...payload, [f]: updatedOpp[f as keyof Opportunity] };
    });

    setFormData(payload);
    setOpportunity(updatedOpp);
    // debouncedSave(payload);
  };

  const handleAutocompleteChange = (
    field: string,
    option: Option | null,
    fieldMapKey: string
  ) => {
    if (!option) return;
    const updatedOpp = { ...opportunity, [field]: option.id };
    const fields = fieldsMap.get(fieldMapKey)?.map((f) => f.field);
    let payload = { ...formData };
    fields?.forEach((f) => {
      payload = { ...payload, [f]: updatedOpp[f as keyof Opportunity] };
    });
    setFormData(payload);
    setOpportunity(updatedOpp);
    // debouncedSave(payload);
  };

  const handleDelete = async () => {
    if (!deletingOpp?.CODOS) return;
    try {
      await OpportunityService.delete(deletingOpp.CODOS);
      navigate("/oportunidades");
    } catch (e) {
      setDeletingOpp(null);
      dispatch(
        setFeedback({
          message: "Erro ao deletar oportunidade",
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!CODOS) return;
      try {
        const opportunity = await OpportunityService.getById(Number(CODOS));
        setOpportunity(opportunity);
      } catch (e) {
        dispatch(
          setFeedback({
            message: "Erro ao buscar oportunidade",
            type: "error",
          })
        );
      }
    };
    fetchOpportunity();
  }, [CODOS, dispatch]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 1, borderRadius: 1, height: "100%" }}>
          <Typography
            variant="subtitle1"
            color="primary.main"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Cadastro
          </Typography>
          <Grid container gap={2}>
            {fieldsMap?.get("cadastro")?.map((field) => {
              if (field.type === "autocomplete" && field.options) {
                return (
                  <Grid item xs={12} key={field.field}>
                    <Autocomplete
                      options={field.options}
                      getOptionLabel={(option) => option?.name || ""}
                      getOptionKey={(option) => option?.id || ""}
                      disabled={field.disabled}
                      aria-required={field.required}
                      slotProps={{
                        popper: { sx: { fontSize: 13 } },
                        paper: { sx: { fontSize: 13, borderRadius: 0 } },
                      }}
                      fullWidth
                      key={field.field}
                      aria-label={field.label}
                      value={field.options.find(
                        (option) =>
                          option.id ===
                          opportunity[field.field as keyof Opportunity]
                      )}
                      onChange={(_e, value) =>
                        handleAutocompleteChange(field.field, value, "cadastro")
                      }
                      renderInput={(params: AutocompleteRenderInputParams) => (
                        <TextField
                          {...params}
                          InputLabelProps={{
                            shrink: true,
                            sx: {
                              fontSize: 14,
                              color: "text.secondary",
                              fontWeight: "bold",
                            },
                          }}
                          InputProps={{
                            ...params.InputProps,
                            sx: { borderRadius: 0 },
                          }}
                          label={field.label}
                          variant="outlined"
                          fullWidth
                          required={field.required}
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                );
              }
              return (
                <Grid item xs={12} key={field.field}>
                  <TextField
                    required={field.required}
                    fullWidth
                    onChange={(e) =>
                      handleTextFieldChange(field, e.target.value, "cadastro")
                    }
                    name={field.field}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        fontSize: 14,
                        color: "text.secondary",
                        fontWeight: "bold",
                      },
                    }}
                    InputProps={{
                      sx: { borderRadius: 0 },
                    }}
                    key={field.field}
                    label={field.label}
                    variant="outlined"
                    type={field.type}
                    disabled={field.disabled}
                    value={opportunity[field.field as keyof Opportunity]}
                    size="small"
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 1, borderRadius: 1, height: "100%" }}>
          <Typography
            variant="subtitle1"
            color="primary.main"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Datas
          </Typography>
          <Grid container gap={2}>
            {fieldsMap?.get("datas")?.map((field) => {
              const value = field.defaultValue;
              if (
                field.field === "DATAINTERACAO" &&
                opportunity.status?.ACAO === 1
              )
                return null;
              return (
                <Grid item xs={12} key={field.field}>
                  {field.field === "DATAINTERACAO" &&
                    opportunity.status?.ACAO !== 1 && (
                      <Typography
                        color="text.secondary"
                        fontWeight="bold"
                        fontSize={13}
                        sx={{ mb: 2 }}
                      >
                        Próxima data de interação com o cliente
                      </Typography>
                    )}
                  <TextField
                    required={field.required}
                    fullWidth
                    onChange={(e) =>
                      handleTextFieldChange(field, e.target.value, "datas")
                    }
                    name={field.field}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        fontSize: 14,
                        color: "text.secondary",
                        fontWeight: "bold",
                      },
                    }}
                    key={field.field}
                    label={field.label}
                    variant="outlined"
                    type={field.type}
                    disabled={field.disabled}
                    value={
                      field.type === "date"
                        ? getDateInputValue(
                            opportunity[
                              field.field as keyof Opportunity
                            ] as string
                          )
                        : value
                    }
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 0 },
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 1, borderRadius: 1, height: "100%" }}>
          <Typography
            variant="subtitle1"
            color="primary.main"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Venda
          </Typography>
          <Grid container gap={2} sx={{ mt: 1 }}>
            {fieldsMap?.get("venda")?.map((field) => {
              if (field.type === "autocomplete" && field.options) {
                return (
                  <Grid item xs={12} key={field.field}>
                    <Autocomplete
                      options={field.options}
                      getOptionLabel={(option) => option?.name || ""}
                      getOptionKey={(option) => option?.id || ""}
                      disabled={field.disabled}
                      aria-required={field.required}
                      slotProps={{
                        popper: { sx: { fontSize: 13 } },
                        paper: { sx: { fontSize: 13, borderRadius: 0 } },
                      }}
                      fullWidth
                      key={field.field}
                      aria-label={field.label}
                      value={field.options.find(
                        (option) =>
                          option.id ===
                          opportunity[field.field as keyof Opportunity]
                      )}
                      onChange={(_e, value) =>
                        handleAutocompleteChange(field.field, value, "venda")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputLabelProps={{
                            shrink: true,
                            sx: {
                              fontSize: 14,
                              color: "text.secondary",
                              fontWeight: "bold",
                            },
                          }}
                          InputProps={{
                            ...params.InputProps,
                            sx: { borderRadius: 0 },
                          }}
                          label={field.label}
                          variant="outlined"
                          required={field.required}
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                );
              }

              // Special handling for currency fields (number type)
              if (field.type === "number") {
                return (
                  <Grid item xs={12} key={field.field}>
                    <CurrencyInput
                      label={field.label}
                      value={
                        opportunity[field.field as keyof Opportunity] as
                          | number
                          | undefined
                      }
                      onChange={(value) =>
                        handleTextFieldChange(field, value, "venda")
                      }
                      name={field.field}
                      required={field.required}
                      disabled={field.disabled}
                    />
                  </Grid>
                );
              }

              return (
                <Grid item xs={12} key={field.field}>
                  <TextField
                    required={field.required}
                    fullWidth
                    onChange={(e) =>
                      handleTextFieldChange(field, e.target.value, "venda")
                    }
                    name={field.field}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        fontSize: 14,
                        color: "text.secondary",
                        fontWeight: "bold",
                      },
                    }}
                    key={field.field}
                    label={field.label}
                    variant="outlined"
                    type={field.type}
                    disabled={field.disabled}
                    value={opportunity[field.field as keyof Opportunity]}
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 0 },
                    }}
                  />
                </Grid>
              );
            })}
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              sx={{ width: "100%" }}
            >
              <Typography color="text.primary" fontWeight="bold" fontSize={16}>
                Valor Total:
              </Typography>
              <Typography color="green" fontWeight="bold" fontSize={16}>
                {formatCurrency(liveTotalValue)}
              </Typography>
              {user?.PERM_ADMINISTRADOR === 1 &&
                opportunity.status?.CODSTATUS === 11 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EmailIcon />}
                    onClick={handleResendSoldEmail}
                    disabled={resendingEmail}
                    sx={{ ml: "auto" }}
                  >
                    {resendingEmail ? "Enviando..." : "Reenviar e-mail"}
                  </Button>
                )}
            </Stack>
          </Grid>
        </Paper>
      </Grid>
      {verifyStatus() && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            mt: 1,
            borderRadius: 1,
            px: 2,
            gap: 2,
          }}
        >
          <Button onClick={() => saveOpp()} variant="contained">
            Salvar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDeletingOpp(opportunity)}
          >
            Excluir Proposta
          </Button>
        </Box>
      )}

      <BaseDeleteDialog
        open={Boolean(deletingOpp)}
        onConfirm={handleDelete}
        onCancel={() => setDeletingOpp(null)}
      ></BaseDeleteDialog>

      <Dialog open={finalizeConfirmOpen} onClose={() => setFinalizeConfirmOpen(false)}>
        <DialogTitle>Finalizar oportunidade</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Após finalizar a oportunidade, não será possível editá-la novamente. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizeConfirmOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => { setFinalizeConfirmOpen(false); confirmSaveOpp(); }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default OpportunityDetailedForm;
