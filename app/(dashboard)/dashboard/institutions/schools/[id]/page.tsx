'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft,
  Edit,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Building,
  UserCheck,
  Calendar,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Institution {
  id: number;
  name: string;
  type: string;
  address: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  student_count?: number;
  teacher_count?: number;
  course_count?: number;
}

export default function InstitutionViewPage() {
  const params = useParams();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchInstitution();
    }
  }, [params.id]);

  const fetchInstitution = async () => {
    try {
      const response = await fetch(`/api/institutions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInstitution(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load institution');
      }
    } catch (err) {
      console.error('Error fetching institution:', err);
      setError('Failed to load institution');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Institution not found'}
            </h3>
            <Link href="/dashboard/institutions/schools">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(institution.type);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/institutions/schools">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{institution.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getTypeColor(institution.type)}>
                {getTypeLabel(institution.type)}
              </Badge>
              <Badge variant={institution.is_active ? 'default' : 'secondary'}>
                {institution.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/institutions/schools/${institution.id}/edit`}>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Institution
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{institution.student_count || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{institution.teacher_count || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{institution.course_count || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {institution.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{institution.address}</p>
              </div>
            </div>
          )}

          {institution.contact_email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Email</p>
                <p className="text-gray-900">{institution.contact_email}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">
                {new Date(institution.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {institution.updated_at && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(institution.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
