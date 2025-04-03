import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { InsertScrapingJob } from "@shared/schema";

export default function ScrapingForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InsertScrapingJob>>({
    name: "",
    source: "tax_delinquent",
    url: "",
    status: "pending"
  });
  
  const createScrapingJobMutation = useMutation({
    mutationFn: async (data: Partial<InsertScrapingJob>) => {
      return apiRequest("/api/scraping-jobs", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraping-jobs"] });
      toast({
        title: "Success!",
        description: "Scraping job was created successfully.",
      });
      setFormData({
        name: "",
        source: "tax_delinquent",
        url: "",
        status: "pending"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create scraping job: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScrapingJobMutation.mutate(formData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSourceChange = (value: string) => {
    setFormData(prev => ({ ...prev, source: value }));
  };
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Scraping Job</CardTitle>
        <CardDescription>Configure a new data scraping job to gather leads automatically</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Maricopa County Tax Delinquents"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="source">Source Type</Label>
              <Select
                value={formData.source}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax_delinquent">Tax Delinquent</SelectItem>
                  <SelectItem value="probate">Probate</SelectItem>
                  <SelectItem value="fsbo">FSBO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="e.g., https://treasurer.maricopa.gov/delinquent-taxes"
                value={formData.url}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the URL of the website containing the leads you want to scrape
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any specific instructions or details for this scraping job..."
                value={formData.notes || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700"
              disabled={createScrapingJobMutation.isPending}
            >
              {createScrapingJobMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Create Scraping Job
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
