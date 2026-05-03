'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  Clock,
  Loader2,
  Mail,
  Languages,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Individual {
  id: number;
  name: string | null;
  email: string;
  role: string;
  preferredLanguage: string | null;
  isActive: boolean;
  createdAt: string;
  teamName: string;
  subscriptionStatus: string | null;
  planName: string | null;
  trialEndsAt: string | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  trial: number;
  subscribed: number;
  roleCounts: Record<string, number>;
}

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchIndividuals();
  }, []);

  const fetchIndividuals = async () => {
    try {
      const response = await fetch('/api/individuals');
      if (response.ok) {
        const data = await response.json();
        setIndividuals(data.individuals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndividuals = individuals.filter((individual) => {
    const matchesSearch =
      (individual.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      individual.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || individual.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && individual.isActive) ||
      (statusFilter === 'inactive' && !individual.isActive) ||
      (statusFilter === 'trial' &&
        (individual.subscriptionStatus === 'trialing' ||
          (!individual.subscriptionStatus && individual.trialEndsAt))) ||
      (statusFilter === 'subscribed' && individual.subscriptionStatus === 'active');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      member: 'bg-purple-100 text-purple-800',
      parent: 'bg-orange-100 text-orange-800',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionBadge = (individual: Individual) => {
    if (individual.subscriptionStatus === 'active') {
      return <Badge className="bg-green-100 text-green-800">Subscribed</Badge>;
    }
    if (
      individual.subscriptionStatus === 'trialing' ||
      (!individual.subscriptionStatus && individual.trialEndsAt)
    ) {
      const trialEnd = individual.trialEndsAt ? new Date(individual.trialEndsAt) : null;
      const isExpired = trialEnd && trialEnd < new Date();
      return (
        <Badge className={isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
          {isExpired ? 'Trial Expired' : 'Trial'}
        </Badge>
      );
    }
    return <Badge className="bg-gray-100 text-gray-800">Free</Badge>;
  };

  const getLanguageLabel = (lang: string | null) => {
    const labels: Record<string, string> = {
      french: 'French',
      german: 'German',
      spanish: 'Spanish',
      all: 'All',
    };
    return lang ? labels[lang] || lang : '—';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Individual Users</h1>
        <p className="text-gray-600 mt-1">
          Overview of all individually registered users (not associated with an institution).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</p>
              </div>
              <UserX className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.trial || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.subscribed || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">User</th>
                  <th className="text-left p-4 font-medium text-gray-600">Role</th>
                  <th className="text-left p-4 font-medium text-gray-600">Language</th>
                  <th className="text-left p-4 font-medium text-gray-600">Subscription</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndividuals.map((individual) => (
                  <tr key={individual.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {individual.name || 'No name'}
                        </p>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Mail className="h-3 w-3" />
                          {individual.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRoleBadge(individual.role)}>
                        {individual.role.charAt(0).toUpperCase() + individual.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Languages className="h-4 w-4" />
                        {getLanguageLabel(individual.preferredLanguage)}
                      </div>
                    </td>
                    <td className="p-4">{getSubscriptionBadge(individual)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            individual.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className={individual.isActive ? 'text-green-600' : 'text-gray-500'}>
                          {individual.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(individual.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredIndividuals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No individuals found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more users.'
                : 'No individual users have signed up yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
