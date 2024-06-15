import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContextProvider";
import Login from "../components/auth/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import Dashboard from "../components/dashboard/dashboard";
import Products from "../components/products/Products";
import Sales from "../components/Cashier/Cashier";
import Expense from "../components/Expense/Expense";
import OtherIncome from "../components/OtherIncome/OtherIncome";
import Customer from "../components/Customer/Customer";
import Supplier from "../components/Supplier/Supplier";
import SalesReport from "../components/SalesReport/SalesReport";
import Setting from "../components/setting/setting";
import Register from "../components/auth/Register";
import CreateCompany from "../components/CreateCompany/CreateCompany";
import Kitchen from  "../components/Kitchen/Kitchen";
import Inventory from "../components/Inventory/Inventory";
import Food from "../components/Food/Food"
import Table from "../components/Table/Table";
import Notification from "../components/Notification/Notification";
import Account from "../components/Account/Account";
import VoucherReport from "../components/VoucherReport/VoucherReport";
import ReportView from "../components/Report/ReportView";
import WasteProduct from "../components/WasteProduct/WasteProduct";

const Routes = () => {
  const { token } = useAuth();

  // Define routes accessible only to authenticated users

  let routes = [
    {
      path: '/',
      element: <Dashboard />
    },
    {
      path: '/createcompany',
      element: <CreateCompany />
    },
    {
      path : '/kitchen',
      element : <Kitchen />
    },
    {
      path : '/food',
      element : <Food/>
    },
    {
      path : '/table',
      element : <Table/>
    },
    {
      path : '/notification',
      element : <Notification/>
    },
    {
      path : '/accounts',
      element : <Account/>
    },
    {
      path: '/products',
      element: <Products />
    },
    {
      path: '/sales',
      element: <Sales />
    },
    {
      path: '/expense',
      element: <Expense />
    },
    {
      path: '/voucherreport',
      element: <VoucherReport />
    },
    {
      path: '/otherincome',
      element: <OtherIncome />
    }, {
      path: '/customer',
      element: <Customer />
    }, {
      path: '/supplier',
      element: <Supplier />
    }, {
      path: '/report',
      element: <ReportView />
    },
    {
      path: '/garbage',
      element: <WasteProduct />
    }, {
      path: '/settings',
      element: <Setting />
    }
  ];



  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      errorElement: <Navigate to="/" />,
      children: routes,
    },  
  ];

  const routesForPublic = [
    {
      path: "/dashboard",
      element: <Dashboard />,
      errorElement: <Navigate to="/dashboard" />
    },
    {
      path:'/register',
      element : <Register/>,
      errorElement: <Navigate to="/" />
    }
  ];


  // Combine and conditionally include routes based on authentication status
  const router =
    useMemo(() => (
      createBrowserRouter([
        ...routesForAuthenticatedOnly,
        ...routesForPublic,
      ])
    ), [token]);


  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;

