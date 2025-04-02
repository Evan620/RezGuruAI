import React, { useState } from 'react';
import { Document } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Download, Edit, Trash2, FileText, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface DocumentViewerProps {
  document: Document;
  onEdit?: (document: Document) => void;
}

export default function DocumentViewer({ document, onEdit }: DocumentViewerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDocument, setEditedDocument] = useState<Partial<Document>>({
    name: document.name,
    status: document.status,
    content: document.content
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/documents/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'Document Deleted',
        description: 'The document has been deleted successfully.',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update document mutation
  const updateDocument = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Document> }) => {
      return apiRequest(`/api/documents/${id}`, 'PATCH', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'Document Updated',
        description: 'The document has been updated successfully.',
        variant: 'default',
      });
      setIsEditDialogOpen(false);
      if (onEdit) onEdit(data);
    },
    onError: (error) => {
      console.error('Error updating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle document update
  const handleUpdate = () => {
    updateDocument.mutate({
      id: document.id,
      data: editedDocument,
    });
  };

  // Handle document delete
  const handleDelete = () => {
    deleteDocument.mutate(document.id);
  };

  // Handle document print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 40px;
              }
              pre {
                white-space: pre-wrap;
                font-family: inherit;
              }
              @media print {
                body {
                  margin: 20px;
                }
              }
            </style>
          </head>
          <body>
            <h1>${document.name}</h1>
            <pre>${document.content || ''}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Get badge color based on document status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'signed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{document.name}</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={getStatusBadgeColor(document.status)}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsContentDialogOpen(true)}>
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* View Document Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{document.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md overflow-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {document.content || 'No content available'}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={editedDocument.name || ''}
                onChange={(e) => setEditedDocument({ ...editedDocument, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editedDocument.status || ''}
                onChange={(e) => setEditedDocument({ ...editedDocument, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                value={editedDocument.content || ''}
                onChange={(e) => setEditedDocument({ ...editedDocument, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateDocument.isPending}>
              {updateDocument.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{document.name}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteDocument.isPending}>
              {deleteDocument.isPending ? 'Deleting...' : 'Delete Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}