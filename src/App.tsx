import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import PageNotFound from "./pages/404";
import Checkout from "./pages/Checkout";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoryAdmin from "./pages/admin/CategoryAdmin";
import CreateProduct from "./pages/admin/CreateProduct";
import EditHome from "./pages/admin/EditHome";
import ProductsList from "./pages/admin/ProductsList";
import OrdersList from "./pages/admin/OrdersList";
import OrderDetails from "./pages/admin/OrderDetails";

// Лейаут для звичайних користувацьких сторінок з Header та Footer
function MainLayout() {
  return (
    <>
      <Header/>
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публічні сторінки */}
        <Route element={<MainLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/404" element={<PageNotFound />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Адмін панель без Header/Footer */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="productsList" element={<ProductsList />} />
          <Route path="productsCreate" element={<CreateProduct />} />
          <Route path="ordersList" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="categoriesAdmin" element={<CategoryAdmin />} />
          <Route path="homeEdit" element={<EditHome />} />
        </Route>

        {/* Всі інші шляхи → 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}