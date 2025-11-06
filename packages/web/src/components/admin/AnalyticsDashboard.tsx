"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from "recharts";

interface AnalyticsDashboardProps {
  tenantId: string;
}

export default function AnalyticsDashboard({ tenantId }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  // API queries - using mock data until backend is implemented
  const overviewQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };
  const realtimeQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };
  const reportQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };
  const funnelsQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };
  const trafficQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };

  const handlePeriodChange = (period: "7d" | "30d" | "90d") => {
    setSelectedPeriod(period);
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    setSelectedDateRange({
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      end: new Date(),
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getChangeColor = (change: number | undefined) => {
    if (!change) return "text-gray-500";
    return change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500";
  };

  const getChangeIcon = (change: number | undefined) => {
    if (!change) return null;
    return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your camp's performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => {
            overviewQuery.refetch();
            realtimeQuery.refetch();
            reportQuery.refetch();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(overviewQuery.data?.totalUsers || 0)}</p>
                    {overviewQuery.data?.topInsights?.[0]?.change && (
                      <div className={`flex items-center gap-1 text-xs ${getChangeColor(overviewQuery.data.topInsights[0].change)}`}>
                        {getChangeIcon(overviewQuery.data.topInsights[0].change)}
                        {Math.abs(overviewQuery.data.topInsights[0].change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold">{formatNumber(overviewQuery.data?.pageViews || 0)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                    <p className="text-2xl font-bold">{formatDuration(overviewQuery.data?.averageSessionDuration || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(overviewQuery.data?.conversionRate || 0)}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                User Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewQuery.data?.trends.users || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {overviewQuery.data?.topInsights && overviewQuery.data.topInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewQuery.data.topInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === "positive" ? "bg-green-500" :
                        insight.type === "negative" ? "bg-red-500" :
                        "bg-blue-500"
                      }`} />
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Users</p>
                    <p className="text-3xl font-bold text-green-600">{realtimeQuery.data?.currentUsers || 0}</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-3xl font-bold text-blue-600">{realtimeQuery.data?.currentSessions || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {realtimeQuery.data?.lastUpdated 
                        ? new Date(realtimeQuery.data.lastUpdated).toLocaleTimeString()
                        : "Never"
                      }
                    </p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages Right Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realtimeQuery.data?.topPages?.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{page.page}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{page.users} users</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {realtimeQuery.data?.recentEvents?.map((event, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{event.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          {/* Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trafficQuery.data?.referrers?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={trafficQuery.data?.devices || []}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {trafficQuery.data?.devices?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trafficQuery.data?.topPages?.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{page.page}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{formatNumber(page.views)} views</span>
                      <span className="text-sm text-gray-500">{formatNumber(page.uniqueViews)} unique</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Avg. Time on Site</p>
                  <p className="text-2xl font-bold">{formatDuration(reportQuery.data?.metrics.engagement.timeOnSite || 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Pages per Session</p>
                  <p className="text-2xl font-bold">{reportQuery.data?.metrics.engagement.pagesPerSession?.toFixed(1) || "0.0"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(reportQuery.data?.metrics.overview.bounceRate || 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Journey */}
          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportQuery.data?.metrics.engagement.userJourney?.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{step.step}</span>
                        <span className="text-sm text-gray-600">{step.users} users</span>
                      </div>
                      <Progress value={step.users / (reportQuery.data?.metrics.engagement.userJourney?.[0]?.users || 1) * 100} className="h-2" />
                      {step.dropoff > 0 && (
                        <p className="text-xs text-red-600 mt-1">{step.dropoff}% drop-off</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelsQuery.data?.goals?.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-gray-600">{goal.completions} completions</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{goal.conversionRate}%</div>
                      {goal.value > 0 && (
                        <div className="text-sm text-green-600">${goal.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnels */}
          {funnelsQuery.data?.funnels?.map((funnel, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{funnel.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {funnel.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">
                        {stepIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{step.name}</span>
                          <span className="text-sm text-gray-600">{step.users} users ({step.percentage}%)</span>
                        </div>
                        <Progress value={step.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}