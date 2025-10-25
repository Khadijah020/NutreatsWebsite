import React from 'react'
import Navbar from './components/Navbar.jsx'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer.jsx'
import { useAppContext } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import AllProducts from './pages/AllProducts.jsx'
import ProductCategory from './pages/ProductCategory.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import AddAddress from './pages/AddAddress.jsx'
import MyOrders from './pages/MyOrders.jsx'
import SellerLogin from './components/seller/SellerLogin.jsx'
import SellerLayout from './pages/seller/SellerLayout.jsx'
import AddProduct from './pages/seller/AddProduct.jsx'
import Orders from './pages/seller/Orders.jsx'
import ProductList from './pages/seller/ProductList.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import AnnouncementBanner from './components/AnnouncementBanner.jsx'
import EditProductDetails from './pages/seller/EditProductDetails.jsx'
import OrderDetails from './pages/seller/OrderDetails.jsx'
import CategoryManagement from './pages/seller/CategoryManagement'
import CreateBill from './pages/seller/CreateBill'
import Customers from './pages/seller/Customers.jsx'
import CustomerDetails from './pages/seller/CustomerDetails.jsx'

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller} = useAppContext()
  return (
    <div className='text-default min-h-screen text-gray-700 bg-[#e6dbcee0]'>
      {isSellerPath ? null : <Navbar/>}
      {isSellerPath ? null : <AnnouncementBanner/>}
      {showUserLogin ? <Login/> : null}
      <Toaster />
    <div className={isSellerPath ? "" : "x-6 md:px-16 lg:px-24 xl:px-16"}>
      <ScrollToTop />
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/products' element={<AllProducts/>}/>
      <Route path='/products/:category' element={<ProductCategory/>}/>
      <Route path='/products/:category/:id' element={<ProductDetails/>}/>
      <Route path='/seller/edit-product/:id' element={<EditProductDetails/>}/>
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/add-address' element={<AddAddress/>}/>
      <Route path='/my-orders' element={<MyOrders/>}/>
      <Route path='/seller' element={ isSeller? <SellerLayout/> : <SellerLogin/>}>
        <Route index element={isSeller ? <Customers/> : null } />
        <Route path='product-list' element={<ProductList/>} />
        <Route path='orders' element={<Orders/>} />
        <Route path='orders/:id' element={<OrderDetails />} />
        <Route path='add-product' element={<AddProduct />} />
        <Route path='customers/:id' element={<CustomerDetails />} />
        <Route path='category' element={<CategoryManagement />} />
        <Route path='create-bill' element={<CreateBill />} />
      </Route>

    </Routes>
    </div>
   { !isSellerPath && <Footer/>}
    </div>
  )
}

export default App