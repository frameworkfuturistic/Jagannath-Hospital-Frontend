'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  query: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
};

type SortConfig = {
  key: keyof Contact;
  direction: 'ascending' | 'descending';
};

export default function AdvancedDoctorDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'descending',
  });

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const response = await axiosInstance.get('/contact-us');

        // Use the response data if it's an array
        if (Array.isArray(response.data)) {
          setContacts(response.data);
        } else {
          console.warn('Unexpected API format, received non-array data');
          setContacts([]);
        }
      } catch (error) {
        console.error('Error fetching contact data from API:', error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleSort = (key: keyof Contact) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.query.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus.length === 0 || filterStatus.includes(contact.status);

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchTerm, filterStatus]);

  const sortedContacts = useMemo(() => {
    const sortableItems = [...filteredContacts];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredContacts, sortConfig]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">New</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Statistics Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-400 to-indigo-600 text-white transform hover:scale-[1.02] transition-transform duration-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Total Queries</CardTitle>
            <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-xs">📩</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contacts.length}</div>
            <p className="text-sm text-purple-200">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-400 to-rose-600 text-white transform hover:scale-[1.02] transition-transform duration-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">New Queries</CardTitle>
            <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center">
              <span className="text-xs">🆕</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contacts.filter((c) => c.status === 'new').length}
            </div>
            <p className="text-sm text-pink-200">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-400 to-amber-600 text-white transform hover:scale-[1.02] transition-transform duration-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">In Progress</CardTitle>
            <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-xs">⏳</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contacts.filter((c) => c.status === 'in-progress').length}
            </div>
            <p className="text-sm text-orange-200">-2 from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-emerald-600 text-white transform hover:scale-[1.02] transition-transform duration-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Resolved</CardTitle>
            <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-xs">✅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contacts.filter((c) => c.status === 'resolved').length}
            </div>
            <p className="text-sm text-green-200">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Us Table */}
      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-lg font-medium">Queries</CardTitle>
                <CardDescription>Manage and respond inquiries</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search queries..."
                    className="pl-9 w-[180px] md:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sortedContacts.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <div className="relative overflow-auto max-h-[500px]">
                  <Table className="min-w-[800px] md:min-w-full">
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            {sortConfig.key === 'name' &&
                              (sortConfig.direction === 'ascending' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            Email
                            {sortConfig.key === 'email' &&
                              (sortConfig.direction === 'ascending' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Query</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortConfig.key === 'status' &&
                              (sortConfig.direction === 'ascending' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Date
                            {sortConfig.key === 'createdAt' &&
                              (sortConfig.direction === 'ascending' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedContacts.map((contact) => (
                        <TableRow
                          key={contact._id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {contact.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contact.email}
                          </TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {contact.query}
                          </TableCell>
                          <TableCell>{getStatusBadge('new')}</TableCell>

                          <TableCell className="text-muted-foreground">
                            {formatDate(contact.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Search className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  No queries found
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterStatus.length > 0
                    ? 'Try adjusting your search or filter criteria'
                    : 'No patient queries have been submitted yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
