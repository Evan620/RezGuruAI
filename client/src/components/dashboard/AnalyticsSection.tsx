import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsSection() {
  const [timeframe, setTimeframe] = useState('year');

  const { data: leadSourcesData, isLoading: isLoadingLeadSources } = useQuery({
    queryKey: ['analytics', 'lead-sources', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/lead-sources?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: leadActivityData, isLoading: isLoadingLeadActivity } = useQuery({
    queryKey: ['analytics', 'lead-activity', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/lead-activity?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: propertyTypesData, isLoading: isLoadingPropertyTypes } = useQuery({
    queryKey: ['analytics', 'property-types', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/property-types?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['analytics', 'revenue', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/revenue?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: roiData, isLoading: isLoadingRoi } = useQuery({
    queryKey: ['analytics', 'roi', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/roi?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: timeToCloseData, isLoading: isLoadingTimeToClose } = useQuery({
    queryKey: ['analytics', 'time-to-close', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/time-to-close?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: leadMotivationData, isLoading: isLoadingLeadMotivation } = useQuery({
    queryKey: ['analytics', 'lead-motivation', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/lead-motivation?timeframe=${timeframe}`);
      return data;
    }
  });

  const { data: propertyValueDistributionData, isLoading: isLoadingPropertyValueDistribution } = useQuery({
    queryKey: ['analytics', 'property-value-distribution', timeframe],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/property-value-distribution?timeframe=${timeframe}`);
      return data;
    }
  });


  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Analytics & Reporting</h2>
        <Select 
          value={timeframe}
          onValueChange={setTimeframe}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="properties">Property Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Activity Over Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lead Activity</CardTitle>
                <CardDescription>New leads, contacts and deals over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeadActivity ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={leadActivityData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="contacts" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="deals" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leads by Source */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Leads by Source</CardTitle>
                <CardDescription>Distribution of leads by acquisition source</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeadSources ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Array.isArray(leadSourcesData?.data) ? leadSourcesData.data : []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Array.isArray(leadSourcesData?.data) ? leadSourcesData.data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          )) : null}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leads by Motivation Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Leads by Motivation Score</CardTitle>
                <CardDescription>AI-assessed lead motivation distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeadMotivation ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadMotivationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          { (leadMotivationData || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Conversion Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lead Conversion Funnel</CardTitle>
                <CardDescription>Lead to deal conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'New Leads', value: 248 },
                        { name: 'Contacted', value: 153 },
                        { name: 'Meetings', value: 86 },
                        { name: 'Offers Made', value: 62 },
                        { name: 'Deals Closed', value: 37 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Types */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Property Types</CardTitle>
                <CardDescription>Distribution of property types in your database</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPropertyTypes ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyTypesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(propertyTypesData || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} properties`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Value Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Property Value Distribution</CardTitle>
                <CardDescription>Value range of properties in your database</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPropertyValueDistribution ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={propertyValueDistributionData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Properties" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ROI Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Campaign ROI Analysis</CardTitle>
                <CardDescription>Return on investment by marketing channel</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRoi ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={roiData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'roi') return [`${value}%`, 'ROI'];
                          return [`$${value}`, name === 'cost' ? 'Cost' : 'Revenue'];
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="cost" name="Cost" fill="#8884d8" />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#82ca9d" />
                        <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#ff7300" name="ROI %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time to Close */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Time to Close</CardTitle>
                <CardDescription>Days from lead acquisition to deal closing</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTimeToClose ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeToCloseData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} days`, 'Avg. Time to Close']} />
                        <Legend />
                        <Line type="monotone" dataKey="days" stroke="#8884d8" activeDot={{ r: 8 }} name="Avg. Days" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}