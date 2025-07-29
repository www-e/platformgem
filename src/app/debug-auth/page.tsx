// src/app/debug-auth/page.tsx
// Debug page to test authentication flow - REMOVE IN PRODUCTION

import { auth } from '@/lib/auth';
import { getRoleBasedRedirectUrl } from '@/lib/auth-redirects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DebugAuthPage() {
  const session = await auth();
  
  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Debug Page</h1>
      <p className="text-muted-foreground">This page helps debug authentication issues</p>
      
      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {session.user.id}</p>
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {session.user.phone}</p>
              <p><strong>Role:</strong> <Badge>{session.user.role}</Badge></p>
              <p><strong>Is Active:</strong> {session.user.isActive ? '✅' : '❌'}</p>
              <p><strong>Expected Redirect:</strong> {getRoleBasedRedirectUrl(session.user.role)}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </CardContent>
      </Card>

      {/* Navigation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/professor">Professor Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Student Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/courses">Courses (Public)</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Signup</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Recommendations */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations for {session.user.role}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.user.role === 'ADMIN' && (
                <>
                  <p>✅ You should be able to access: /admin, /professor, /dashboard, /courses</p>
                  <p>❌ You should be redirected from: /login, /signup (when logged in)</p>
                </>
              )}
              {session.user.role === 'PROFESSOR' && (
                <>
                  <p>✅ You should be able to access: /professor, /courses</p>
                  <p>❌ You should be blocked from: /admin</p>
                  <p>❌ You should be redirected from: /login, /signup (when logged in)</p>
                </>
              )}
              {session.user.role === 'STUDENT' && (
                <>
                  <p>✅ You should be able to access: /dashboard, /profile, /courses</p>
                  <p>❌ You should be blocked from: /admin, /professor</p>
                  <p>❌ You should be redirected from: /login, /signup (when logged in)</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check if your session information above is correct</li>
            <li>Try clicking the navigation buttons above</li>
            <li>Verify you are redirected to the correct pages</li>
            <li>Check browser network tab for redirect responses</li>
            <li>If issues persist, check middleware logs in terminal</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}