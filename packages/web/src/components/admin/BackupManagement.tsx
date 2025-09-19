'use client';

import React, { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { toast } from 'react-hot-toast';
import {
  Shield,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  HardDrive,
  Settings,
  Play,
  Archive,
} from 'lucide-react';

export default function BackupManagement() {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupType, setBackupType] = useState<'database' | 'files' | 'full'>('database');
  const [showRestore, setShowRestore] = useState(false);

  // Queries
  const backupsQuery = trpc.backup.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const statsQuery = trpc.backup.getStats.useQuery();
  const configQuery = trpc.backup.getConfig.useQuery();

  // Mutations
  const createBackupMutation = trpc.backup.create.useMutation({
    onSuccess: () => {
      toast.success("Backup created successfully");
      backupsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create backup: ${error.message}`);
    },
  });

  const deleteBackupMutation = trpc.backup.delete.useMutation({
    onSuccess: () => {
      toast.success("Backup deleted successfully");
      backupsQuery.refetch();
      statsQuery.refetch();
      setSelectedBackup(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete backup: ${error.message}`);
    },
  });

  const restoreBackupMutation = trpc.backup.restore.useMutation({
    onSuccess: () => {
      toast.success("Backup restored successfully");
      setShowRestore(false);
      setSelectedBackup(null);
    },
    onError: (error) => {
      toast.error(`Failed to restore backup: ${error.message}`);
    },
  });

  const cleanupMutation = trpc.backup.cleanup.useMutation({
    onSuccess: (data) => {
      toast.success(`Cleanup completed: ${data.deleted} backups deleted`);
      backupsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    },
  });

  const testBackupMutation = trpc.backup.test.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("All backup tests passed");
      } else {
        toast.error("Some backup tests failed");
      }
    },
    onError: (error) => {
      toast.error(`Backup test failed: ${error.message}`);
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate({
      type: backupType,
      options: {
        compression: true,
        encryption: true,
      },
    });
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      deleteBackupMutation.mutate({ backupId });
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      restoreBackupMutation.mutate({
        backupId,
        options: {
          overwrite: true,
        },
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'files':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'full':
        return <Archive className="w-4 h-4 text-purple-500" />;
      default:
        return <HardDrive className="w-4 h-4 text-gray-500" />;
    }
  };

  if (backupsQuery.isLoading || statsQuery.isLoading || configQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading backup management...
      </div>
    );
  }

  const backups = backupsQuery.data?.backups || [];
  const stats = statsQuery.data;
  const config = configQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Backup Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create, manage, and restore data backups for your tenant
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => testBackupMutation.mutate()}
            disabled={testBackupMutation.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Backup
          </button>
          <button
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Archive className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <HardDrive className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Status */}
      {config && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Backup Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Enabled</span>
              <span className={`px-2 py-1 rounded text-xs ${config.config.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {config.config.enabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Storage Type</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs uppercase">
                {config.config.storageType}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Compression</span>
              <span className={`px-2 py-1 rounded text-xs ${config.config.compressionEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {config.config.compressionEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Encryption</span>
              <span className={`px-2 py-1 rounded text-xs ${config.config.encryptionEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {config.config.encryptionEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Include Files</span>
              <span className={`px-2 py-1 rounded text-xs ${config.config.includeFiles ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {config.config.includeFiles ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">Schedule</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                {config.config.schedule}
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
                      rec.type === 'error' ? 'bg-red-50 border-red-400' :
                      rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                        {rec.action && (
                          <p className="text-xs text-gray-500 mt-1">Action: {rec.action}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Backup */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h3>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Type
            </label>
            <select
              value={backupType}
              onChange={(e) => setBackupType(e.target.value as 'database' | 'files' | 'full')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="database">Database Only</option>
              <option value="files">Files Only</option>
              <option value="full">Full Backup</option>
            </select>
          </div>
          <div className="flex-1">
            <button
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {createBackupMutation.isLoading ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No backups found. Create your first backup to get started.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(backup.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {backup.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {backup.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(Number(backup.size))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={restoreBackupMutation.isLoading}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={deleteBackupMutation.isLoading}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}