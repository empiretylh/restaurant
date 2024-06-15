import { useContext, useEffect, useState } from 'react'
import Login from './screens/Login'
import KitchenLogin from './screens/KitchenLogin'

import axios from 'axios';
import { API } from './server/config';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { IMAGE } from './assets/image';
import { QueryClient, QueryClientProvider } from 'react-query';
import Waiter from './screens/Waiter';
import Kitchen from './screens/Kitchen'
import { AuthContext, AuthProvider } from './context/AuthProvider';
import KitchenDataProvider from './context/KitchenDataProvider';
import FloorDataProvider from './context/FloorDataProvider';
import FoodDataProvider from './context/FoodDataProvider';
import 'bootstrap-icons/font/bootstrap-icons.css'
import CategoryDataProvider from './context/CategoryDataProvider';
import ProductsDataProvider from './context/ProductsDataProvider';
import ProfileDataProvider from './context/ProfileDataProvider';

import { initWebSocket } from './websocket';
import AlertShowProvider from './screens/component/AlertProvider';

axios.defaults.baseURL = API;

const queryClient = new QueryClient();

function App() {

  const { token, setToken, loading, setLoading,setIsWaiter,isWaiter } = useContext(AuthContext);

  if (loading) {
    return <div className='w-full bg-gray-400 h-screen flex items-center justify-center flex-col gap-2 text-black font-mono'>
      <img src={IMAGE.waiter} alt='loading' style={{ width: 100, height: 100 }} />
      <h1 className='text-2xl'>Loading...</h1>
    </div>
  }

  return (
    <QueryClientProvider client={queryClient}>
     <ProfileDataProvider>
       <AlertShowProvider>
        
      <CategoryDataProvider>
        <ProductsDataProvider>
          <KitchenDataProvider>
            <FloorDataProvider>
              <FoodDataProvider>
                <BrowserRouter>
                  <Routes>
                    {token == null ? <>
                      <Route path='/' element={<Login />} />
                      <Route path='/kitchen/' element={<KitchenLogin />} />

                    </> :
                      <>
                       <Route path='/' element={<Waiter />} /> 
                       <Route path='/kitchen/' element={<Kitchen />} />

                     
                        <Route path='/login' element={<Login />} />
                      </>
                    }

                  </Routes>
                </BrowserRouter>
              </FoodDataProvider>
            </FloorDataProvider>
          </KitchenDataProvider>
        </ProductsDataProvider>

      </CategoryDataProvider>

       </AlertShowProvider>
     </ProfileDataProvider>

    </QueryClientProvider>
  )
}


const Main = () => {
  return (
    <AuthProvider>

      <App />

    </AuthProvider>)
}
export default Main;
