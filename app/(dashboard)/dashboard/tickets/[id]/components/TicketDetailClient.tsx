'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, MessageSquare, Clock, User, Tag, Calendar, AlertCircle, Wrench, Lightbulb } from 'lucide-react';

interface Ticket {
  id: number;
  title: string;
  description: string;
  ticketType: string;
  priority: string;
  status: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  updatedBy?: {
    id: number;
    name: string;
    email: string;
  };
  dueDate?: string;
  resolutionNotes?: string;
  tags?: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface TicketComment {
  id: number;
  ticketId: number;
  content: string;
  isInternal: boolean;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface TicketHistory {
  id: number;
  ticketId: number;
  field: string;
  oldValue?: string;
  newValue?: string;
  updatedBy: {
    id: number;
    name: string;
    email: string;
  };
  updatedAt: string;
}

interface TicketDetailClientProps {
  ticketId: number;
}

export default function TicketDetailClient({ ticketId }: TicketDetailClientProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      const data = await response.json();
      setTicket(data.ticket);
      
      // Transform comments to match frontend interface
      const transformedComments = (data.comments || []).map((comment: any) => ({
        id: comment.id,
        ticketId: ticketId,
        content: comment.comment,
        isInternal: comment.isInternal,
        createdBy: {
          id: comment.userId,
          name: comment.userName,
          email: comment.userEmail,
        },
        createdAt: comment.createdAt,
      }));
      setComments(transformedComments);
      
      // Transform history to match frontend interface
      const transformedHistory = (data.history || []).map((item: any) => ({
        id: item.id,
        ticketId: ticketId,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        updatedBy: {
          id: item.userId,
          name: item.userName,
          email: item.userEmail,
        },
        updatedAt: item.updatedAt,
      }));
      setHistory(transformedHistory);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          isInternal: isInternalComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const responseData = await response.json();
      const newCommentData = {
        id: responseData.comment.id,
        ticketId: ticketId,
        content: responseData.comment.comment,
        isInternal: responseData.comment.isInternal,
        createdBy: {
          id: responseData.comment.userId,
          name: responseData.comment.userName,
          email: responseData.comment.userEmail,
        },
        createdAt: responseData.comment.createdAt,
      };
      setComments([...comments, newCommentData]);
      setNewComment('');
      setIsInternalComment(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <AlertCircle className="w-4 h-4" />;
      case 'tech_support': return <Wrench className="w-4 h-4" />;
      case 'feature_request': return <Lightbulb className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return 'Bug';
      case 'tech_support': return 'Tech Support';
      case 'feature_request': return 'Feature Request';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading ticket details...</div>
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
          <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/tickets/${ticketId}/edit`)}
          className="flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Ticket</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{ticket.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(ticket.ticketType)}
                    <Badge variant="outline">{getTypeLabel(ticket.ticketType)}</Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Resolution Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                </div>
              )}

              {ticket.tags && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Comments ({comments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="comment" className="font-medium">
                    Add Comment
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="internal-comment"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                    />
                    <Label htmlFor="internal-comment" className="text-sm">
                      Internal comment
                    </Label>
                  </div>
                </div>
                <Textarea
                  id="comment"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  size="sm"
                >
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      comment.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{comment.createdBy?.name || 'Unknown'}</span>
                        {comment.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="font-medium">{ticket.createdBy?.name || 'Unknown'}</p>
                </div>
              </div>

              {ticket.assignedTo && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned to</p>
                    <p className="font-medium">{ticket.assignedTo?.name || 'Unknown'}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Updated</p>
                  <p className="font-medium">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>

              {ticket.dueDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{formatDate(ticket.dueDate)}</p>
                  </div>
                </div>
              )}

              {ticket.resolvedAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.field}</span>
                        <span className="text-gray-500">{formatDate(item.updatedAt)}</span>
                      </div>
                      <div className="text-gray-600">
                        {item.oldValue && <span className="line-through">{item.oldValue}</span>}
                        {item.oldValue && item.newValue && <span> → </span>}
                        {item.newValue && <span>{item.newValue}</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {item.updatedBy?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 