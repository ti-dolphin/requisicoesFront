
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RequisitionHome from './pages/requisitionHome/RequisitionHome';
import RequisitionDetail from "./pages/requisitionDetail/RequisitionDetail";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <RequisitionHome/>},
  { path : "/requisitionDetail/:id", element : <RequisitionDetail />}
]);
// eslint-disable-next-line react-refresh/only-export-components
export {router, RouterProvider}