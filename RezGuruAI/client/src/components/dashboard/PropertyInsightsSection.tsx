import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  InfoIcon, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  MapPin, 
  Home, 
  DollarSign
} from 'lucide-react';

// Property market data (would be fetched from API in production)
const propertyData = {
  marketTrends: [
    { month: 'Jan', avgPrice: 285000, inventory: 125, daysOnMarket: 45 },
    { month: 'Feb', avgPrice: 288000, inventory: 132, daysOnMarket: 42 },
    { month: 'Mar', avgPrice: 290000, inventory: 128, daysOnMarket: 41 },
    { month: 'Apr', avgPrice: 295000, inventory: 135, daysOnMarket: 38 },
    { month: 'May', avgPrice: 302000, inventory: 142, daysOnMarket: 35 },
    { month: 'Jun', avgPrice: 305000, inventory: 148, daysOnMarket: 32 },
    { month: 'Jul', avgPrice: 308000, inventory: 152, daysOnMarket: 30 },
    { month: 'Aug', avgPrice: 310000, inventory: 158, daysOnMarket: 28 },
    { month: 'Sep', avgPrice: 315000, inventory: 162, daysOnMarket: 27 },
    { month: 'Oct', avgPrice: 318000, inventory: 155, daysOnMarket: 29 },
    { month: 'Nov', avgPrice: 320000, inventory: 148, daysOnMarket: 31 },
    { month: 'Dec', avgPrice: 325000, inventory: 140, daysOnMarket: 33 },
  ],
  
  propertyTypes: [
    { type: 'Single Family', count: 385, avgPrice: 325000, color: '#8884d8' },
    { type: 'Condo', count: 210, avgPrice: 215000, color: '#82ca9d' },
    { type: 'Multi-Family', count: 95, avgPrice: 450000, color: '#ffc658' },
    { type: 'Mobile Home', count: 45, avgPrice: 98000, color: '#ff8042' },
    { type: 'Vacant Land', count: 128, avgPrice: 175000, color: '#0088fe' }
  ],
  
  topNeighborhoods: [
    { name: 'Downtown', avgPrice: 385000, priceChange: 8.2, inventory: 42, daysOnMarket: 22 },
    { name: 'Westside', avgPrice: 412000, priceChange: 7.5, inventory: 38, daysOnMarket: 18 },
    { name: 'North Hills', avgPrice: 328000, priceChange: 6.2, inventory: 65, daysOnMarket: 24 },
    { name: 'Eastview', avgPrice: 295000, priceChange: 5.8, inventory: 58, daysOnMarket: 28 },
    { name: 'Southdale', avgPrice: 272000, priceChange: 4.2, inventory: 72, daysOnMarket: 31 }
  ],
  
  foreclosureData: [
    { month: 'Jan', count: 42 },
    { month: 'Feb', count: 38 },
    { month: 'Mar', count: 45 },
    { month: 'Apr', count: 51 },
    { month: 'May', count: 48 },
    { month: 'Jun', count: 52 },
    { month: 'Jul', count: 56 },
    { month: 'Aug', count: 62 },
    { month: 'Sep', count: 58 },
    { month: 'Oct', count: 54 },
    { month: 'Nov', count: 49 },
    { month: 'Dec', count: 45 },
  ],
  
  opportunityZones: [
    { zone: 'North District', properties: 85, avgPrice: 198000, appreciation: 12.5 },
    { zone: 'East Industrial', properties: 62, avgPrice: 172000, appreciation: 15.8 },
    { zone: 'South Gateway', properties: 48, avgPrice: 235000, appreciation: 9.2 },
    { zone: 'West Corridor', properties: 72, avgPrice: 187000, appreciation: 13.7 }
  ]
};

export default function PropertyInsightsSection() {
  const [region, setRegion] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Property Market Insights</h2>
          <p className="text-muted-foreground mt-1">Analytics and trends for your local real estate market</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north">North District</SelectItem>
              <SelectItem value="south">South District</SelectItem>
              <SelectItem value="east">East District</SelectItem>
              <SelectItem value="west">West District</SelectItem>
              <SelectItem value="central">Central District</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="singleFamily">Single Family</SelectItem>
              <SelectItem value="condo">Condos</SelectItem>
              <SelectItem value="multiFamily">Multi-Family</SelectItem>
              <SelectItem value="land">Vacant Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Average Property Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(325000)}</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                5.2% increase
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last year</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">140</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <TrendingDown className="h-3 w-3 mr-1" />
                8.6% decrease
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Days on Market</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33 days</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                2 days increase
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Foreclosure Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <TrendingDown className="h-3 w-3 mr-1" />
                8.2% decrease
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="market-trends">
        <TabsList className="mb-4">
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
          <TabsTrigger value="property-types">Property Types</TabsTrigger>
          <TabsTrigger value="neighborhoods">Neighborhoods</TabsTrigger>
          <TabsTrigger value="opportunity-zones">Opportunity Zones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market-trends">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Price Trends</CardTitle>
                <CardDescription>Average property prices over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={propertyData.marketTrends}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)} 
                        labelFormatter={(value) => `Month: ${value}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgPrice" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        name="Average Price"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="grid grid-cols-3 w-full gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">YTD Change</div>
                    <div className="text-sm font-semibold text-green-600">+14.2%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Forecast (Next 6M)</div>
                    <div className="text-sm font-semibold">+6.5%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Market Strength</div>
                    <div className="text-sm font-semibold">Seller's Market</div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Indicators</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Inventory Levels</span>
                      <span className="text-sm text-muted-foreground">140 listings</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low Inventory</span>
                      <span>High Inventory</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Days on Market</span>
                      <span className="text-sm text-muted-foreground">33 days avg.</span>
                    </div>
                    <Progress value={38} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fast Market</span>
                      <span>Slow Market</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Price to List Ratio</span>
                      <span className="text-sm text-muted-foreground">98.5%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Buyer Power</span>
                      <span>Seller Power</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Market Absorption</span>
                      <span className="text-sm text-muted-foreground">3.2 mo.</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Quick Sales</span>
                      <span>Slow Sales</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">Market Alert</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inventory levels declining 8.6% month-over-month indicating further price pressure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inventory Trends</CardTitle>
                <CardDescription>Available properties over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={propertyData.marketTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="inventory" name="Inventory" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Days on Market</CardTitle>
                <CardDescription>Average time to sell properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={propertyData.marketTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="daysOnMarket" name="Days on Market" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="property-types">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle>Property Type Distribution</CardTitle>
                <CardDescription>Breakdown by property category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyData.propertyTypes}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip 
                        formatter={(value, name) => 
                          name === 'avgPrice' ? formatCurrency(value as number) : value
                        } 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Quantity" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="avgPrice" name="Avg. Price" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Property Value by Type</CardTitle>
                  <CardDescription>Average prices comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyData.propertyTypes.map((type, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                            <span className="font-medium text-sm">{type.type}</span>
                          </div>
                          <span className="text-sm">{formatCurrency(type.avgPrice)}</span>
                        </div>
                        <Progress value={(type.avgPrice / 450000) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t flex justify-between pt-4">
                  <div className="text-sm text-muted-foreground">Market average</div>
                  <div className="font-medium">{formatCurrency(315000)}</div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Market Share</CardTitle>
                  <CardDescription>Distribution by property type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyData.propertyTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          dataKey="count"
                          nameKey="type"
                        >
                          {propertyData.propertyTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="neighborhoods">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top Performing Neighborhoods</CardTitle>
              <CardDescription>Areas with strongest price growth and demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium p-2">Neighborhood</th>
                      <th className="text-left font-medium p-2">Avg. Price</th>
                      <th className="text-left font-medium p-2">Price Change</th>
                      <th className="text-left font-medium p-2">Inventory</th>
                      <th className="text-left font-medium p-2">Days on Market</th>
                      <th className="text-left font-medium p-2">Market Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {propertyData.topNeighborhoods.map((hood, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{hood.name}</span>
                          </div>
                        </td>
                        <td className="p-2">{formatCurrency(hood.avgPrice)}</td>
                        <td className="p-2">
                          <Badge className={hood.priceChange > 6.5 ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                            {hood.priceChange > 0 ? '+' : ''}{hood.priceChange}%
                          </Badge>
                        </td>
                        <td className="p-2">{hood.inventory} listings</td>
                        <td className="p-2">{hood.daysOnMarket} days</td>
                        <td className="p-2">
                          <Badge variant="outline" className={hood.daysOnMarket < 25 ? "border-green-200 text-green-800" : "border-amber-200 text-amber-800"}>
                            {hood.daysOnMarket < 25 ? "Hot Market" : "Balanced"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex-col items-start">
              <div className="text-sm text-muted-foreground mb-2">Neighborhood Investment Recommendation</div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Top Pick</Badge>
                <span className="font-medium">Westside</span>
                <span className="text-sm text-muted-foreground">- Strong appreciation with below average days on market</span>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Neighborhood Price Comparison</CardTitle>
                <CardDescription>Average property prices by area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyData.topNeighborhoods}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="avgPrice" name="Average Price" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Speed by Neighborhood</CardTitle>
                <CardDescription>Average days on market comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyData.topNeighborhoods}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => `${value} days`} />
                      <Legend />
                      <Bar dataKey="daysOnMarket" name="Days on Market" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="opportunity-zones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Opportunity Zones</CardTitle>
                <CardDescription>Properties in tax-advantaged opportunity zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {propertyData.opportunityZones.map((zone, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{zone.zone}</div>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {zone.appreciation}% appreciation
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="text-muted-foreground mr-2">Avg. Price:</span>
                          {formatCurrency(zone.avgPrice)}
                        </div>
                        <div>
                          <span className="text-muted-foreground mr-2">Properties:</span>
                          {zone.properties}
                        </div>
                      </div>
                      <Progress value={zone.appreciation * 5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full gap-2">
                  <InfoIcon className="h-4 w-4" />
                  Learn More About Opportunity Zones
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Foreclosure Trends</CardTitle>
                <CardDescription>Monthly foreclosure filings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={propertyData.foreclosureData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorForeclosures" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} properties`, 'Foreclosures']} />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#FF8042" 
                        fillOpacity={1} 
                        fill="url(#colorForeclosures)" 
                        name="Foreclosures"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="grid grid-cols-3 w-full gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">YTD Total</div>
                    <div className="font-semibold">550</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Avg. Discount</div>
                    <div className="font-semibold">32%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="font-semibold text-amber-600">+8.2%</div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle>Investment Opportunity Score</CardTitle>
              <CardDescription>Analysis of market opportunities for investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Price-to-Rent Ratio</div>
                      <div className="text-sm text-muted-foreground">Average of 15.2 indicating a balanced market</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Appreciation Potential</div>
                      <div className="text-sm text-muted-foreground">Projected 5-year growth of 28.5%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-3 rounded-full">
                      <Home className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Cash Flow Potential</div>
                      <div className="text-sm text-muted-foreground">Average cap rate of 6.2% for investment properties</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">North District</span>
                      <span className="font-medium text-green-600">85/100</span>
                    </div>
                    <Progress value={85} className="h-2 bg-gray-100" />
                    <div className="text-xs text-muted-foreground">High foreclosure rate with strong rental demand</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">East Industrial</span>
                      <span className="font-medium text-green-600">78/100</span>
                    </div>
                    <Progress value={78} className="h-2 bg-gray-100" />
                    <div className="text-xs text-muted-foreground">Commercial rezoning potential increasing property values</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Westside</span>
                      <span className="font-medium text-amber-600">68/100</span>
                    </div>
                    <Progress value={68} className="h-2 bg-gray-100" />
                    <div className="text-xs text-muted-foreground">Strong appreciation but higher entry prices</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">South Gateway</span>
                      <span className="font-medium text-amber-600">62/100</span>
                    </div>
                    <Progress value={62} className="h-2 bg-gray-100" />
                    <div className="text-xs text-muted-foreground">Emerging market with infrastructure improvements</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full gap-2">
                <MapPin className="h-4 w-4" />
                View Investment Heat Map
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}