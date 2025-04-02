import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Download, 
  FileDown, 
  FileText, 
  Info, 
  Plus, 
  Settings, 
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportMetric {
  id: string;
  name: string;
  category: string;
  description: string;
  checked: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  timeFrame: string;
  format: string;
}

export default function ReportGenerator() {
  const [reportName, setReportName] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [timeRange, setTimeRange] = useState<string>('lastMonth');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<ReportMetric[]>([
    { id: 'leads-by-source', name: 'Leads by Source', category: 'leads', description: 'Breakdown of lead sources and their quantities', checked: true },
    { id: 'lead-conversion', name: 'Lead Conversion Rates', category: 'leads', description: 'Conversion percentages through each pipeline stage', checked: true },
    { id: 'high-value-leads', name: 'High Value Leads', category: 'leads', description: 'List of highest-scoring leads and their details', checked: false },
    { id: 'property-types', name: 'Property Types', category: 'property', description: 'Distribution of property types in your database', checked: true },
    { id: 'property-values', name: 'Property Values', category: 'property', description: 'Value ranges of properties in your pipeline', checked: false },
    { id: 'monthly-revenue', name: 'Monthly Revenue', category: 'financial', description: 'Revenue trends over the selected period', checked: true },
    { id: 'campaign-roi', name: 'Campaign ROI', category: 'financial', description: 'Return on investment for marketing campaigns', checked: true },
    { id: 'profit-margins', name: 'Profit Margins', category: 'financial', description: 'Gross and net margins on deals closed', checked: false },
    { id: 'deal-metrics', name: 'Deal Metrics', category: 'deals', description: 'Statistics on deals including averages and totals', checked: true },
    { id: 'time-to-close', name: 'Time to Close', category: 'deals', description: 'Average days from lead acquisition to closing', checked: false },
    { id: 'ai-accuracy', name: 'AI Scoring Accuracy', category: 'ai', description: 'Effectiveness of AI-based lead scoring', checked: true },
    { id: 'scraping-success', name: 'Scraping Success Rates', category: 'ai', description: 'Success rates of automated data collection', checked: true },
  ]);
  
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'monthly-performance',
      name: 'Monthly Performance',
      description: 'Overview of monthly business metrics, leads, and deals',
      metrics: ['leads-by-source', 'lead-conversion', 'monthly-revenue', 'deal-metrics'],
      timeFrame: 'lastMonth',
      format: 'pdf'
    },
    {
      id: 'lead-analysis',
      name: 'Lead Analysis',
      description: 'Detailed analysis of lead sources, quality, and conversion',
      metrics: ['leads-by-source', 'lead-conversion', 'high-value-leads', 'ai-accuracy'],
      timeFrame: 'last3Months',
      format: 'pdf'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue, costs, ROI, and profit metrics',
      metrics: ['monthly-revenue', 'campaign-roi', 'profit-margins', 'deal-metrics'],
      timeFrame: 'lastQuarter',
      format: 'excel'
    },
    {
      id: 'ai-performance',
      name: 'AI Performance',
      description: 'Analysis of AI tools effectiveness and accuracy',
      metrics: ['ai-accuracy', 'scraping-success', 'high-value-leads', 'lead-conversion'],
      timeFrame: 'last6Months',
      format: 'pdf'
    }
  ];

  const applyTemplate = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    setReportName(template.name);
    setTimeRange(template.timeFrame);
    setSelectedFormat(template.format);
    
    // Update checked metrics based on template
    setMetrics(metrics.map(metric => ({
      ...metric,
      checked: template.metrics.includes(metric.id)
    })));
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would normally trigger a download or show a success message
      alert('Report generated successfully! Download would start automatically in a real implementation.');
    }, 2000);
  };
  
  const toggleMetric = (id: string, checked: boolean) => {
    setMetrics(metrics.map(metric => 
      metric.id === id ? { ...metric, checked } : metric
    ));
  };
  
  const getSelectedMetricsCount = () => {
    return metrics.filter(m => m.checked).length;
  };
  
  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case 'lastMonth': return 'Last Month';
      case 'last3Months': return 'Last 3 Months';
      case 'lastQuarter': return 'Last Quarter';
      case 'last6Months': return 'Last 6 Months';
      case 'lastYear': return 'Last Year';
      case 'custom': return dateFrom && dateTo 
        ? `${format(dateFrom, 'MMM d, yyyy')} - ${format(dateTo, 'MMM d, yyyy')}`
        : 'Custom Range';
      default: return 'Select Range';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl">Report Generator</CardTitle>
            <CardDescription>Create custom reports and analytics</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-9">
                  <FileText className="h-4 w-4" />
                  Templates
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                {reportTemplates.map(template => (
                  <DropdownMenuItem 
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="report-name">Report Name</Label>
            <Input 
              id="report-name" 
              placeholder="Enter report name..." 
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Time Range</Label>
              {timeRange === 'custom' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTimeRange('lastMonth')}
                  className="h-7 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={timeRange === 'lastMonth' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('lastMonth')}
              >
                Last Month
              </Button>
              <Button 
                variant={timeRange === 'last3Months' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('last3Months')}
              >
                Last 3 Months
              </Button>
              <Button 
                variant={timeRange === 'lastQuarter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('lastQuarter')}
              >
                Last Quarter
              </Button>
              <Button 
                variant={timeRange === 'lastYear' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('lastYear')}
              >
                Last Year
              </Button>
              <Button 
                variant={timeRange === 'custom' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange('custom')}
              >
                Custom Range
              </Button>
            </div>
            
            {timeRange === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="from">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="from"
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="to">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="to"
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        disabled={(date) => dateFrom ? date < dateFrom : false}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid gap-3">
            <Label>Metrics & Data to Include</Label>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 grid grid-cols-5 h-9">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
                <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">AI/Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex gap-2 items-start border border-border rounded-md p-3">
                      <Checkbox 
                        id={metric.id} 
                        checked={metric.checked}
                        onCheckedChange={(checked) => toggleMetric(metric.id, checked as boolean)} 
                      />
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={metric.id}
                          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {metric.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {['leads', 'property', 'financial', 'ai'].map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {metrics
                      .filter((metric) => metric.category === category)
                      .map((metric) => (
                        <div key={metric.id} className="flex gap-2 items-start border border-border rounded-md p-3">
                          <Checkbox 
                            id={`${category}-${metric.id}`} 
                            checked={metric.checked}
                            onCheckedChange={(checked) => toggleMetric(metric.id, checked as boolean)} 
                          />
                          <div className="grid gap-1.5">
                            <Label
                              htmlFor={`${category}-${metric.id}`}
                              className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {metric.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <div className="grid gap-3">
            <Label>Report Format</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedFormat === 'pdf' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFormat('pdf')}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
              <Button 
                variant={selectedFormat === 'excel' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFormat('excel')}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Excel
              </Button>
              <Button 
                variant={selectedFormat === 'csv' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFormat('csv')}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                CSV
              </Button>
              <Button 
                variant={selectedFormat === 'powerpoint' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFormat('powerpoint')}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                PowerPoint
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-6 gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Selected metrics:</span>{" "}
          <span className="font-medium">{getSelectedMetricsCount()} of {metrics.length}</span>
          <span className="mx-3 text-muted-foreground">•</span>
          <span className="text-muted-foreground">Time range:</span>{" "}
          <span className="font-medium">{getTimeRangeLabel()}</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Schedule
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating || getSelectedMetricsCount() === 0 || !reportName}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}