"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function AdvancedDoctorDashboard() {
  const [contacts, setContacts] = useState<
    { name: string; email: string; phone: string; query: string }[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/contact-us");
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setContacts(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
          setContacts([]);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Statistics Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-400 to-indigo-600 text-white transform hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">33</div>
            <p className="text-sm text-purple-200">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-400 to-rose-600 text-white transform hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-sm text-pink-200">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-400 to-amber-600 text-white transform hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-orange-200">-2m from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-emerald-600 text-white transform hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98%</div>
            <p className="text-sm text-green-200">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Us Table */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Contact Us Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
              </div>
            ) : contacts && contacts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Query</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.query}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-8">No contacts found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
