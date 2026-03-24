'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Loader2,
  Save,
  Building2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface InstitutionForm {
  name: string;
  type: string;
  address: string;
  contactEmail: string;
  isActive: boolean;
}

export default function InstitutionEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<InstitutionForm>({
    name: '',
    type: 'school',
    address: '',
    contactEmail: '',
    isActive: true,
  });

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
        setForm({
          name: data.name || '',
          type: data.type || 'school',
          address: data.address || '',
          contactEmail: data.contact_email || '',
          isActive: data.is_active ?? true,
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/institutions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push(`/dashboard/institutions/schools/${params.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update institution');
      }
    } catch (err) {
      console.error('Error updating institution:', err);
      setError('Failed to update institution');
    } finally {
      setSaving(false);
    }
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

  if (error && !form.name) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/institutions/schools/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Institution</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Springfield Elementary School"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="language_center">Language Center</SelectItem>
                  <SelectItem value="private_tutor">Private Tutor</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@school.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked === true }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href={`/dashboard/institutions/schools/${params.id}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
