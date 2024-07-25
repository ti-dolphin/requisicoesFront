
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RequisitionHome from './pages/requisitionHome/RequisitionHome';
import RequisitionDetail from "./pages/requisitionDetail/RequisitionDetail";
import "./index.css";
import { ItemsContextProvider } from "./context/ItemsContext";
import SignIn from "./pages/login/SigIn";
import Home from "./pages/home/Home";

const router = createBrowserRouter([

  { path: "/", element: <SignIn />},
  { path: "/home", element: <Home />},
  { path: "/requisitions", element: <RequisitionHome/>},
  {
    path: "requisitions/requisitionDetail/:id", element : <ItemsContextProvider><RequisitionDetail /></ItemsContextProvider>
  }
]);
// eslint-disable-next-line react-refresh/only-export-components
export {router, RouterProvider}