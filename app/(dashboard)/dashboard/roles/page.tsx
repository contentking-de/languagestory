'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  BookOpen,
  Building,
  Heart,
  Crown,
  Shield,
  Languages,
  UserPlus
} from 'lucide-react';
import { 
  UserRole, 
  Language,
  getRoleDisplayName, 
  getRoleBadgeColor,
  getLanguageDisplayName,
  getLanguageFlag,
  hasPermission,
  canManageUser,
  isTeacher,
  isStudent,
  isParent,
  isInstitutionAdmin,
  isSuperAdmin
} from '@/lib/auth/rbac';

// Mock data for demonstration
const mockCurrentUser = {
  id: 1,
  name: 'John Teacher',
  email: 'john@lingoletics.com',
  role: 'teacher' as UserRole,
  institutionId: 1,
};

const mockUsers = [
  {
    id: 2,
    name: 'Alice Student',
    email: 'alice@student.com',
    role: 'student' as UserRole,
    language: 'french' as Language,
    institutionId: 1,
  },
  {
    id: 3,
    name: 'Bob Parent',
    email: 'bob@parent.com',
    role: 'parent' as UserRole,
    language: 'all' as Language,
    institutionId: null,
  },
  {
    id: 4,
    name: 'Dr. Smith',
    email: 'smith@university.edu',
    role: 'institution_admin' as UserRole,
    language: 'all' as Language,
    institutionId: 1,
  },
];

function RoleIcon({ role }: { role: UserRole }) {
  const icons = {
    super_admin: Crown,
    institution_admin: Building,
    teacher: GraduationCap,
    student: BookOpen,
    parent: Heart,
    content_creator: UserCheck,
    member: Users,
  };
  
  const Icon = icons[role];
  return <Icon className="h-5 w-5" />;
}

function PermissionsCard({ role }: { role: UserRole }) {
  const permissions = [
    'create_class',
    'edit_class', 
    'enroll_student',
    'view_progress',
    'invite_users',
    'manage_institution'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissions for {getRoleDisplayName(role)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {permissions.map(permission => (
            <div 
              key={permission}
              className={`flex items-center gap-2 p-2 rounded ${
                hasPermission(role, permission as any) 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                hasPermission(role, permission as any) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserCard({ user, currentUser }: { user: any, currentUser: any }) {
  const canManageThisUser = canManageUser(currentUser.role, user.role);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-100">
              <RoleIcon role={user.role} />
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                {user.language && (
                  <Badge variant="outline" className="text-xs">
                    {getLanguageFlag(user.language)} {getLanguageDisplayName(user.language)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {canManageThisUser && (
            <div className="flex gap-1">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                Remove
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RoleHierarchyCard() {
  const roles: UserRole[] = [
    'super_admin',
    'institution_admin', 
    'teacher',
    'content_creator',
    'parent',
    'student',
    'member'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Role Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role, index) => (
            <div key={role} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                {roles.length - index}
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon role={role} />
                <span className="font-medium">{getRoleDisplayName(role)}</span>
              </div>
              <Badge className={getRoleBadgeColor(role)}>
                {role.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageAccessCard({ role }: { role: UserRole }) {
  const languages: Language[] = ['french', 'german', 'spanish', 'all'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Language Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {languages.map(language => (
            <div 
              key={language}
              className="flex items-center gap-2 p-3 rounded-lg border"
            >
              <span className="text-2xl">{getLanguageFlag(language)}</span>
              <div>
                <p className="font-medium">{getLanguageDisplayName(language)}</p>
                <p className="text-sm text-gray-600">
                  {language === 'all' ? 'All languages' : 'Specific language'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">
            Comprehensive educational role system for Lingoletics.com
          </p>
        </div>
        
        {hasPermission(mockCurrentUser.role, 'invite_users') && (
          <Button className="bg-orange-500 hover:bg-orange-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Current User Info */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100">
              <RoleIcon role={mockCurrentUser.role} />
            </div>
            <div>
              <h3 className="font-medium">You are logged in as:</h3>
              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(mockCurrentUser.role)}>
                  {getRoleDisplayName(mockCurrentUser.role)}
                </Badge>
                <span className="text-sm text-gray-600">{mockCurrentUser.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Hierarchy */}
        <RoleHierarchyCard />
        
        {/* Language Access */}
        <LanguageAccessCard role={selectedRole} />
      </div>

      {/* Role Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Role to View Permissions:</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(['teacher', 'student', 'parent', 'institution_admin'] as UserRole[]).map(role => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role)}
                className="justify-start"
              >
                <RoleIcon role={role} />
                <span className="ml-2">{getRoleDisplayName(role)}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <PermissionsCard role={selectedRole} />
      </div>

      {/* Users List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              currentUser={mockCurrentUser}
            />
          ))}
        </div>
      </div>

      {/* Educational Features Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Educational Features Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Institution Management</h4>
              <p className="text-sm text-gray-600">Schools, universities, language centers</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">Class Organization</h4>
              <p className="text-sm text-gray-600">Language-specific classes and groups</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <h4 className="font-semibold">Parent-Child Links</h4>
              <p className="text-sm text-gray-600">Progress monitoring for families</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 