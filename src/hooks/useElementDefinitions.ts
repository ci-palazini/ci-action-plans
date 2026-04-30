import { useQuery } from '@tanstack/react-query'
import { getElementDefinitions } from '../services/masterService'

export function useElementDefinitions() {
  return useQuery({
    queryKey: ['element-definitions'],
    queryFn: getElementDefinitions,
    staleTime: Infinity,
  })
}
