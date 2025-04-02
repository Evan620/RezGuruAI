import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  // Fetch user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  const [userSettings, setUserSettings] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: true,
    leadAlerts: true,
    weeklyReports: true
  });
  
  // Update user settings when data loads
  if (user && userSettings.fullName === "" && userSettings.email === "") {
    setUserSettings({
      ...userSettings,
      fullName: user.fullName || "",
      email: user.username
    });
  }
  
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest("PATCH", "/api/users/me", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Settings updated",
        description: "Your account settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setUserSettings({
        ...userSettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update password: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate({
      fullName: userSettings.fullName
    });
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (userSettings.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: userSettings.currentPassword,
      newPassword: userSettings.newPassword
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update notification settings
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setUserSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account preferences and configuration</p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details and profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserInfoSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={userSettings.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        value={userSettings.email}
                        onChange={handleInputChange}
                        placeholder="Your email address"
                        disabled
                      />
                      <p className="text-xs text-gray-500">Email address cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={updateUserMutation.isPending || isLoading}
                    >
                      {updateUserMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={userSettings.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Your current password"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={userSettings.newPassword}
                        onChange={handleInputChange}
                        placeholder="Your new password"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={userSettings.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={
                        updatePasswordMutation.isPending ||
                        !userSettings.currentPassword ||
                        !userSettings.newPassword ||
                        !userSettings.confirmPassword
                      }
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Account Danger Zone */}
            <Card className="md:col-span-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={userSettings.emailNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="smsNotifications">SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via text message</p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={userSettings.smsNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="leadAlerts">Lead Alerts</Label>
                          <p className="text-sm text-gray-500">Get notified when new high-value leads are found</p>
                        </div>
                        <Switch
                          id="leadAlerts"
                          checked={userSettings.leadAlerts}
                          onCheckedChange={(checked) => handleSwitchChange("leadAlerts", checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weeklyReports">Weekly Reports</Label>
                          <p className="text-sm text-gray-500">Receive weekly performance summary reports</p>
                        </div>
                        <Switch
                          id="weeklyReports"
                          checked={userSettings.weeklyReports}
                          onCheckedChange={(checked) => handleSwitchChange("weeklyReports", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="submit" 
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Save Notification Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Current Plan: <span className="text-primary-600">Free Plan</span></h3>
                      <p className="text-sm text-gray-500 mt-1">
                        You are currently on the free plan with limited features
                      </p>
                    </div>
                    <Badge className="bg-gray-200 text-gray-800">Free</Badge>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>100 leads/month</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Basic SMS</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-times text-red-500 mr-2"></i>
                      <span className="text-gray-400">AI scoring</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-times text-red-500 mr-2"></i>
                      <span className="text-gray-400">Unlimited automations</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Available Plans</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-primary-900">Pro Plan</h4>
                      <div className="mt-1 text-2xl font-bold text-gray-900">$29<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <p className="mt-2 text-sm text-gray-500">Perfect for active real estate investors</p>
                    </div>
                    <Button className="bg-primary-600 hover:bg-primary-700">Upgrade</Button>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Unlimited leads</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>AI scoring</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Unlimited automations</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">White-label Plan</h4>
                      <div className="mt-1 text-2xl font-bold text-gray-900">$299<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <p className="mt-2 text-sm text-gray-500">For agencies and teams</p>
                    </div>
                    <Button variant="outline">Contact Sales</Button>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Custom branding</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>API access</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Team collaboration</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span>Dedicated account manager</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Need a custom solution? <a href="#" className="text-primary-600 hover:text-primary-800">Contact our sales team</a> for enterprise pricing.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage API keys and integration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm mb-6">
                  <div className="flex">
                    <i className="fas fa-exclamation-triangle mr-2 mt-0.5"></i>
                    <p>API access is a Pro feature. Upgrade your plan to generate API keys and access the RezGuru API.</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3">API Documentation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Integrate RezGuru AI with your existing systems using our comprehensive API.
                  </p>
                  <Button variant="outline" className="mr-2" disabled>
                    <i className="fas fa-key mr-2"></i> Generate API Key
                  </Button>
                  <Button variant="outline">
                    <i className="fas fa-book mr-2"></i> View Documentation
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">External Integrations</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                        <i className="fas fa-sms text-blue-600"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Twilio SMS</h4>
                        <p className="text-sm text-gray-500">Connect your Twilio account for SMS automation</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>Connect</Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center mr-3">
                        <i className="fas fa-envelope text-purple-600"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">SendGrid Email</h4>
                        <p className="text-sm text-gray-500">Connect your SendGrid account for email campaigns</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>Connect</Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center mr-3">
                        <i className="fas fa-calculator text-green-600"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">HuggingFace AI</h4>
                        <p className="text-sm text-gray-500">Connect HuggingFace for AI lead scoring</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>Connect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
