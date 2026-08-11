import { Autocomplete, AutocompleteRenderInputParams, Box, Button, Checkbox, Grid, Stack, TextField, Typography } from '@mui/material'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useProjectOptions } from '../../hooks/projectOptionsHook';
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import useOppStatusOptions from '../../hooks/oportunidades/useOppStatusOptions';
import OpportunityService, { SimilarOpportunity } from '../../services/oportunidades/OpportunityService';
import { useNavigate } from 'react-router-dom';
import { Opportunity } from '../../models/oportunidades/Opportunity';
import { setFeedback } from '../../redux/slices/feedBackSlice';
import { setCreating, setOpportunity, updateOpportunityFields } from '../../redux/slices/oportunidades/opportunitySlice';
import { ProjectService } from '../../services/ProjectService';
import { useClientOptions } from '../../hooks/oportunidades/useClientOptions';
import { useComercialResponsableOptions } from '../../hooks/oportunidades/useComercialResponsableOptions';
import { useOpportunityMandatoryFields } from '../../hooks/oportunidades/useOpportunityMandatoryFields';
import { formatDateStringtoISOstring } from '../../utils';
import OptionsField from '../shared/ui/OptionsField';
import ElegantInput from '../shared/ui/Input';
import SimilarOpportunitiesModal from './SimilarOpportunitiesModal';


const OpportunityForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const opportunity = useSelector((state: RootState) => state.opportunity.opportunity);
    const user = useSelector((state: RootState) => state.user.user);
  
    const [isAdicional, setIsAdicional] = useState(false);
    const [similarOpportunities, setSimilarOpportunities] = useState<SimilarOpportunity[]>([]);
    const [showSimilarModal, setShowSimilarModal] = useState(false);
    const [codosOriginal, setCodosOriginal] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const { projectOptions } = useProjectOptions();
    const {oppStatusOptions} = useOppStatusOptions();
    const { clientOptions } = useClientOptions();
    const {comercialResponsableOptions} = useComercialResponsableOptions();
    const { fields } = useOpportunityMandatoryFields(
      projectOptions,
      oppStatusOptions,
      clientOptions,
      comercialResponsableOptions
    );

    // Busca propostas semelhantes com debounce pelo nome
    const searchSimilarOpportunities = useCallback(async () => {
      
      if (isAdicional) return

      if (!opportunity?.NOME) {
        setSimilarOpportunities([]);
        return;
      }

      const searchTerm = opportunity.NOME.trim();
      if (searchTerm.length < 3) {
        setSimilarOpportunities([]);
        return;
      }

      try {
        const similars = await OpportunityService.getSimilarOpportunities(
          searchTerm
        );
        setSimilarOpportunities(similars);
      } catch (error) {
        console.error('Erro ao buscar propostas semelhantes:', error);
        setSimilarOpportunities([]);
      }
    }, [opportunity?.NOME]);

    // Effect para buscar propostas semelhantes com debounce de 400ms
    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchSimilarOpportunities();
      }, 400);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [searchSimilarOpportunities]);

    const projectId = opportunity?.ID_PROJETO;
    useEffect(() => {
      if (!isAdicional || !projectId) return;

      let cancelled = false;

      const fillClientFromProject = async () => {
        try {
          const client = await ProjectService.getClient(Number(projectId));
          if (cancelled) return;
          if (!client) {
            dispatch(setFeedback({
              message: 'Não foi possível identificar o cliente do projeto. Selecione manualmente.',
              type: 'error',
            }));
            return;
          }
          dispatch(updateOpportunityFields({ FK_CODCLIENTE: client.CODCLIENTE }));
        } catch (error) {
          if (cancelled) return;
          dispatch(setFeedback({
            message: 'Erro ao buscar o cliente do projeto',
            type: 'error',
          }));
          console.error(error);
        }
      };

      fillClientFromProject();

      return () => {
        cancelled = true;
      };
    }, [isAdicional, projectId, dispatch]);

    const handleChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      dispatch(setOpportunity({ ...opportunity, [name]: value }));
    }

    const handleChangeAutocomplete = (name: string, optionId: number | string) => {
      dispatch(setOpportunity({ ...opportunity, [name]: optionId }));
    }

    const buildPayload = () => {
      return {
        NOME: opportunity?.NOME,
        ID_PROJETO: isAdicional ? opportunity?.ID_PROJETO : null,
        CODSTATUS: opportunity?.CODSTATUS,
        DATASOLICITACAO: opportunity?.DATASOLICITACAO
          ? formatDateStringtoISOstring(opportunity.DATASOLICITACAO)
          : null,
        DATAENTREGA: opportunity?.DATAENTREGA
          ? formatDateStringtoISOstring(opportunity.DATAENTREGA)
          : null,
        DATAINICIO: opportunity?.DATAINICIO
          ? formatDateStringtoISOstring(opportunity.DATAINICIO)
          : null,
        FK_CODCLIENTE: opportunity?.FK_CODCLIENTE,
        FK_CODCOLIGADAL: opportunity?.FK_CODCOLIGADA,
        RESPONSAVEL: opportunity?.RESPONSAVEL || user?.CODPESSOA,
        CODOS_ORIGINAL: codosOriginal,
      };
    };

    const createOpportunity = async (payload: ReturnType<typeof buildPayload>) => {
      setIsSubmitting(true);
      if (
        !payload.CODSTATUS ||
        !payload.NOME ||
        !payload.RESPONSAVEL ||
        !payload.FK_CODCLIENTE
      ) {
        dispatch(setFeedback({ message: 'Preencha todos os campos obrigatórios', type: 'error' }));
        setIsSubmitting(false);
        return;
      }
      try {
        const createOpp: Opportunity = await OpportunityService.create(payload, { isAdicional });
        dispatch(setOpportunity(null));
        dispatch(setCreating(false));
        navigate(`/oportunidades/${createOpp.CODOS}`);
      } catch (error) {
        dispatch(setFeedback({ message: 'Erro ao criar oportunidade', type: 'error' }));
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Se tem propostas semelhantes, mostrar modal primeiro
      if (similarOpportunities.length > 0 && !codosOriginal) {
        setShowSimilarModal(true);
        return;
      }

      await createOpportunity(buildPayload());
    };

    const handleCreateNew = async () => {
      setShowSimilarModal(false);
      await createOpportunity(buildPayload());
    };

    const handleLinkTo = async (codos: number) => {
      setCodosOriginal(codos);
      setShowSimilarModal(false);
      const payload = {
        ...buildPayload(),
        CODOS_ORIGINAL: codos,
      };
      await createOpportunity(payload);
    };

    const handleCloseSimilarModal = () => {
      setShowSimilarModal(false);
    };

    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Stack direction="row" alignItems="center">
          <Checkbox
            onChange={(e) => setIsAdicional(e.target.checked)}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
          />
          <Typography fontSize="small" fontWeight="bold" color="text.secondary">
            Adicional
          </Typography>
        </Stack>
        {projectOptions.length > 0 && oppStatusOptions.length > 0 && (
          <Grid
            container
            sx={{
              gap: 1,
              maxHeight: 300,
              dislplay: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap'
            }}
          >
            {fields.map((field, index) => {
              if (field.type === "autocomplete") {
                if (!field.options) return null;
                if (field.field === "ID_PROJETO" && !isAdicional) return null;
                return (
                  <Grid item xs={12} sm={8} key={index}>
                    <OptionsField
                      required={field.required}
                      label={field.label}
                      options={field.options}
                      optionHeight={field.field === 'FK_CODCLIENTE' ? 60 : 30}
                      value={
                        opportunity
                          ? String(
                              opportunity[field.field as keyof Opportunity]
                            )
                          : ""
                      }
                      onChange={(optionId) =>  {
                        handleChangeAutocomplete(field.field, optionId)}
                      }
                    />
                  </Grid>
                );
              }
              return (
                <Grid item xs={12} sm={6} key={index}>
                  <ElegantInput 
                  value={field.value}
                  onChange={handleChangeTextField}
                  name={field.field}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  disabled={field.disabled}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>

        {/* Modal de propostas semelhantes */}
        <SimilarOpportunitiesModal
          open={showSimilarModal}
          opportunities={similarOpportunities}
          onClose={handleCloseSimilarModal}
          onCreateNew={handleCreateNew}
          onLinkTo={handleLinkTo}
        />
      </Box>
    );
}

export default OpportunityForm