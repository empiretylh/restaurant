import Versions from './components/Versions'
import icons from './assets/icons.svg'
import { QueryClient, QueryClientProvider } from 'react-query'
import AuthProvider from './context/AuthContextProvider'
import Routes from './route/route'
import axios from 'axios'
import { domainURL } from './config/config'
import './assets/i18n/i18n'
import 'bootstrap-icons/font/bootstrap-icons.css'
import ProductsDataProvider from './context/ProductsDataProvider'
import CategoryDataProvider from './context/CategoryDataProvider'
import AlertShowProvider from './components/custom_components/AlertProvider'
import CustomerDataProvider from './context/CustomerProvider'
import { CartContextProvider } from './components/Sales/CartContextProvier'
import ExpenseDataProvider from './context/ExpenseDataProvider'
import OtherIncomeDataProvider from './context/OtherIncomeDataProvider'
import SupplierDataProvider from './context/SupplierProvider'
import SettingDataProvider from './context/SettingContextProvider'
import CustomVoucherDataProvider from './context/CustomVoucherProvider'
import UserTypeContextProvider from './context/UserTypeProvider'
import KitchenDataProvider from './context/KitchenDataProvider'
import FoodDataProvider from './context/FoodDataProvider'
import FloorsDataProvider from './context/FloorDataProvider'
import FloorDataProvider from './context/FloorDataProvider'
import AccountsDataProvider from './context/AccountsContextProvider'
import CashOrderProvider from './context/CashOrderContextProvider'

axios.defaults.baseURL = localStorage.getItem('domain') || domainURL

const client = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={client}>
      <AlertShowProvider>
        <UserTypeContextProvider>
          <AuthProvider>
            <SettingDataProvider>
              <CategoryDataProvider>
                <FloorsDataProvider />
                <KitchenDataProvider>
                  <FloorDataProvider>
                    {/* <SupplierDataProvider> */}
                    <ProductsDataProvider>
                      <FoodDataProvider>
                        <AccountsDataProvider>
                          <CashOrderProvider>

                            {/*   <ExpenseDataProvider> */}
                            {/*     <OtherIncomeDataProvider> */}
                            {/*       <CustomerDataProvider> */}
                            {/*         <CartContextProvider> */}
                            {/*           <CustomVoucherDataProvider> */}
                            <Routes />
                            {/*           </CustomVoucherDataProvider> */}
                            {/*         </CartContextProvider> */}
                            {/*       </CustomerDataProvider> */}
                            {/*     </OtherIncomeDataProvider> */}
                            {/*   </ExpenseDataProvider> */}

                          </CashOrderProvider>
                        </AccountsDataProvider>

                      </FoodDataProvider>
                    </ProductsDataProvider>
                    {/* </SupplierDataProvider> */}
                  </FloorDataProvider >
                </KitchenDataProvider>
                <FloorsDataProvider />
              </CategoryDataProvider>
            </SettingDataProvider>
          </AuthProvider>
        </UserTypeContextProvider>
      </AlertShowProvider>
    </QueryClientProvider>
  )
}

export default App
