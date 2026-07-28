import { useCallback, useEffect, useRef, useState } from "react";
import { Requisition } from "../../models/requisicoes/Requisition";
import { User } from "../../models/User";
import RequisitionStatusService from "../../services/requisicoes/RequisitionStatusService";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { permission } from "process";

export interface RequisitionStatusPermissions{ 
    permissionToChangeStatus: boolean;
    permissionToRevertStatus: boolean;
}

export const useRequisitionStatusPermissions = (user: User | null, requisition: Requisition ) => { 
    const dispatch = useDispatch();
    const [permissionToChangeStatus, setPermissionToChangeStatus] = useState<boolean>(false);
    const [permissionToCancel, setPermissionToCancel] = useState<boolean>(false);
    const [permissionToActivate, setPermissionToActivate] = useState<boolean>(false);
    const [permissionToRevertStatus, setPermissionToRevertStatus] = useState<boolean>(false);

    const requisitionRef = useRef(requisition);
    useEffect(() => {
      requisitionRef.current = requisition;
    }, [requisition]);

    const fetchPermission = useCallback(async () => {
      const requisition = requisitionRef.current;
      setPermissionToCancel(false);
      setPermissionToActivate(false);
      setPermissionToChangeStatus(false);
      setPermissionToRevertStatus(false);
      const admOrBuyer = user?.PERM_ADMINISTRADOR === 1 || user?.PERM_COMPRADOR === 1;
      const notCancelled = requisition.status?.nome !== "Cancelado";
      const cancelled = requisition.status?.nome === "Cancelado";
      const stockUser = requisition.id_escopo_requisicao === 1 && user?.PERM_ESTOQUE === 1;
      const gerente = requisition.gerente?.CODPESSOA === user?.CODPESSOA;
      const director = user?.PERM_DIRETOR === 1;

      if(admOrBuyer && cancelled) { 
        setPermissionToActivate(true);
      }

      if ((admOrBuyer || gerente || director) && notCancelled) {
        setPermissionToCancel(true);
      }
      if (user && requisition.ID_REQUISICAO > 0) {
        setPermissionToChangeStatus(false)
        try {
          const permissions = await RequisitionStatusService.getStatusPermissions(
          user,
          requisition
          );
          setPermissionToChangeStatus(permissions.permissionToChangeStatus);
          setPermissionToRevertStatus(permissions.permissionToRevertStatus);
              if (stockUser) {
                setPermissionToChangeStatus(true);
              }
              if (director && requisition.status?.nome?.toLowerCase() === 'validação') {
                setPermissionToChangeStatus(true);
              }
        } catch (error: any) {
          dispatch(
          setFeedback({
            message: `Erro ao verificar permissões no status: ${error.message} `,
            type: "error",
          })
          );
        }
      }
    }, [
      user,
      requisition.ID_REQUISICAO,
      requisition.id_status_requisicao,
      requisition.status?.nome,
      requisition.id_escopo_requisicao,
      requisition.gerente?.CODPESSOA,
      requisition.responsavel?.CODPESSOA,
      requisition.projeto?.ID_RESPONSAVEL,
    ]);

    //useEffect
    useEffect(() => { 
        fetchPermission();
    }, [fetchPermission]);

    return {
      permissionToChangeStatus,
      permissionToCancel,
      permissionToActivate,
      permissionToRevertStatus,
    };

};


