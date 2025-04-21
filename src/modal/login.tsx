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

export default function LoginForm() {
  const [mail, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setPageLoading(false);
  //   }, 1500); 

  //   return () => clearTimeout(timer);
  // }, []);

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
      });

      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false); 
      
    }
  };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
//         <Loader />
//       </div>
//     );
//   }

  return (
    <div className="relative flex min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-[45%] bg-purple-500">
      </div>
      <div className="flex items-center justify-center w-[55%] bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={loginSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={mail}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full mt-8 bg-purple-600 hover:bg-pruple-400"
              >
                  "Sign In"
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <a href="/signup" className="text-primary hover:underline">
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