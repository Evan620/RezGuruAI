import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Calendar, ChevronDown, Download, FileDown, Filter, MoreHorizontal, 
  RefreshCw, Share2, TrendingUp, HelpCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const marketTrendsData = [
  { month: 'Jan', marketValue: 250000, yourAvg: 228000 },
  { month: 'Feb', marketValue: 255000, yourAvg: 231000 },
  { month: 'Mar', marketValue: 252000, yourAvg: 235000 },
  { month: 'Apr', marketValue: 258000, yourAvg: 239000 },
  { month: 'May', marketValue: 262000, yourAvg: 242000 },
  { month: 'Jun', marketValue: 265000, yourAvg: 246000 },
  { month: 'Jul', marketValue: 268000, yourAvg: 250000 },
  { month: 'Aug', marketValue: 271000, yourAvg: 253000 },
  { month: 'Sep', marketValue: 275000, yourAvg: 258000 },
  { month: 'Oct', marketValue: 280000, yourAvg: 264000 },
  { month: 'Nov', marketValue: 282000, yourAvg: 268000 },
  { month: 'Dec', marketValue: 285000, yourAvg: 271000 },
];

const scrapeSuccessRateData = [
  { month: 'Jan', rate: 92 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 94 },
  { month: 'Apr', rate: 91 },
  { month: 'May', rate: 95 },
  { month: 'Jun', rate: 96 },
  { month: 'Jul', rate: 97 },
  { month: 'Aug', rate: 94 },
  { month: 'Sep', rate: 93 },
  { month: 'Oct', rate: 97 },
  { month: 'Nov', rate: 98 },
  { month: 'Dec', rate: 96 },
];

const aiScoreAccuracyData = [
  { name: 'Activity Level', accuracy: 92 },
  { name: 'Financial Distress', accuracy: 86 },
  { name: 'Time Pressure', accuracy: 78 },
  { name: 'Property Condition', accuracy: 84 },
  { name: 'Market Knowledge', accuracy: 74 },
  { name: 'Motivation', accuracy: 88 },
];

const documentUsageData = [
  { name: 'Purchase Offer', count: 87 },
  { name: 'Follow-up Letter', count: 124 },
  { name: 'Initial Contact', count: 156 },
  { name: 'Property Assessment', count: 42 },
  { name: 'Contract Amendment', count: 31 },
  { name: 'Closing Checklist', count: 28 },
];

const revenueData = [
  { month: 'Jan', revenue: 42500, profit: 15200, cost: 27300 },
  { month: 'Feb', revenue: 48000, profit: 18300, cost: 29700 },
  { month: 'Mar', revenue: 45200, profit: 16800, cost: 28400 },
  { month: 'Apr', revenue: 59000, profit: 23500, cost: 35500 },
  { month: 'May', revenue: 68000, profit: 28600, cost: 39400 },
  { month: 'Jun', revenue: 57000, profit: 22100, cost: 34900 },
  { month: 'Jul', revenue: 63000, profit: 25800, cost: 37200 },
  { month: 'Aug', revenue: 71500, profit: 30200, cost: 41300 },
  { month: 'Sep', revenue: 82000, profit: 35700, cost: 46300 },
  { month: 'Oct', revenue: 76000, profit: 32400, cost: 43600 },
  { month: 'Nov', revenue: 89500, profit: 39200, cost: 50300 },
  { month: 'Dec', revenue: 95000, profit: 42500, cost: 52500 },
];

const territoryPerformanceData = [
  { name: 'North Region', leads: 86, contacts: 52, deals: 12, revenue: 142000 },
  { name: 'South Region', leads: 74, contacts: 38, deals: 8, revenue: 96000 },
  { name: 'East Region', leads: 65, contacts: 41, deals: 9, revenue: 108000 },
  { name: 'West Region', leads: 98, contacts: 67, deals: 15, revenue: 178000 },
  { name: 'Central', leads: 56, contacts: 32, deals: 7, revenue: 84000 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

export default function AdvancedAnalyticsSection() {
  const [timeframe, setTimeframe] = useState('year');
  const [refreshing, setRefreshing] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
          <p className="text-muted-foreground mt-1">Comprehensive metrics and insights for your real estate business</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select 
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileDown className="h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Analytics Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive report with selected metrics and data visualizations
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Report Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start h-auto py-2 px-4 border-primary/30">
                      <div className="text-left">
                        <div className="font-medium">Performance</div>
                        <div className="text-xs text-muted-foreground">ROI, deal metrics, trends</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-2 px-4">
                      <div className="text-left">
                        <div className="font-medium">Lead Analysis</div>
                        <div className="text-xs text-muted-foreground">Sources, conversion, quality</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-2 px-4">
                      <div className="text-left">
                        <div className="font-medium">Market Insights</div>
                        <div className="text-xs text-muted-foreground">Prices, forecasts, comparisons</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-2 px-4">
                      <div className="text-left">
                        <div className="font-medium">Custom</div>
                        <div className="text-xs text-muted-foreground">Build your own report</div>
                      </div>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Time Range</h4>
                  <Select defaultValue="last3months">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="last3months">Last 3 Months</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Format</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="justify-center py-2 px-4 border-primary/30">PDF</Button>
                    <Button variant="outline" className="justify-center py-2 px-4">Excel</Button>
                    <Button variant="outline" className="justify-center py-2 px-4">CSV</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsReportDialogOpen(false)}>Generate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 bg-background border">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="business">Business Performance</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
          <TabsTrigger value="ai">AI Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue & Profit Trends</CardTitle>
                  <CardDescription>Monthly business performance metrics</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuItem>View Full Report</DropdownMenuItem>
                    <DropdownMenuItem>Export Data</DropdownMenuItem>
                    <DropdownMenuItem>Set Alerts</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Change View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" barSize={20} />
                      <Bar dataKey="cost" name="Cost" fill="#E57373" barSize={20} />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#4CAF50" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-muted-foreground text-sm border-t pt-4">
                <div>Annual Forecast: {formatCurrency(950000)}</div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Forecast Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Performing Territories</CardTitle>
                <CardDescription>Lead to deal conversion by region</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-6">
                  {territoryPerformanceData.map((territory) => {
                    const conversionRate = (territory.deals / territory.leads) * 100;
                    return (
                      <div key={territory.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <h4 className="font-medium">{territory.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {territory.leads} leads, {territory.deals} deals
                            </div>
                          </div>
                          <Badge variant={conversionRate > 12 ? "default" : conversionRate > 9 ? "secondary" : "outline"}>
                            {conversionRate.toFixed(1)}% Conv.
                          </Badge>
                        </div>
                        <Progress value={conversionRate * 5} className="h-2" /> {/* Scaling for better visual */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Revenue: {formatCurrency(territory.revenue)}</span>
                          <span className="font-medium">
                            {formatCurrency(Math.round(territory.revenue / territory.deals))} / deal
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of leads by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsBySourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsBySourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {leadsBySourceData.slice(0, 3).map((source, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs font-medium truncate">{source.name}</div>
                      <div className="text-sm font-semibold">{source.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Document Usage</CardTitle>
                <CardDescription>Most frequent document templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={documentUsageData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={60} />
                      <Tooltip formatter={(value) => [`${value} uses`, 'Count']} />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Total Documents Generated: 468
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Scraping Success Rate</CardTitle>
                <CardDescription>Data collection effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scrapeSuccessRateData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                      <Area type="monotone" dataKey="rate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Average</div>
                    <div className="font-semibold">93.4%</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Trend</div>
                    <div className="font-semibold text-emerald-600">+2.8%</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Total Jobs</div>
                    <div className="font-semibold">241</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI Score Accuracy</CardTitle>
                <CardDescription>Precision of lead evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={80} data={aiScoreAccuracyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Accuracy"
                        dataKey="accuracy"
                        stroke="#ff7300"
                        fill="#ff7300"
                        fillOpacity={0.4}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                  <div className="text-lg font-semibold">83.6%</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lead Conversion Funnel</CardTitle>
                <CardDescription>Journey from leads to closed deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'New Leads', value: 248, fill: '#e0e7ff' },
                        { name: 'Contacted', value: 153, fill: '#c7d2fe' },
                        { name: 'Meetings', value: 86, fill: '#a5b4fc' },
                        { name: 'Offers Made', value: 62, fill: '#818cf8' },
                        { name: 'Deals Closed', value: 37, fill: '#6366f1' },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                      <Bar dataKey="value" name="Count">
                        {[
                          { name: 'New Leads', value: 248, fill: '#e0e7ff' },
                          { name: 'Contacted', value: 153, fill: '#c7d2fe' },
                          { name: 'Meetings', value: 86, fill: '#a5b4fc' },
                          { name: 'Offers Made', value: 62, fill: '#818cf8' },
                          { name: 'Deals Closed', value: 37, fill: '#6366f1' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Conversion Rate</div>
                    <div className="text-2xl font-semibold">14.9%</div>
                    <div className="text-xs text-muted-foreground">Leads to closed deals</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Avg. Value Per Lead</div>
                    <div className="text-2xl font-semibold">{formatCurrency(732)}</div>
                    <div className="text-xs text-muted-foreground">Based on closed deals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Property Value Comparison</CardTitle>
                <CardDescription>Market vs. your acquisition prices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={marketTrendsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)} 
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="marketValue" 
                        name="Market Value" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="yourAvg" 
                        name="Your Avg. Purchase" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Your Discount</div>
                    <div className="text-2xl font-semibold text-emerald-600">12.4%</div>
                    <div className="text-xs text-muted-foreground">Below market average</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Market Trend</div>
                    <div className="text-2xl font-semibold">+14.0%</div>
                    <div className="text-xs text-muted-foreground">Annual appreciation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="business">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
              <BarChart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Business Performance Analytics</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Detailed breakdowns of revenue, profits, ROI, campaign effectiveness and more.
            </p>
            <Button className="mt-6">Explore Business Analytics</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="leads">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Lead Analytics</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Source analysis, conversion rates, quality scoring metrics and demographic insights.
            </p>
            <Button className="mt-6">Explore Lead Analytics</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="market">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Market Insights</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Market trends, property value forecasts, neighborhood analysis and investment opportunities.
            </p>
            <Button className="mt-6">Explore Market Insights</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="ai">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Analytics</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              AI system performance metrics, scoring accuracy, automation effectiveness, and prediction success rates.
            </p>
            <Button className="mt-6">Explore AI Analytics</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}