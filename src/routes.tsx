
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RequisitionHome from "./Requisitions/pages/requisitionHome/RequisitionHome";
import RequisitionDetail from "./Requisitions/pages/requisitionDetail/RequisitionDetail";
import "./index.css";
import { ItemsContextProvider } from "./Requisitions/context/ItemsContext";
import SignIn from "./pages/login/SigIn";
import Home from "./pages/home/Home";
import PatrimonyHome from "./Patrimony/pages/PatrimonyHome";
import PatrimonyDetails from "./Patrimony/pages/PatrimonyDetails";
import PatrimonyChecklist from "./Patrimony/pages/PatrimonyChecklist";
import CrmHome from "./crm/pages/CrmHome";
import ChecklistTasks from "./Patrimony/pages/ChecklistTasks";
import OpportunityDetails from "./crm/pages/OpportunityDetails";
// import { ChecklistContextProvider } from "./Patrimony/context/checklistContext";

const router = createBrowserRouter([
  { path: "/", element: <SignIn /> },
  { path: "/home", element: <Home /> },
  { path: "/requisitions", element: <RequisitionHome /> },
  { path: "/patrimony", element: <PatrimonyHome /> },
  {
    path: "patrimony/checklist/:id_patrimonio",
    element: (
        <PatrimonyChecklist />
    ),
  },
  { path: "/patrimony/details/:id_patrimonio", element: <PatrimonyDetails /> },
  {
    path: "requisitions/requisitionDetail/:id",
    element: (
      <ItemsContextProvider>
        <RequisitionDetail />
      </ItemsContextProvider>
    ),
  },
  { 
    path: 'tasks',
    element: ( 
      <ChecklistTasks />
    )
  },
  { 
    path : '/crm',
    element: <CrmHome />
  },
  { 
    path: '/crm/opportunity/:opportunityId',
    element: <OpportunityDetails />
  }
]);
// eslint-disable-next-line react-refresh/only-export-components
export {router, RouterProvider}