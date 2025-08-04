'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Ticket {
  id: number;
  title: string;
  description: string;
  ticketType: string;
  priority: string;
  status: string;
  assignedTo?: number;
  dueDate?: string;
  resolutionNotes?: string;
  tags?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface EditTicketClientProps {
  ticketId: number;
}

export default function EditTicketClient({ ticketId }: EditTicketClientProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketType: '',
    priority: '',
    status: '',
    assignedTo: '',
    dueDate: '',
    resolutionNotes: '',
    tags: '',
  });

  useEffect(() => {
    fetchTicketAndUsers();
  }, [ticketId]);

  const fetchTicketAndUsers = async () => {
    try {
      // Fetch ticket details
      const ticketResponse = await fetch(`/api/tickets/${ticketId}`);
      if (!ticketResponse.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      const ticketData = await ticketResponse.json();
      setTicket(ticketData.ticket);

      // Fetch users for assignment dropdown
      const usersResponse = await fetch('/api/user');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Set form data
      setFormData({
        title: ticketData.ticket.title,
        description: ticketData.ticket.description,
        ticketType: ticketData.ticket.ticketType,
        priority: ticketData.ticket.priority,
        status: ticketData.ticket.status,
        assignedTo: ticketData.ticket.assignedTo?.toString() || '',
        dueDate: ticketData.ticket.dueDate ? new Date(ticketData.ticket.dueDate).toISOString().split('T')[0] : '',
        resolutionNotes: ticketData.ticket.resolutionNotes || '',
        tags: ticketData.ticket.tags || '',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      // Redirect to ticket detail page and refresh
      router.push(`/dashboard/tickets/${ticketId}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold">Edit Ticket #{ticket.id}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketType">Type</Label>
                  <Select
                    value={formData.ticketType}
                    onValueChange={(value) => handleInputChange('ticketType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="tech_support">Tech Support</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select
                    value={formData.assignedTo || "unassigned"}
                    onValueChange={(value) => handleInputChange('assignedTo', value === "unassigned" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                <Textarea
                  id="resolutionNotes"
                  value={formData.resolutionNotes}
                  onChange={(e) => handleInputChange('resolutionNotes', e.target.value)}
                  rows={4}
                  placeholder="Add resolution notes when resolving the ticket..."
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple tags with commas (e.g., frontend, bug, urgent)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
} 