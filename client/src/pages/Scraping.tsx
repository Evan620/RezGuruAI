import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrapingJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScrapingForm from "@/components/scraping/ScrapingForm";
import ScrapingJobDetail from "@/components/scraping/ScrapingJobDetail";
import { format, formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, RefreshCw } from "lucide-react";

export default function Scraping() {
  const [selectedJob, setSelectedJob] = useState<ScrapingJob | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch scraping jobs
  const { data: scrapingJobs, isLoading } = useQuery<ScrapingJob[]>({
    queryKey: ["/api/scraping-jobs"],
  });
  
  // Run all jobs mutation
  const runAllJobsMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      if (scrapingJobs && scrapingJobs.length > 0) {
        for (const job of scrapingJobs) {
          const result = await apiRequest(`/api/scraping-jobs/${job.id}/run`, 'POST');
          results.push(result);
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraping-jobs"] });
      toast({
        title: "Scraping Jobs Started",
        description: "All scraping jobs have been started. Results will appear when complete.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to run scraping jobs: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Single job run mutation
  const runJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/scraping-jobs/${jobId}/run`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraping-jobs"] });
      toast({
        title: "Job Started",
        description: "The scraping job has been started. Results will appear when complete.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to run scraping job: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Create lead from scraping result mutation
  const createLeadMutation = useMutation({
    mutationFn: async ({ jobId, resultId }: { jobId: number, resultId: string }) => {
      return apiRequest(`/api/scraping-jobs/${jobId}/results/${resultId}/create-lead`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Created",
        description: "A new lead has been created from the scraping result.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create lead: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle opening job details
  const handleViewJobDetails = (job: ScrapingJob) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };
  
  // Handle closing job details
  const handleCloseJobDetails = () => {
    setIsJobDetailOpen(false);
    setSelectedJob(null);
  };
  
  // Handle running a job
  const handleRunJob = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    runJobMutation.mutate(jobId);
  };
  
  // Handle running all jobs
  const handleRunAllJobs = () => {
    runAllJobsMutation.mutate();
  };
  
  // Handle creating a lead from a scraping result
  const handleCreateLead = (jobId: number, resultId: string) => {
    createLeadMutation.mutate({ jobId, resultId });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get source display name
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case "tax_delinquent":
        return "Tax Delinquent";
      case "probate":
        return "Probate";
      case "fsbo":
        return "FSBO";
      default:
        return source;
    }
  };
  
  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "tax_delinquent":
        return "fas fa-file-invoice-dollar";
      case "probate":
        return "fas fa-gavel";
      case "fsbo":
        return "fas fa-home";
      default:
        return "fas fa-globe";
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Scraping</h1>
          <p className="mt-1 text-muted-foreground">Set up automated data collection from public sources</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90" 
          onClick={handleRunAllJobs}
          disabled={runAllJobsMutation.isPending || !scrapingJobs?.length}
        >
          {runAllJobsMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run All Jobs
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scraping Jobs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-4 text-muted-foreground">Loading jobs...</div>
              ) : !scrapingJobs || scrapingJobs.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No scraping jobs found. Create your first job to start collecting leads.
                </div>
              ) : (
                <div className="space-y-4">
                  {scrapingJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleViewJobDetails(job)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`rounded-md p-2 mr-3 ${
                            job.source === 'tax_delinquent' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                              : job.source === 'probate' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            <i className={getSourceIcon(job.source)}></i>
                          </div>
                          <div>
                            <h3 className="font-medium">{job.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {job.url ? (
                                <a 
                                  href={job.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {job.url}
                                </a>
                              ) : "No URL specified"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          job.status === 'completed' ? 'outline' 
                          : job.status === 'running' ? 'default'
                          : job.status === 'pending' ? 'secondary'
                          : job.status === 'failed' ? 'destructive'
                          : 'outline'
                        }>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-muted-foreground">
                            Source: {getSourceDisplayName(job.source)}
                          </span>
                          <span className="text-muted-foreground">
                            Last run: {job.lastRun ? formatDistanceToNow(new Date(job.lastRun), { addSuffix: true }) : 'Never'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                            onClick={(e) => handleRunJob(job.id, e)}
                            disabled={runJobMutation.isPending}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Run
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewJobDetails(job);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Results List (If any jobs have results) */}
          {scrapingJobs?.some(job => job.results && job.results.length > 0) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Found
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {scrapingJobs
                        .filter(job => job.results && job.results.length > 0)
                        .flatMap(job => job.results?.map((result: any, index: number) => (
                          <tr key={`${job.id}-${index}`} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {result.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {result.address || "No address"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className={
                                job.source === 'tax_delinquent'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                                  : job.source === 'probate'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                                    : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                              }>
                                {getSourceDisplayName(job.source)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {job.lastRun ? format(new Date(job.lastRun), 'PP') : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                                onClick={() => handleCreateLead(job.id, result.id)}
                                disabled={createLeadMutation.isPending}
                              >
                                {createLeadMutation.isPending ? 'Adding...' : 'Add as Lead'}
                              </Button>
                            </td>
                          </tr>
                        ))) || []}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Create Scraping Job Form */}
        <div>
          <ScrapingForm />
          
          {/* Scraping Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scraping Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Tax Delinquent Records</h4>
                  <p>Most county treasurer websites publish tax delinquent lists. Target URLs like: county-name.gov/treasurer/delinquent-taxes</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Probate Records</h4>
                  <p>Search county court records for recent probate filings. These often require OCR for PDF processing.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">FSBO Listings</h4>
                  <p>Scrape Craigslist, Facebook Marketplace, and local classified sites for "For Sale By Owner" listings.</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    View Full Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Job Detail Dialog */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <ScrapingJobDetail
              job={selectedJob}
              onClose={handleCloseJobDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
