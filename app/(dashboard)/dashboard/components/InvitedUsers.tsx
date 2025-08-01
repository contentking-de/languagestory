'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import useSWR from 'swr';
import { getRoleDisplayName, getLanguageDisplayName, UserRole, Language } from '@/lib/auth/rbac';
import { useState } from 'react';

type Invitation = {
  id: number;
  email: string;
  role: string;
  language: string;
  status: string;
  invitedAt: string;
  inviterName: string | null;
  inviterEmail: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function InvitedUsersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Invited Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'expired':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Mail className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'secondary' as const;
    case 'accepted':
      return 'default' as const;
    case 'expired':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isInvitationExpired(invitedAt: string) {
  const invitationDate = new Date(invitedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - invitationDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 7;
}

export default function InvitedUsers() {
  const { data, error, isLoading, mutate } = useSWR<{ invitations: Invitation[] }>('/api/invitations', fetcher);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleResendInvitation = async (invitationId: number) => {
    setProcessingId(invitationId);
    try {
      const response = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          action: 'resend'
        }),
      });

      if (response.ok) {
        // Refresh the data
        mutate();
      } else {
        const errorData = await response.json();
        console.error('Failed to resend invitation:', errorData.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    if (!confirm('Are you sure you want to cancel this invitation? This action cannot be undone.')) {
      return;
    }

    setProcessingId(invitationId);
    try {
      const response = await fetch(`/api/invitations?id=${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        mutate();
      } else {
        const errorData = await response.json();
        console.error('Failed to cancel invitation:', errorData.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <InvitedUsersSkeleton />;
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invited Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load invitations.</p>
        </CardContent>
      </Card>
    );
  }

  const invitations = data?.invitations || [];

  if (invitations.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invited Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No invitations sent yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use the invitation form below to invite team members.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invited Users</CardTitle>
          <Badge variant="outline">{invitations.length} invitation{invitations.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const expired = invitation.status === 'pending' && isInvitationExpired(invitation.invitedAt);
            const currentStatus = expired ? 'expired' : invitation.status;
            
            return (
              <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {invitation.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{invitation.email}</p>
                      <Badge variant={getStatusBadgeVariant(currentStatus)} className="flex items-center gap-1">
                        {getStatusIcon(currentStatus)}
                        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{getRoleDisplayName(invitation.role as UserRole)}</span>
                      <span>•</span>
                      <span>{getLanguageDisplayName(invitation.language as Language)}</span>
                      <span>•</span>
                      <span>Invited {formatDate(invitation.invitedAt)}</span>
                      {invitation.inviterName && (
                        <>
                          <span>•</span>
                          <span>by {invitation.inviterName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentStatus === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={processingId === invitation.id}
                      onClick={() => handleResendInvitation(invitation.id)}
                    >
                      {processingId === invitation.id ? (
                        <RotateCcw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-1" />
                      )}
                      Resend
                    </Button>
                  )}
                  {currentStatus === 'expired' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={processingId === invitation.id}
                      onClick={() => handleResendInvitation(invitation.id)}
                    >
                      {processingId === invitation.id ? (
                        <RotateCcw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1" />
                      )}
                      Resend
                    </Button>
                  )}
                  {(currentStatus === 'pending' || currentStatus === 'expired') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={processingId === invitation.id}
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}