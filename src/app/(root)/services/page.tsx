'use client';

import { useState } from 'react';
import { serviceCategories, emergencyServices } from '@/json/service-data';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search, Info } from 'lucide-react';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ServiceItem = ({ item, category }) => {
  const Icon = item.icon;
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <AspectRatio ratio={16 / 9} className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {item.details.map((detail, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  • {detail}
                </p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </AspectRatio>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardContent>
    </Card>
  );
};

const ServiceList = ({ category }) => {
  const Icon = category.icon;
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-2xl font-bold text-primary">
        <Icon className="w-8 h-8" />
        <span>{category.name}</span>
      </div>
      <p className="text-muted-foreground">{category.about}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.map((item, index) => (
          <ServiceItem key={index} item={item} category={category} />
        ))}
      </div>
    </div>
  );
};

const EmergencyServicesAccordion = () => {
  return (
    <Accordion
      type="single"
      defaultValue="emergency-services"
      className="w-full"
    >
      <AccordionItem value="emergency-services">
        <AccordionTrigger>
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertCircle />
            <span className="text-lg font-semibold">Emergency Services</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc pl-6 space-y-2">
            {emergencyServices.map((service, index) => (
              <li key={index} className="text-sm text-gray-700">
                {service}
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = serviceCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Comprehensive care for your health and well-being
            </p>
            <div className="max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search services..."
                className="w-full bg-white/10 border-white/20 text-white placeholder-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4 flex-grow overflow-auto">
          <Tabs defaultValue={filteredCategories[0]?.name} className="w-full">
            <TabsList className="mb-8 w-full justify-center flex-wrap">
              {filteredCategories.map((category, index) => (
                <TabsTrigger
                  key={index}
                  value={category.name}
                  onClick={() => setActiveCategory(category)}
                  className="px-4 py-2 m-1"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <category.icon className="w-5 h-5" />
                        <span className="hidden sm:inline">
                          {category.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredCategories.map((category, index) => (
              <TabsContent key={index} value={category.name}>
                <ServiceList category={category} />
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Emergency Services
            </h2>
            <EmergencyServicesAccordion />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
