import { useState, useMemo } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  currentItems: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
}

export function usePagination<T>({
  items,
  itemsPerPage = 20,
  initialPage = 1
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextPage = () => {
    goToPage(currentPage + 1)
  }

  const previousPage = () => {
    goToPage(currentPage - 1)
  }

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    previousPage
  }
}
