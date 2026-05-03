'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Building,
  UserCheck,
  Loader2,
  CalendarPlus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Institution {
  id: number;
  name: string;
  type: string;
  address: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  plan_name: string | null;
  student_count?: number;
  teacher_count?: number;
  admin_count?: number;
}

type AccessStatus = 'active' | 'trial' | 'trial_expired' | 'canceled' | 'no_team';

function getSubscriptionStatus(institution: Institution): { status: AccessStatus; label: string; trialDaysRemaining: number | null } {
  const { subscription_status, trial_ends_at } = institution;

  if (!subscription_status && !trial_ends_at) {
    return { status: 'no_team', label: 'No Subscription', trialDaysRemaining: null };
  }

  if (subscription_status === 'active') {
    return { status: 'active', label: 'Subscribed', trialDaysRemaining: null };
  }

  if (subscription_status === 'trialing') {
    const days = trial_ends_at
      ? Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    if (days !== null && days > 0) {
      return { status: 'trial', label: `Trial · ${days}d left`, trialDaysRemaining: days };
    }
    return { status: 'trial_expired', label: 'Trial Expired', trialDaysRemaining: 0 };
  }

  if (trial_ends_at) {
    const days = Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      return { status: 'trial', label: `Trial · ${days}d left`, trialDaysRemaining: days };
    }
    return { status: 'trial_expired', label: 'Trial Expired', trialDaysRemaining: 0 };
  }

  if (subscription_status === 'canceled' || subscription_status === 'unpaid') {
    return { status: 'canceled', label: 'Canceled', trialDaysRemaining: null };
  }

  return { status: 'no_team', label: 'No Subscription', trialDaysRemaining: null };
}

function getStatusBadgeStyle(status: AccessStatus): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'trial': return 'bg-yellow-100 text-yellow-800';
    case 'trial_expired': return 'bg-red-100 text-red-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    case 'no_team': return 'bg-gray-100 text-gray-600';
  }
}

export default function SchoolsPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [extendingId, setExtendingId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchInstitutions();
    fetchUserRole();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch('/api/institutions');
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleExtendTrial = async (institution: Institution) => {
    if (!confirm(`Extend trial for "${institution.name}" by 2 weeks? Teachers will be notified by email.`)) {
      return;
    }

    setExtendingId(institution.id);
    try {
      const response = await fetch(`/api/institutions/${institution.id}/extend-trial`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Trial extended successfully! ${data.emailsSent} teacher(s) notified. New end date: ${new Date(data.newTrialEndsAt).toLocaleDateString()}`);
        fetchInstitutions();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to extend trial');
      }
    } catch (error) {
      console.error('Error extending trial:', error);
      alert('Failed to extend trial');
    } finally {
      setExtendingId(null);
    }
  };

  const handleDelete = async (institution: Institution) => {
    if (!confirm(`Are you sure you want to delete "${institution.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(institution.id);
    try {
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInstitutions(prev => prev.filter(i => i.id !== institution.id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete institution');
      }
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert('Failed to delete institution');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (institution.address && institution.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || institution.type === typeFilter;
    const subStatus = getSubscriptionStatus(institution).status;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'subscribed' && subStatus === 'active') ||
                         (statusFilter === 'trial' && subStatus === 'trial') ||
                         (statusFilter === 'expired' && (subStatus === 'trial_expired' || subStatus === 'canceled')) ||
                         (statusFilter === 'no_subscription' && subStatus === 'no_team');

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      school: School,
      university: GraduationCap,
      language_center: Building2,
      private_tutor: UserCheck,
      corporate: Building
    };
    return icons[type as keyof typeof icons] || Building2;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      school: 'bg-blue-100 text-blue-800',
      university: 'bg-purple-100 text-purple-800',
      language_center: 'bg-green-100 text-green-800',
      private_tutor: 'bg-orange-100 text-orange-800',
      corporate: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      school: 'School',
      university: 'University',
      language_center: 'Language Center',
      private_tutor: 'Private Tutor',
      corporate: 'Corporate'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const typeStats = institutions.reduce((acc, inst) => {
    acc[inst.type] = (acc[inst.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schools & Institutions</h1>
          <p className="text-gray-600 mt-1">
            Manage educational institutions and organizations using Lingoletics.com
          </p>
        </div>
        <Link href="/dashboard/institutions/schools/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Institution
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Institutions</p>
                <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-green-600">
                  {institutions.filter(i => getSubscriptionStatus(i).status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Trial</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {institutions.filter(i => getSubscriptionStatus(i).status === 'trial').length}
                </p>
              </div>
              <School className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {institutions.filter(i => {
                    const s = getSubscriptionStatus(i).status;
                    return s === 'trial_expired' || s === 'canceled';
                  }).length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">Schools</SelectItem>
                <SelectItem value="university">Universities</SelectItem>
                <SelectItem value="language_center">Language Centers</SelectItem>
                <SelectItem value="private_tutor">Private Tutors</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="trial">In Trial</SelectItem>
                <SelectItem value="expired">Trial Expired</SelectItem>
                <SelectItem value="no_subscription">No Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInstitutions.map((institution) => {
          const TypeIcon = getTypeIcon(institution.type);
          const subStatus = getSubscriptionStatus(institution);
          return (
            <Card key={institution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="h-8 w-8 text-orange-500" />
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{institution.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge className={getTypeColor(institution.type)}>
                          {getTypeLabel(institution.type)}
                        </Badge>
                        <Badge className={getStatusBadgeStyle(subStatus.status)}>
                          {subStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${institution.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {institution.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{institution.address}</span>
                  </div>
                )}

                {institution.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{institution.contact_email}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">
                      {institution.student_count || 0}
                    </div>
                    <div className="text-gray-600 text-xs">Students</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">
                      {institution.teacher_count || 0}
                    </div>
                    <div className="text-gray-600 text-xs">Teachers</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">
                      {institution.admin_count || 0}
                    </div>
                    <div className="text-gray-600 text-xs">Admins</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm flex-wrap">
                  <span className={`${institution.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {institution.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    Added {new Date(institution.created_at).toLocaleDateString()}
                  </span>
                  {institution.plan_name && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{institution.plan_name}</span>
                    </>
                  )}
                </div>

                {userRole === 'super_admin' && (subStatus.status === 'trial' || subStatus.status === 'trial_expired') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50 border-yellow-300"
                    onClick={() => handleExtendTrial(institution)}
                    disabled={extendingId === institution.id}
                  >
                    {extendingId === institution.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CalendarPlus className="h-4 w-4 mr-1" />
                    )}
                    Extend Trial (+14 days)
                  </Button>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/institutions/schools/${institution.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/institutions/schools/${institution.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(institution)}
                    disabled={deletingId === institution.id}
                  >
                    {deletingId === institution.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInstitutions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No institutions found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more institutions.'
                : 'Get started by adding your first institution.'}
            </p>
            <Link href="/dashboard/institutions/schools/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
