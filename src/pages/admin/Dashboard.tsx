import React from "react";
import { 
  Users, Box, AlertTriangle, TrendingUp, 
  Calendar, Clock, CheckCircle, XCircle 
} from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      title: "Total Disbursers",
      value: "24",
      change: "+12% from last month",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Registered Beneficiaries",
      value: "2,583",
      change: "+18% from last month",
      trend: "up",
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      title: "Resource Allocations",
      value: "486",
      change: "+5% from last month",
      trend: "up",
      icon: Box,
      color: "bg-purple-500",
    },
    {
      title: "Fraud Alerts",
      value: "12",
      change: "-3% from last month",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  const recentActivity = [
    { 
      id: 1, 
      action: "New beneficiary registered", 
      user: "John Disburser", 
      time: "10 minutes ago",
      icon: CheckCircle,
      color: "text-emerald-500", 
    },
    { 
      id: 2, 
      action: "Resource allocation completed", 
      user: "Maria Handler", 
      time: "1 hour ago",
      icon: Box,
      color: "text-blue-500", 
    },
    { 
      id: 3, 
      action: "Fraud alert raised", 
      user: "System", 
      time: "3 hours ago",
      icon: AlertTriangle,
      color: "text-red-500", 
    },
    { 
      id: 4, 
      action: "New disburser account created", 
      user: "Admin", 
      time: "5 hours ago",
      icon: Users,
      color: "text-purple-500", 
    },
    { 
      id: 5, 
      action: "Daily audit completed", 
      user: "System", 
      time: "12 hours ago",
      icon: CheckCircle,
      color: "text-emerald-500", 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center mt-4 md:mt-0 gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Last updated 5m ago</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className={`h-4 w-4 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
              <span className={`text-xs ml-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - 2/3 width */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Resource Allocation Trends</h2>
          <div className="h-80 flex items-center justify-center border border-gray-100 rounded-md bg-gray-50">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        {/* Activity Feed - 1/3 width */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{activity.user}</span>
                    <span className="mx-1">•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-center text-emerald-600 hover:text-emerald-700 font-medium">
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-lg shadow-md text-white">
          <h3 className="font-medium mb-2">Register New Beneficiary</h3>
          <p className="text-sm text-emerald-100 mb-4">Quickly add a new beneficiary to the system</p>
          <button className="px-4 py-2 bg-white text-emerald-600 rounded-md text-sm font-medium hover:bg-emerald-50 transition-colors">
            Get Started
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <h3 className="font-medium mb-2">Allocate Resources</h3>
          <p className="text-sm text-blue-100 mb-4">Distribute resources to registered beneficiaries</p>
          <button className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors">
            Allocate Now
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
          <h3 className="font-medium mb-2">System Reports</h3>
          <p className="text-sm text-purple-100 mb-4">View and download detailed system reports</p>
          <button className="px-4 py-2 bg-white text-purple-600 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
} 