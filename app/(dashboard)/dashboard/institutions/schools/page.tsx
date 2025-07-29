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
  Users,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Building,
  UserCheck
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface Institution {
  id: number;
  name: string;
  type: string;
  address: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  student_count?: number;
  teacher_count?: number;
  course_count?: number;
}

export default function SchoolsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInstitutions();
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

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (institution.address && institution.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || institution.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && institution.is_active) ||
                         (statusFilter === 'inactive' && !institution.is_active);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schools & Institutions</h1>
          <p className="text-gray-600 mt-1">
            Manage educational institutions and organizations using A Language Story
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Institution
        </Button>
      </div>

      {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {institutions.filter(i => i.is_active).length}
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
                <p className="text-sm font-medium text-gray-600">Schools</p>
                <p className="text-2xl font-bold text-blue-600">
                  {typeStats.school || 0}
                </p>
              </div>
              <School className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Universities</p>
                <p className="text-2xl font-bold text-purple-600">
                  {typeStats.university || 0}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInstitutions.map((institution) => {
          const TypeIcon = getTypeIcon(institution.type);
          return (
            <Card key={institution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="h-8 w-8 text-orange-500" />
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{institution.name}</CardTitle>
                      <Badge className={getTypeColor(institution.type)}>
                        {getTypeLabel(institution.type)}
                      </Badge>
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
                      {institution.course_count || 0}
                    </div>
                    <div className="text-gray-600 text-xs">Courses</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <span className={`${institution.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {institution.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    Added {new Date(institution.created_at).toLocaleDateString()}
                  </span>
                </div>

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Institution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 