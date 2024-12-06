'use client'

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axiosInstance from '@/lib/axiosInstance';

interface Query {
  _id: string;
  name: string;
  email: string;
  phone: string;
  query: string;
  createdAt: string;
  updatedAt: string;
}

const fetchQueries = async (): Promise<Query[]> => {
  const response = await axiosInstance.get('/contact-us');
  return response.data;
};

const QueryDashboard: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getQueries = async () => {
      try {
        setLoading(true);
        const data = await fetchQueries();
        setQueries(data);
      } catch (err) {
        setError('Failed to load queries.');
      } finally {
        setLoading(false);
      }
    };
    getQueries();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Query Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queries.map((query) => (
          <div key={query._id} className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">{query.name}</h2>
            <p className="text-gray-600 text-sm">{query.email}</p>
            <p className="mt-2 text-gray-700">{query.query}</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Created: {format(parseISO(query.createdAt), 'PPp')}</p>
              <p>Updated: {format(parseISO(query.updatedAt), 'PPp')}</p>
            </div>
          </div>
        ))}
      </div>
      {queries.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No queries available.</div>
      )}
    </div>
  );
};

export default QueryDashboard;
