
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RequisitionHome from './pages/requisitionHome/RequisitionHome';
import RequisitionDetail from "./pages/requisitionDetail/RequisitionDetail";
import "./index.css";
import { ItemsContextProvider } from "./context/ItemsContext";

const router = createBrowserRouter([
  { path: "/", element: <RequisitionHome/>},
  { path : "/requisitionDetail/:id", element : <ItemsContextProvider><RequisitionDetail /></ItemsContextProvider>
  }
]);
// eslint-disable-next-line react-refresh/only-export-components
export {router, RouterProvider}