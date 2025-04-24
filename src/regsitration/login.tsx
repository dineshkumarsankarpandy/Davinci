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

export default function LoginForm() {
  const [mail, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await apiClient.post("/auth/login", {
        mail: mail,
        password: password,
      });

      localStorage.setItem("access_token", response.data.access_token);
   
      toast.success("Login successful!", {
        duration: 8000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });

      console.log("Login successful:", response.data);

      setTimeout(() => {
         navigate("/");
      }, 5000); 
      navigate("/");

    } catch (error: any) {
    
      const errorMessage = error.response?.data?.detail || "Invalid email or password";
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });

      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = `${apiClient.defaults.baseURL}/auth/google/login`;
    } catch (error) {
      toast.error("Failed to connect with Google", {
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      console.error("Google login error:", error);
    }
  };

  const handleGithubLogin = async () => {
    toast.error("GitHub login is currently unavailable", {
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
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={loginSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={mail}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
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
                
                <div className=" w-full flex mt-2 ">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-1/2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 cursor-not-allowed"
                    onClick={handleGoogleLogin}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  
                  <div className="flex items-center px-2">
                    <div className="w-px h-8 bg-gray-600"></div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-1/2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 opacity-50 cursor-not-allowed"
                    disabled
                    onClick={handleGithubLogin}
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
                  Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
                {/* {isLoading && setTimeout(() => navigate("/dashboard"), 5000)} */}
                </Button>
                
             
              <p className="text-sm text-gray-400 text-center">
                Don't have an account?{" "}
                <a href="/sign-in" className="text-purple-400 hover:underline">
                  Sign up
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}