import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    fullName: "",
  });

  // If user is already logged in, redirect to homepage
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left column with forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Log in to access your RezGuru AI dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username" 
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] hover:from-[#5A46AE] hover:to-[#00D9C0]"
                  onClick={() => loginMutation.mutate(loginData)}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] bg-clip-text text-transparent">
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join RezGuru AI and transform your real estate business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-fullname">Full Name</Label>
                  <Input 
                    id="register-fullname" 
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input 
                    id="register-username" 
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="Choose a username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Create a password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] hover:from-[#5A46AE] hover:to-[#00D9C0]"
                  onClick={() => registerMutation.mutate(registerData)}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Register"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right column with hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] flex-col justify-center items-center text-white p-10">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] bg-clip-text text-transparent">
            RezGuru AI
          </h1>
          <h2 className="text-2xl font-semibold mb-6">
            The Ultimate Real Estate Automation Suite
          </h2>
          <p className="mb-8 text-lg opacity-80">
            AI-powered lead management, document generation, web scraping, and workflow automation - all in one platform designed for real estate professionals.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] p-2 mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="h-5 w-5 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">AI-Powered Lead Scoring</h3>
                <p className="text-sm opacity-70">Prioritize your leads with intelligent scoring based on motivation signals</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] p-2 mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="h-5 w-5 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Smart Document Generation</h3>
                <p className="text-sm opacity-70">Create personalized documents with one click using AI templates</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] p-2 mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="h-5 w-5 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Automated Workflows</h3>
                <p className="text-sm opacity-70">Set up automated sequences that run on autopilot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}