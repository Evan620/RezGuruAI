import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrapingJob } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Play, Pause, RefreshCw, Trash2, AlarmClock, Edit, FileDown, Filter, 
  PlusCircle, Eye, BarChart3, AlertCircle
} from 'lucide-react';
import ScrapingScheduleEditor from './ScrapingScheduleEditor';

interface ScrapingJobDetailProps {
  job: ScrapingJob;
  onClose: () => void;
}

export default function ScrapingJobDetail({ job, onClose }: ScrapingJobDetailProps) {
  const [isRunning, setIsRunning] = useState(job.status === 'running');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const runScrapingJob = useMutation({
    mutationFn: async (jobId: number) => {
      setIsRunning(true);
      
      // Simulate progress updates
      const intervalId = setInterval(() => {
        setRunProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      const response = await apiRequest(`/api/scraping-jobs/${jobId}/run`, 'POST');
      clearInterval(intervalId);
      return response;
    },
    onSuccess: () => {
      setRunProgress(100);
      setTimeout(() => {
        setIsRunning(false);
        setRunProgress(0);
        queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
        toast({
          title: 'Scraping Completed',
          description: 'The scraping job has been completed successfully.',
        });
      }, 1000);
    },
    onError: (error) => {
      setIsRunning(false);
      setRunProgress(0);
      toast({
        title: 'Error',
        description: `Failed to run scraping job: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteScrapingJob = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/scraping-jobs/${jobId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-jobs'] });
      toast({
        title: 'Job Deleted',
        description: 'The scraping job has been deleted successfully.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete scraping job: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | null | undefined => {
    switch (status) {
      case 'completed':
        return 'outline';
      case 'running':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'tax_delinquent':
        return 'Tax Delinquent Records';
      case 'probate':
        return 'Probate Records';
      case 'fsbo':
        return 'For Sale By Owner';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };
  
  const handleRunJob = () => {
    runScrapingJob.mutate(job.id);
  };
  
  const handleDeleteJob = () => {
    deleteScrapingJob.mutate(job.id);
  };
  
  const formattedResults = job.results?.length ? (
    <div className="rounded-md border border-gray-200">
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-medium">Latest Results ({job.results.length})</div>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <FileDown className="h-4 w-4" /> Export
        </Button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th scope="col" className="relative px-4 py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {job.results.map((result: any, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm">{result.name || 'Unknown'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{result.address || 'Unknown'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {result.amount ? `$${result.amount}` : ''} 
                  {result.date ? ` - ${format(new Date(result.date), 'PP')}` : ''}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
      <h3 className="text-lg font-semibold">No results yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Run this job to collect data from the specified URL.
        Results will appear here after the job completes.
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={handleRunJob}
        disabled={isRunning}
      >
        <Play className="h-4 w-4 mr-2" />
        Run Now
      </Button>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{job.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {format(new Date(job.createdAt), 'PPP')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlarmClock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Scraping Job</DialogTitle>
                <DialogDescription>
                  Set up a schedule for automatically running this scraping job.
                </DialogDescription>
              </DialogHeader>
              <ScrapingScheduleEditor jobId={job.id} onComplete={() => setIsScheduleDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="default" 
            onClick={handleRunJob}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </>
            )}
          </Button>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this scraping job? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteJob}>
                  Delete Job
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isRunning && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Scraping in progress...</span>
            <span className="text-sm">{Math.round(runProgress)}%</span>
          </div>
          <Progress value={runProgress} className="w-full" />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">Run History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="p-4 border rounded-md mt-4">
              {formattedResults}
            </TabsContent>
            
            <TabsContent value="history" className="p-4 border rounded-md mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Job Run History</h3>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { 
                      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
                      status: 'completed', 
                      duration: '1m 42s',
                      results: 28
                    },
                    { 
                      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
                      status: 'completed', 
                      duration: '2m 13s',
                      results: 32
                    },
                    { 
                      date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), 
                      status: 'failed', 
                      duration: '0m 32s',
                      results: 0
                    },
                  ].map((run, index) => (
                    <div key={index} className="flex justify-between p-3 border rounded-md hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{format(run.date, 'PPP')}</div>
                        <div className="text-sm text-muted-foreground">{format(run.date, 'p')}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm">Duration: {run.duration}</div>
                          <div className="text-sm">Results: {run.results}</div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(run.status)}>
                          {run.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="p-4 border rounded-md mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Results Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-center justify-center">
                      <BarChart3 className="h-24 w-24 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Source Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lead Quality</span>
                          <span className="font-medium">Good</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Data Completeness</span>
                          <span className="font-medium">Medium</span>
                        </div>
                        <Progress value={58} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Success Rate</span>
                          <span className="font-medium">High</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Source Type</div>
                <div>{getSourceDisplayName(job.source)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Website URL</div>
                <div className="break-all">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {job.url}
                  </a>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Last Run</div>
                <div>{job.lastRun ? formatDistanceToNow(new Date(job.lastRun), { addSuffix: true }) : 'Never'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Schedule</div>
                <div>Not scheduled</div>
              </div>
              
              {job.notes && (
                <div>
                  <div className="text-sm font-medium mb-1">Notes</div>
                  <div className="text-sm">{job.notes}</div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium mb-1">Statistics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">Total Runs</div>
                    <div className="text-lg font-semibold">3</div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">Total Results</div>
                    <div className="text-lg font-semibold">{job.results?.length || 0}</div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                    <div className="text-lg font-semibold">67%</div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">Avg. Duration</div>
                    <div className="text-lg font-semibold">1m 40s</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
            </CardFooter>
          </Card>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Scraping Limitations</AlertTitle>
            <AlertDescription>
              Remember to respect website terms of service and rate limits when scraping. 
              Excessive scraping may result in your IP being blocked.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}