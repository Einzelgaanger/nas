
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Package, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  // Mock data
  const stats = [
    {
      title: "Total Disbursers",
      value: 24,
      change: "+2 this month",
      icon: Users,
      color: "bg-blue-100 text-blue-700",
      gradient: "bg-gradient-blue-purple"
    },
    {
      title: "Registered Beneficiaries",
      value: 1243,
      change: "+156 this week",
      icon: UserCheck,
      color: "bg-green-100 text-green-700",
      gradient: "bg-gradient-green-blue"
    },
    {
      title: "Total Allocations",
      value: 2891,
      change: "+43 today",
      icon: Package,
      color: "bg-purple-100 text-purple-700",
      gradient: "bg-gradient-blue-purple"
    },
    {
      title: "Fraud Alerts",
      value: 12,
      change: "+3 today",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
      gradient: "bg-gradient-yellow-red"
    }
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 slide-in">Welcome, Administrator</h2>
        <p className="text-gray-600 slide-in animation-delay-100">Here's an overview of your secure aid distribution network</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="vibrant-card overflow-hidden fade-in mobile-full-width mobile-spacing"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`h-1 ${stat.gradient} w-full`}></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color} float`}>
                  <stat.icon size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="vibrant-card fade-in animation-delay-200 mobile-full-width mobile-spacing">
          <CardHeader>
            <CardTitle className="text-secure-DEFAULT">Recent Resource Allocations</CardTitle>
            <CardDescription>Latest distributions to beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Ahmed Mohamad</p>
                    <p className="text-sm text-gray-500">Mwale Region</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Food Package, Hygiene Kit</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Sarah Nyambura</p>
                    <p className="text-sm text-gray-500">Mwale Region</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Medical Kit, Food Package</p>
                    <p className="text-xs text-gray-500">25 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Joseph Kamau</p>
                    <p className="text-sm text-gray-500">Mwale Region</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Food Package, Water</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="vibrant-card fade-in animation-delay-300 mobile-full-width mobile-spacing">
          <CardHeader>
            <CardTitle className="text-red-600">Recent Fraud Alerts</CardTitle>
            <CardDescription>Potential duplicate disbursements detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition-colors duration-200">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Attempted Double Distribution</p>
                    <p className="text-sm text-gray-500">Beneficiary: Ahmed Mohamad</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-red-700">Blocked</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  Disburser: John Disburser (Mwale Region)
                </p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition-colors duration-200">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Attempted Double Distribution</p>
                    <p className="text-sm text-gray-500">Beneficiary: Mary Wanjiku</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-red-700">Blocked</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  Disburser: Anna Helper (Mwale Region)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
