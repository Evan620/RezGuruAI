import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Analytics data (would be fetched from API in production)
const leadsBySourceData = [
  { name: 'Tax Delinquent', value: 85, color: '#8884d8' },
  { name: 'Probate', value: 45, color: '#82ca9d' },
  { name: 'Foreclosure', value: 37, color: '#ffc658' },
  { name: 'FSBO', value: 32, color: '#ff8042' },
  { name: 'Vacant Properties', value: 28, color: '#0088fe' },
  { name: 'Referral', value: 22, color: '#00C49F' },
];

const leadsByMotivationData = [
  { name: 'High (70-100)', value: 42, color: '#ff4d4f' },
  { name: 'Medium (40-69)', value: 68, color: '#faad14' },
  { name: 'Low (1-39)', value: 87, color: '#52c41a' },
];

const leadActivityData = [
  { name: 'Jan', leads: 24, contacts: 12, deals: 3 },
  { name: 'Feb', leads: 31, contacts: 18, deals: 4 },
  { name: 'Mar', leads: 27, contacts: 15, deals: 2 },
  { name: 'Apr', leads: 36, contacts: 22, deals: 5 },
  { name: 'May', leads: 42, contacts: 25, deals: 7 },
  { name: 'Jun', leads: 38, contacts: 20, deals: 4 },
  { name: 'Jul', leads: 35, contacts: 19, deals: 6 },
  { name: 'Aug', leads: 41, contacts: 23, deals: 5 },
  { name: 'Sep', leads: 47, contacts: 28, deals: 8 },
  { name: 'Oct', leads: 45, contacts: 26, deals: 7 },
  { name: 'Nov', leads: 52, contacts: 31, deals: 9 },
  { name: 'Dec', leads: 48, contacts: 29, deals: 8 },
];

const propertyTypeData = [
  { name: 'Single Family', value: 120, color: '#8884d8' },
  { name: 'Multi-Family', value: 65, color: '#82ca9d' },
  { name: 'Commercial', value: 35, color: '#ffc658' },
  { name: 'Land', value: 28, color: '#ff8042' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsSection() {
  const [timeframe, setTimeframe] = useState('year');
  
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={leadActivityData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="contacts" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="deals" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Leads by Source */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Leads by Source</CardTitle>
                <CardDescription>Distribution of leads by acquisition source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsBySourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsBySourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByMotivationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsByMotivationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} properties`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Property Value Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Property Value Distribution</CardTitle>
                <CardDescription>Value range of properties in your database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: '< $100K', count: 28 },
                        { range: '$100K-$200K', count: 45 },
                        { range: '$200K-$300K', count: 62 },
                        { range: '$300K-$500K', count: 48 },
                        { range: '$500K-$750K', count: 32 },
                        { range: '$750K+', count: 33 },
                      ]}
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Direct Mail', cost: 2500, revenue: 18500, roi: 640 },
                        { name: 'Facebook Ads', cost: 1800, revenue: 9200, roi: 411 },
                        { name: 'Google PPC', cost: 2200, revenue: 12600, roi: 472 },
                        { name: 'Bandit Signs', cost: 800, revenue: 5400, roi: 575 },
                        { name: 'Cold Calling', cost: 1500, revenue: 7800, roi: 420 },
                      ]}
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
              </CardContent>
            </Card>
            
            {/* Time to Close */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Time to Close</CardTitle>
                <CardDescription>Days from lead acquisition to deal closing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', days: 68 },
                        { month: 'Feb', days: 72 },
                        { month: 'Mar', days: 65 },
                        { month: 'Apr', days: 59 },
                        { month: 'May', days: 63 },
                        { month: 'Jun', days: 58 },
                        { month: 'Jul', days: 55 },
                        { month: 'Aug', days: 52 },
                        { month: 'Sep', days: 49 },
                        { month: 'Oct', days: 47 },
                        { month: 'Nov', days: 45 },
                        { month: 'Dec', days: 42 },
                      ]}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}