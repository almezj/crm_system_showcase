import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/DashboardPage";
import OrdersPage from "../pages/orders/OrdersPage";
import SettingsPage from "../pages/SettingsPage";
import OrderDetailsPage from "../pages/orders/OrderDetailsPage";

import ProposalsPage from "../pages/proposals/ProposalsPage";
import ProposalDetailsPage from "../pages/proposals/ProposalDetailsPage";
import ManufacturersPage from "../pages/manufacturers/ManufacturersPage";
import ManufacturerDetailsPage from "../pages/manufacturers/ManufacturerDetailsPage";
import ProductsPage from "../pages/products/ProductsPage";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import PersonsPage from "../pages/persons/PersonsPage";
import PersonDetailsPage from "../pages/persons/PersonDetailsPage";
import AddPersonPage from "../pages/persons/AddPersonPage";
import EditPersonPage from "../pages/persons/EditPersonPage";
import RolesPage from "../pages/roles/RolesPage";
import AddRolePage from "../pages/roles/AddRolePage";
import EditRolePage from "../pages/roles/EditRolePage";
import UsersPage from "../pages/users/UsersPage";
import AdminCrossroadsPage from "../pages/AdminCrossroadsPage";
import AddManufacturerPage from "../pages/manufacturers/AddManufacturerPage";
import EditManufacturerPage from "../pages/manufacturers/EditManufacturerPage";
import RoutesPage from "../pages/routes/RoutesPage";
import RouteDetailsPage from "../pages/routes/RouteDetailsPage";
import PlanRoutePage from "../pages/routes/PlanRoutePage";
import AddUserPage from "../pages/users/AddUserPage";
import EditUserPage from "../pages/users/EditUserPage";
import AddProposalPage from "../pages/proposals/AddProposalPage";
import AddProductPage from "../pages/products/AddProductPage";
import EditProductPage from "../pages/products/EditProductPage";
import EditRoutePage from "../pages/routes/EditRoutePage";
import EditProposalPage from "../pages/proposals/EditProposalPage";
import MaterialsPage from "../pages/materials/MaterialsPage";
import MaterialDetailsPage from "../pages/materials/MaterialDetailsPage";
import EditMaterialPage from "../pages/materials/EditMaterialPage";
import AddMaterialPage from "../pages/materials/AddMaterialPage";
import PieceDetailsPage from "../pages/pieces/PieceDetailsPage";
import EditPiecePage from "../pages/pieces/EditPiecePage";
import AddPiecePage from "../pages/pieces/AddPiecePage";

const PrivateRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <AdminLayout>
              <OrdersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminLayout>
              <SettingsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <AdminLayout>
              <OrdersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <AdminLayout>
              <OrderDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/proposals"
          element={
            <AdminLayout>
              <ProposalsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/proposals/:id"
          element={
            <AdminLayout>
              <ProposalDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/proposals/add"
          element={
            <AdminLayout>
              <AddProposalPage />
            </AdminLayout>
          }
        />
        <Route
          path="/proposals/:id/edit"
          element={
            <AdminLayout>
              <EditProposalPage />
            </AdminLayout>
          }
        />
        <Route
          path="/manufacturers/add"
          element={
            <AdminLayout>
              <AddManufacturerPage />
            </AdminLayout>
          }
        />
        <Route
          path="/manufacturers/:id"
          element={
            <AdminLayout>
              <ManufacturerDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/manufacturers"
          element={
            <AdminLayout>
              <ManufacturersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/manufacturers/:id/edit"
          element={
            <AdminLayout>
              <EditManufacturerPage />
            </AdminLayout>
          }
        />
        <Route
          path="/products"
          element={
            <AdminLayout>
              <ProductsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/products/:id"
          element={
            <AdminLayout>
              <ProductDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/products/add"
          element={
            <AdminLayout>
              <AddProductPage />
            </AdminLayout>
          }
        />
        <Route
          path="/persons"
          element={
            <AdminLayout>
              <PersonsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/persons/:id"
          element={
            <AdminLayout>
              <PersonDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/persons/add"
          element={
            <AdminLayout>
              <AddPersonPage />
            </AdminLayout>
          }
        />
        <Route
          path="/persons/edit/:id"
          element={
            <AdminLayout>
              <EditPersonPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminCrossroadsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <AdminLayout>
              <RolesPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/roles/add"
          element={
            <AdminLayout>
              <AddRolePage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/roles/:id/edit"
          element={
            <AdminLayout>
              <EditRolePage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <UsersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/routes"
          element={
            <AdminLayout>
              <RoutesPage />
            </AdminLayout>
          }
        />
        <Route
          path="/routes/:id"
          element={
            <AdminLayout>
              <RouteDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/routes/:id/edit"
          element={
            <AdminLayout>
              <EditRoutePage />
            </AdminLayout>
          }
        />
        <Route
          path="/routes/plan"
          element={
            <AdminLayout>
              <PlanRoutePage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/add"
          element={
            <AdminLayout>
              <AddUserPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <AdminLayout>
              <EditUserPage />
            </AdminLayout>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <AdminLayout>
              <EditProductPage />
            </AdminLayout>
          }
        />
        <Route
          path="/materials"
          element={
            <AdminLayout>
              <MaterialsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/materials/add"
          element={
            <AdminLayout>
              <AddMaterialPage />
            </AdminLayout>
          }
        />
        <Route
          path="/materials/:id"
          element={
            <AdminLayout>
              <MaterialDetailsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/materials/:id/edit"
          element={
            <AdminLayout>
              <EditMaterialPage />
            </AdminLayout>
          }
        />
        <Route
          path="/pieces/add"
          element={
            <AdminLayout>
              <AddPiecePage />
            </AdminLayout>
          }
        />
        <Route
          path="/pieces/:id/edit"
          element={
            <AdminLayout>
              <EditPiecePage />
            </AdminLayout>
          }
        />
        <Route
          path="/pieces/:id"
          element={
            <AdminLayout>
              <PieceDetailsPage />
            </AdminLayout>
          }
        />
        <Route path="*" element={<AdminLayout><DashboardPage /></AdminLayout>} />
      </Routes>
    </ProtectedRoute>
  );
};

export default PrivateRoutes;
