
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ShoppingCart from "./pages/ShoppingCart";
import ProductDetails from "./pages/ProductDetails";
import Catalogue from "./pages/Catalogue";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import ViewMyShop from "./pages/seller/ViewMyShop";

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
               <ViewMyShop  />
            </MainLayout>
        } 
        />
      </Routes>
    </BrowserRouter>
  );
}
