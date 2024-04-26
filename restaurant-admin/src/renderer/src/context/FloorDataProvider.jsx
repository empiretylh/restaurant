import react, { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContextProvider'
import { useQuery } from 'react-query'
import { getFloor } from '../server/api'

const FloorDataContext = createContext()

const FloorDataProvider = ({ children }) => {
  const { token } = useAuth()

  const floor_data = useQuery(['floors'], getFloor, {
    enabled: !token
  })

  useEffect(() => {
    if (token) {
      floor_data.refetch()
    }
  }, [token])

  const data = useMemo(() => {
    if (floor_data.data) {
      return floor_data.data.data
    }
  }, [floor_data.data])

  return (
    <FloorDataContext.Provider value={{ floor_data, data }}>
      {children}
    </FloorDataContext.Provider>
  )
}

export const useFloorData = () => useContext(FloorDataContext)


export default FloorDataProvider
