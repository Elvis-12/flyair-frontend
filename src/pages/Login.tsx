import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plane, Eye, EyeOff } from 'lucide-react';
import { ApiResponse, User, AuthenticationResponse } from '@/types';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    twoFactorCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (requiresTwoFactor) {
        const response = await apiService.verify2FA({
          temporaryToken: temporaryToken as string,
          code: formData.twoFactorCode
        });
        if (response.data.success) {
          const authResponse = response.data.data;
          login(authResponse.accessToken, authResponse.user);
          toast({
            title: 'Success',
            description: 'Successfully logged in with 2FA!',
          });
          navigate(from, { replace: true });
        }
      } else {
        console.log('Sending login credentials:', formData);
        const response = await apiService.login({
          username: formData.username,
          password: formData.password
        });
        
        if (response.data.success) {
          const authResponse = response.data.data;
          
          if (authResponse.requiresTwoFactor) {
            setRequiresTwoFactor(true);
            setTemporaryToken(authResponse.temporaryToken);
            toast({
              title: 'Two-Factor Authentication Required',
              description: 'Please enter your 2FA code to complete login.',
            });
          } else {
            login(authResponse.accessToken, authResponse.user);
            toast({
              title: 'Success',
              description: 'Successfully logged in!',
            });
            navigate(from, { replace: true });
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to FlyAir
          </CardTitle>
          <CardDescription>
            {requiresTwoFactor ? 'Enter your 2FA code' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">2FA Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Enter your 6-digit code"
                  value={formData.twoFactorCode}
                  onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                  maxLength={6}
                  required
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : requiresTwoFactor ? 'Verify Code' : 'Sign In'}
            </Button>
          </form>
          
          {!requiresTwoFactor && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          )}
          
          {requiresTwoFactor && (
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setRequiresTwoFactor(false)}
                className="text-sm"
              >
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
