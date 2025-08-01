'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface ActivityFiltersProps {
  teamMembers: TeamMember[];
  currentUser: {
    role: string;
  };
}

export function ActivityFilters({ teamMembers, currentUser }: ActivityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('userId') || 'all');

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    if (selectedUserId !== 'all') params.set('userId', selectedUserId);
    
    router.push(`/dashboard/activity?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedUserId('all');
    router.push('/dashboard/activity');
  };

  // Set default date range to last 30 days
  const handleSetLast30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const handleSetLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    setDateFrom(sevenDaysAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          
          {/* User Filter (for teachers/parents) */}
          {currentUser.role !== 'student' && (
            <div className="space-y-2">
              <Label htmlFor="userSelect">Student/User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Quick Date Buttons */}
        <div className="flex gap-2 mt-4 mb-4">
          <Button variant="outline" size="sm" onClick={handleSetLast7Days}>
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" onClick={handleSetLast30Days}>
            Last 30 days
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}