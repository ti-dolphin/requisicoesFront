import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import PatrimonyHomePage from "./pages/patrimonios/PatrimonyHomePage";
import RequisitionHomePage from "./pages/requisicoes/RequisitionHomePage";
import RequisitionDetailPage from "./pages/requisicoes/RequisitionDetailPage";
import QuoteDetailPage from "./pages/requisicoes/QuoteDetalPage";
import OpportunityHomePage from "./pages/oportunidades/OpportunityHomePage";
import OportunityDetailPage from "./pages/oportunidades/OpportunityDetailPage";
import PatrimonyDetailPage from "./pages/patrimonios/PatrimonyDetailPage";
import ChecklistListPage from "./pages/patrimonios/ChecklistListListPage";
import NotesHomePage from "./pages/apontamentos/NotesHomePage";
import AdminPage from "./pages/AdminPage";
import UserCreationPage from "./pages/admin/UserCreationPage";
import OrdemCompraHomePage from "./pages/ordensCompra/OrdemCompraHomePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminManagementHomePage from "./pages/admin/AdminManagementHomePage";
import ProjectManagementPage from "./pages/admin/ProjectManagementPage";
// Exemplo de páginas
const AppRoutes = () => { 
  return (
    <Routes>
      <Route path={ "/auth"} element={<AuthPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/perfil" element={<ProfilePage />} />

      <Route path="/admin" element={<AdminPage />} />
      <Route path="/gestao-adm" element={<AdminManagementHomePage />} />
      <Route path="/admin/usuarios" element={<UserManagementPage />} />
      <Route path="/admin/usuarios/novo" element={<UserCreationPage />} />
      <Route path="/admin/projetos" element={<ProjectManagementPage />} />

      <Route path="/requisicoes" element={<RequisitionHomePage />} />
      {/* <Route path="/requisicoes/lista" element={<RequisitionListPage />} /> */}
      <Route path="/requisicoes/:id_requisicao" element={<RequisitionDetailPage />} />
      <Route path="/requisicoes/:id/cotacao/:id_cotacao" element={<QuoteDetailPage />} />
      <Route path="/supplier/requisicoes/:id/cotacao/:id_cotacao" element={<QuoteDetailPage />} />
      {/* Patrimônios */}
      <Route path="/patrimonios" element={<PatrimonyHomePage />} />
      {/* <Route path="/patrimonios/lista" element={<PatrimonyListPage />} /> */}
      <Route path="/patrimonios/:id_patrimonio" element={<PatrimonyDetailPage />} />
      <Route path="/patrimonios/checklists" element={<ChecklistListPage />} />

      {/* Oportunidades */}
      <Route path="/oportunidades" element={<OpportunityHomePage />} />
      <Route path="/oportunidades/:CODOS" element={<OportunityDetailPage />} />
      {/* <Route path="/oportunidades/novo" element={<OpportunityCreationModal />} /> */}
      {/* <Route path="/oportunidades/form" element={<OpportunityForm />} /> */}

      {/* Apontamentos */}
      <Route path="/apontamentos" element={<NotesHomePage />} />

      {/* Ordem de Compra */}
      <Route path="/ordens-compra" element={<OrdemCompraHomePage />} />


    </Routes>
  );
};

export default AppRoutes;
