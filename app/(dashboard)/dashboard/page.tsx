'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteEducationalUser, bulkInviteStudents } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Upload, Users, FileText } from 'lucide-react';
import { getInvitableRoles, getRoleDisplayName, UserRole } from '@/lib/auth/rbac';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type ActionState = {
  error?: string;
  success?: string;
  details?: {
    successful: string[];
    failed: { email: string; reason: string }[];
    skipped: string[];
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Plan: {teamData?.planName || 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                  ? 'Trial period'
                  : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
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

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {/* 
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-4">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const canInvite = user?.role === 'institution_admin' || user?.role === 'super_admin' || user?.role === 'teacher' || user?.role === 'student';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteEducationalUser, {});
  
  const [bulkInviteState, bulkInviteAction, isBulkInvitePending] = useActionState<
    ActionState,
    FormData
  >(bulkInviteStudents, {});

  // Get available roles that the current user can invite
  const invitableRoles = user ? getInvitableRoles(user.role as UserRole) : [];
  const canInviteStudents = invitableRoles.includes('student');
  const isTeacher = user?.role === 'teacher';

  // State for bulk invitation
  const [emails, setEmails] = useState('');
  const [uploadedEmails, setUploadedEmails] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedEmails(result.emails);
        setEmails(result.emails.join(', '));
      } else {
        alert(result.error || 'Failed to process file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Single Invitation
            </TabsTrigger>
            {canInviteStudents && (
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bulk Invitation
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <form action={inviteAction} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                  disabled={!canInvite}
                />
              </div>
              <div>
                <Label>Role</Label>
                <RadioGroup
                  defaultValue={invitableRoles[0] || "student"}
                  name="role"
                  className="flex space-x-4"
                  disabled={!canInvite}
                >
                  {invitableRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2 mt-2">
                      <RadioGroupItem value={role} id={role} />
                      <Label htmlFor={role}>{getRoleDisplayName(role)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {inviteState?.error && (
                <p className="text-red-500">{inviteState.error}</p>
              )}
              {inviteState?.success && (
                <p className="text-green-500">{inviteState.success}</p>
              )}
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isInvitePending || !canInvite}
              >
                {isInvitePending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Invite User
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {canInviteStudents && (
            <TabsContent value="bulk" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Upload Excel/CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isUploading ? 'Processing...' : 'Choose File'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">
                      Excel/CSV with emails in first column
                    </span>
                  </div>
                  {uploadedEmails.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="mb-2">
                        {uploadedEmails.length} emails loaded
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedEmails([]);
                          setEmails('');
                        }}
                        className="ml-2"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="bulk-emails" className="mb-2">
                    Email Addresses
                  </Label>
                  <Textarea
                    id="bulk-emails"
                    name="emails"
                    placeholder="Enter email addresses separated by commas, semicolons, or new lines&#10;Example:&#10;student1@school.com&#10;student2@school.com&#10;student3@school.com"
                    value={emails}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmails(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 50 students per bulk invitation. Separate emails with commas, semicolons, or new lines.
                  </p>
                </div>

                {bulkInviteState?.error && (
                  <p className="text-red-500">{bulkInviteState.error}</p>
                )}
                {bulkInviteState?.success && (
                  <div className="space-y-2">
                    <p className="text-green-500">{bulkInviteState.success}</p>
                    {bulkInviteState.details && (
                      <div className="text-sm space-y-1">
                        {bulkInviteState.details.successful.length > 0 && (
                          <p className="text-green-600">
                            ✅ {bulkInviteState.details.successful.length} sent successfully
                          </p>
                        )}
                        {bulkInviteState.details.skipped.length > 0 && (
                          <p className="text-yellow-600">
                            ⚠️ {bulkInviteState.details.skipped.length} skipped (already invited/member)
                          </p>
                        )}
                        {bulkInviteState.details.failed.length > 0 && (
                          <p className="text-red-600">
                            ❌ {bulkInviteState.details.failed.length} failed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <form action={bulkInviteAction} className="space-y-4">
                  <input type="hidden" name="emails" value={emails} />
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    disabled={isBulkInvitePending || !emails.trim()}
                  >
                    {isBulkInvitePending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Invitations...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Invite {emails.split(/[,;\n]/).filter(e => e.trim()).length} Students
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      {!canInvite && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You do not have permission to invite new users to this team.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Settings</h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
    </section>
  );
}
