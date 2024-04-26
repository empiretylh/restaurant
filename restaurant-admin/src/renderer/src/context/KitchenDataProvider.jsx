import react, { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContextProvider'
import { useQuery } from 'react-query'
import { getKitchen } from '../server/api'

const KitchenDataContext = createContext()

const KitchenDataProvider = ({ children }) => {
  const { token } = useAuth()

  const kitchen_data = useQuery(['kitchens'], getKitchen, {
    enabled: !token
  })

  useEffect(() => {
    if (token) {
      kitchen_data.refetch()
    }
  }, [token])

  const data = useMemo(() => {
    if (kitchen_data.data) {
      return kitchen_data.data.data
    }
  }, [kitchen_data.data])

  return (
    <KitchenDataContext.Provider value={{ kitchen_data, data }}>
      {children}
    </KitchenDataContext.Provider>
  )
}

export const useKitchen = () => useContext(KitchenDataContext)

export default KitchenDataProvider
