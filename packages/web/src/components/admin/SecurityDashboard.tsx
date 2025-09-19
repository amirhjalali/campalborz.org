'use client';

import React, { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { toast } from 'react-hot-toast';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  Lock,
  Key,
  Activity,
  Clock,
  Users,
  Scan,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function SecurityDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Queries
  const dashboardQuery = trpc.security.getDashboard.useQuery();
  const metricsQuery = trpc.security.getMetrics.useQuery({ timeRange: selectedTimeRange });
  const configQuery = trpc.security.getConfig.useQuery();
  const alertsQuery = trpc.security.getSecurityAlerts.useQuery();
  const auditLogsQuery = trpc.security.getAuditLogs.useQuery({
    limit: 50,
    offset: 0,
  }, { enabled: showAuditLogs });

  // Mutations
  const runScanMutation = trpc.security.runSecurityScan.useMutation({
    onSuccess: () => {
      toast.success("Security scan completed");
      dashboardQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Security scan failed: ${error.message}`);
    },
  });

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (dashboardQuery.isLoading || metricsQuery.isLoading || configQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading security dashboard...
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const metrics = metricsQuery.data;
  const config = configQuery.data;
  const alerts = alertsQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Security Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage your platform's security posture
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Audit Logs
          </button>
          <button
            onClick={() => runScanMutation.mutate({ includeVulnerabilities: true, includeMetrics: true })}
            disabled={runScanMutation.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Scan className="w-4 h-4 mr-2" />
            {runScanMutation.isLoading ? 'Scanning...' : 'Run Security Scan'}
          </button>
        </div>
      </div>

      {/* Security Score & Overview */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className={`text-3xl font-bold ${getSecurityScoreColor(dashboard.securityScore).split(' ')[0]}`}>
                  {dashboard.securityScore}
                </p>
                <p className="text-sm text-gray-500">out of 100</p>
              </div>
              <div className={`p-3 rounded-lg ${getSecurityScoreColor(dashboard.securityScore)}`}>
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.metrics.criticalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Events</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.metrics.errorEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.metrics.totalEvents}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Selector for Metrics */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Security Metrics</h3>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events by Type */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Events by Type</h4>
            <div className="space-y-3">
              {Object.entries(metrics.eventsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Events by Severity */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Events by Severity</h4>
            <div className="space-y-3">
              {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getSeverityIcon(severity)}
                    <span className="text-sm text-gray-600 ml-2">{severity}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top IPs */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Top IP Addresses</h4>
            <div className="space-y-3">
              {metrics.topIPs.slice(0, 5).map((ipData, index) => (
                <div key={ipData.ip} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{ipData.ip}</span>
                  <span className="text-sm font-medium text-gray-900">{ipData.count} requests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Activity Timeline</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {metrics.timeline.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center">
                    {getSeverityIcon(item.severity)}
                    <span className="ml-2 text-gray-900">{item.count} events</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vulnerabilities */}
      {dashboard?.vulnerabilities && dashboard.vulnerabilities.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Security Vulnerabilities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.vulnerabilities.map((vuln, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <h4 className="font-medium text-gray-900">{vuln.type.replace('_', ' ')}</h4>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{vuln.description}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Recommendation:</strong> {vuln.recommendation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Affected:</strong> {vuln.affected}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Configuration */}
      {config && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Two-Factor Auth</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  config.config.twoFactorAuth.enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {config.config.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium">Password Policy</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  config.config.passwordPolicy.minLength >= 8
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {config.config.passwordPolicy.minLength >= 8 ? 'Strong' : 'Weak'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-sm font-medium">Session Timeout</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {config.config.sessionManagement.sessionTimeout / 3600}h
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {config.recommendations && config.recommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {config.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        rec.enabled 
                          ? 'bg-green-50 border-green-400'
                          : 'bg-yellow-50 border-yellow-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{rec.title}</p>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                        {rec.enabled ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Security Alerts */}
      {alerts && alerts.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
            <p className="text-sm text-gray-600 mt-1">Critical and error events from the last 24 hours</p>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {alerts.alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-2 font-medium text-gray-900">{alert.action.replace('_', ' ')}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span>IP: {alert.ip}</span>
                      {alert.user && <span className="ml-4">User: {alert.user.name}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && auditLogsQuery.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Logs</h3>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="divide-y divide-gray-200">
                {auditLogsQuery.data.logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {getSeverityIcon(log.severity)}
                          <span className="ml-2 font-medium text-gray-900">{log.action}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span>Resource: {log.resource}</span>
                          <span className="ml-4">IP: {log.ip}</span>
                          {log.user && <span className="ml-4">User: {log.user.name}</span>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}