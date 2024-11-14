// eslint-disable-next-line
// @ts-nocheck

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Mail, MailOpen, Search, RefreshCw, ChevronDown, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axiosInstance from '@/lib/axiosInstance'

interface Query {
  _id: string
  name: string
  email: string
  phone: string
  query: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface QueryResponse {
  queries: Query[]
}

type FilterType = 'all' | 'read' | 'unread'
type SortType = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc'


const fetchQueries = async (): Promise<QueryResponse> => {
  const response = await axiosInstance.get<QueryResponse>('/contact-us')
  return response.data
}

const QueryCard: React.FC<{ query: Query; isRead: boolean; onStatusChange: (id: string) => void }> = React.memo(
  ({ query, isRead, onStatusChange }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <Card className={`mb-4 ${isRead ? 'bg-gray-50' : 'bg-white'} transition-all duration-300 ease-in-out hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{query.name}</h3>
              <p className="text-sm text-gray-500">{query.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isRead ? "secondary" : "default"}>
                {isRead ? "Read" : "Unread"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStatusChange(query._id)}
                aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
              >
                {isRead ? <MailOpen size={20} /> : <Mail size={20} />}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>{query.query}</p>
            {query.query.length > 100 && (
              <Button variant="link" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Created: {format(parseISO(query.createdAt), 'PPp')}</span>
            <span>Updated: {format(parseISO(query.updatedAt), 'PPp')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }
)

QueryCard.displayName = 'QueryCard'

const QueryDashboard: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [readQueries, setReadQueries] = useState<Set<string>>(new Set())

  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['queries'],
    queryFn: fetchQueries,
  })

  const handleStatusChange = useCallback((id: string) => {
    setReadQueries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const filteredAndSortedQueries = useMemo(() => {
    let result = data?.queries.filter((query) => {
      const isRead = readQueries.has(query._id)
      const matchesFilter =
        filter === 'all' || (filter === 'read' && isRead) || (filter === 'unread' && !isRead)
      const matchesSearch =
        searchTerm === '' ||
        query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.query.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    }) || []

    switch (sort) {
      case 'newest':
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'oldest':
        return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'nameAsc':
        return result.sort((a, b) => a.name.localeCompare(b.name))
      case 'nameDesc':
        return result.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return result
    }
  }, [data?.queries, filter, searchTerm, sort, readQueries])

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="mr-2 h-16 w-16 animate-spin" />
    </div>
  )
  
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message}</p>
          <Button className="mt-4" onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Query Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAndSortedQueries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Queries</CardTitle>
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAndSortedQueries.filter(q => readQueries.has(q._id)).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Queries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAndSortedQueries.filter(q => !readQueries.has(q._id)).length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSort('newest')}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('oldest')}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('nameAsc')}>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('nameDesc')}>Name (Z-A)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh queries">
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <AnimatePresence>
          {filteredAndSortedQueries.map((query) => (
            <motion.div
              key={query._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QueryCard 
                query={query} 
                isRead={readQueries.has(query._id)}
                onStatusChange={handleStatusChange} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAndSortedQueries.length === 0 && (
          <div className="text-center py-10 text-gray-500">No queries found matching your criteria.</div>
        )}
      </ScrollArea>
    </div>
  )
}

const queryClient = new QueryClient()

export default function QueryDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryDashboard />
    </QueryClientProvider>
  )
}

