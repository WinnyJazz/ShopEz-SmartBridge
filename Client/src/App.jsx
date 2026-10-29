import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Catalogue from "./pages/Catalogue";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import ViewMyShop from "./pages/seller/ViewMyShop";
import PublicShop from "./pages/PublicShop";
import AuthExpiryWatcher from "./components/AuthExpiryWatcher";
import SellerOrders from "./pages/SellerOrders";
import OrderDetail from "./pages/OrderDetail";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthExpiryWatcher />

      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />

        <Route
          path="/signup"
          element={
            <MainLayout>
              <SignUp />
            </MainLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <MainLayout>
              <ShoppingCart />
            </MainLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <MainLayout>
              <Checkout />
            </MainLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <MainLayout>
              <ProductDetails />
            </MainLayout>
          }
        />

        <Route
          path="/catalogue"
          element={
            <MainLayout>
              <Catalogue />
            </MainLayout>
          }
        />

        <Route
          path="/favorites"
          element={
            <MainLayout>
              <Favorites />
            </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />

        <Route
          path="/seller/shop"
          element={
            <MainLayout>
              <ViewMyShop />
            </MainLayout>
          }
        />

        <Route
          path="/shop/:sellerId"
          element={
            <MainLayout>
              <PublicShop />
            </MainLayout>
          }
        />

        
        <Route
          path="/seller/orders"
          element={
            <MainLayout>
              <SellerOrders />
            </MainLayout>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <MainLayout>
              <OrderDetail />
            </MainLayout>
          }
        />


        

        
      </Routes>
    </BrowserRouter>
  );
}