import { useQuery } from "@tanstack/react-query";
import { ScrapingJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ScrapingForm from "@/components/scraping/ScrapingForm";
import { format, formatDistanceToNow } from "date-fns";

export default function Scraping() {
  // Fetch scraping jobs
  const { data: scrapingJobs, isLoading } = useQuery<ScrapingJob[]>({
    queryKey: ["/api/scraping-jobs"],
  });
  
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
          <h1 className="text-2xl font-bold text-gray-900">Data Scraping</h1>
          <p className="mt-1 text-gray-500">Set up automated data collection from public sources</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <i className="fas fa-play mr-2"></i> Run All Jobs
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
                <div className="text-center p-4 text-gray-500">Loading jobs...</div>
              ) : !scrapingJobs || scrapingJobs.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No scraping jobs found. Create your first job to start collecting leads.
                </div>
              ) : (
                <div className="space-y-4">
                  {scrapingJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`rounded-md bg-${job.source === 'tax_delinquent' ? 'blue' : job.source === 'probate' ? 'purple' : 'green'}-100 p-2 mr-3 text-${job.source === 'tax_delinquent' ? 'blue' : job.source === 'probate' ? 'purple' : 'green'}-600`}>
                            <i className={getSourceIcon(job.source)}></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{job.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {job.url ? (
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                                  {job.url}
                                </a>
                              ) : "No URL specified"}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">
                            Source: {getSourceDisplayName(job.source)}
                          </span>
                          <span className="text-gray-500">
                            Last run: {job.lastRun ? formatDistanceToNow(new Date(job.lastRun), { addSuffix: true }) : 'Never'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="text-primary-600">
                            <i className="fas fa-play mr-1"></i> Run
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-600">
                            <i className="fas fa-pencil-alt mr-1"></i> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <i className="fas fa-trash-alt mr-1"></i> Delete
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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Found
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scrapingJobs
                        .filter(job => job.results && job.results.length > 0)
                        .flatMap(job => job.results?.map((result: any, index: number) => (
                          <tr key={`${job.id}-${index}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.address || "No address"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${job.source === 'tax_delinquent' ? 'blue' : job.source === 'probate' ? 'purple' : 'green'}-100 text-${job.source === 'tax_delinquent' ? 'blue' : job.source === 'probate' ? 'purple' : 'green'}-800`}>
                                {getSourceDisplayName(job.source)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.lastRun ? format(new Date(job.lastRun), 'PP') : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button size="sm" variant="ghost" className="text-primary-600">
                                Add as Lead
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
              <div className="text-sm text-gray-600 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Tax Delinquent Records</h4>
                  <p>Most county treasurer websites publish tax delinquent lists. Target URLs like: county-name.gov/treasurer/delinquent-taxes</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Probate Records</h4>
                  <p>Search county court records for recent probate filings. These often require OCR for PDF processing.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">FSBO Listings</h4>
                  <p>Scrape Craigslist, Facebook Marketplace, and local classified sites for "For Sale By Owner" listings.</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-book mr-2"></i> View Full Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
