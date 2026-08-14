import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Mail, Signature } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // Sign In / Common States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sign Up Only States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-800' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-indigo-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-800' };
    }
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (isRegister) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
      
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email address';
      }

      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    if (isRegister) {
      try {
        // Handle User Registration locally
        const registeredUsersJson = localStorage.getItem('sprintdesk_registered_users');
        const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];

        // Check if username is already taken locally or is a known DummyJSON account
        const usernameTaken = registeredUsers.some((u: any) => u.username === username.trim().toLowerCase()) ||
                              ['emilys', 'michaelw', 'alexanderj', 'sophiat', 'aryanagarwal610@gmail.com'].includes(username.trim().toLowerCase());

        if (usernameTaken) {
          setErrors({ username: 'Username already taken' });
          setIsLoading(false);
          return;
        }

        const newUser = {
          id: Date.now(),
          username: username.trim().toLowerCase(),
          password, // stored locally for local verification
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender: 'other',
          role: 'user',
          image: `https://dummyjson.com/icon/michaelw/128`, // default mock profile icon
        };

        registeredUsers.push(newUser);
        localStorage.setItem('sprintdesk_registered_users', JSON.stringify(registeredUsers));

        toast({
          title: 'Account Registered',
          description: 'You can now sign in with your credentials.',
          variant: 'success',
        });

        // Clear password and toggle back to login mode
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setIsRegister(false);
      } catch (err) {
        console.error('Registration failed:', err);
        toast({
          title: 'Registration Error',
          description: 'Failed to register account. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const loggedInUser = await login(email.trim(), password, rememberMe);
        toast({
          title: 'Authentication Successful',
          description: 'Welcome back to SprintDesk!',
          variant: 'success',
        });
        const targetPath = (from.includes('/users') && loggedInUser.role !== 'admin') ? '/dashboard' : from;
        navigate(targetPath, { replace: true });
      } catch (err: any) {
        console.error(err);
        if (err.message === 'Invalid username or password') {
          setShowRegisterPopup(true);
        } else {
          toast({
            title: 'Authentication Failed',
            description: err.message || 'Invalid email or password.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden select-none">
      {/* Decorative Neon Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border-white/10 text-center flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-200 via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            SprintDesk
          </h1>
          <p className="text-sm text-slate-400">
            {isRegister ? 'Create Your Account' : 'Sprint Management Workspace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                placeholder="John"
                leftIcon={<Signature className="h-4 w-4" />}
                className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
                leftIcon={<Signature className="h-4 w-4" />}
                className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
              />
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Enter email address"
            leftIcon={<Mail className="h-4 w-4" />}
            className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
          />

          {isRegister && (
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="Enter username"
              leftIcon={<UserIcon className="h-4 w-4" />}
              className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
            />
          )}

          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
            />

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 text-left">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.score}%</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm password"
              leftIcon={<Lock className="h-4 w-4" />}
              className="bg-slate-900/60 border-slate-800 focus:border-violet-500 text-white placeholder:text-slate-650"
            />
          )}

          {!isRegister && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-800 accent-violet-600 cursor-pointer"
                />
                Remember me
              </label>
              <span className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer hover:underline transition-all">
                Forgot Password?
              </span>
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-2 py-5 text-sm uppercase tracking-wider font-semibold">
            {isRegister ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-xs text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            type="button"
            className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition-all focus:outline-none"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showRegisterPopup}
        onClose={() => setShowRegisterPopup(false)}
        title="Account Not Found"
      >
        <div className="flex flex-col gap-4 text-center py-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The email address you entered is not registered. Please create an account first to log in.
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <Button variant="outline" onClick={() => setShowRegisterPopup(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowRegisterPopup(false);
                setIsRegister(true);
              }}
            >
              Register Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
