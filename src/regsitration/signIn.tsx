import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { Chrome, Github, Loader2 } from "lucide-react";
import axios from "axios";

export default function RegistrationForm() {
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");
  const navigate = useNavigate();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const registrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/auth/register", {
        mail,
        password,
      });

      toast.success("Registration successful! Please log in.", {
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });

      console.log("Registration successful:", response.data);
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });

      console.error("Registration failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      window.location.href = `${apiClient.defaults.baseURL}/auth/google/login`;
    } catch (error) {
      toast.error("Failed to connect with Google", {
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const handleGithubSignup = async () => {
    toast.error("GitHub registration is currently unavailable", {
      duration: 5000,
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <div className="relative flex min-h-screen bg-gray-950">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-[45%] bg-purple-900">
      </div>
      <div className="flex items-center justify-center w-[55%] bg-gray-900">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create an Account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details to register a new account
            </CardDescription>
          </CardHeader>
          <form onSubmit={registrationSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800 px-2 text-gray-400">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </div>
                
                <div className=" w-full flex  mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-1/2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    onClick={handleGoogleSignup}
                  >
                    <Chrome className=" w-4 mr-2 h-4 " />
                    Google
                  </Button>
                  
                  <div className="flex items-center px-2">
                    <div className="h-8 w-px bg-gray-600"></div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-1/2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 opacity-50 cursor-not-allowed"
                    disabled
                    onClick={handleGithubSignup}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <p className="text-sm text-gray-400 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-purple-400 hover:underline">
                  Sign in
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}