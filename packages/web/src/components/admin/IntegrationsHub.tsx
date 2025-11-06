'use client';

import React, { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';
import {
  Zap,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Activity,
  Mail,
  CreditCard,
  BarChart3,
  Share2,
  Database,
  MessageSquare,
  Package,
  TestTube,
  RefreshCw as Sync,
  Link as LinkIcon,
} from 'lucide-react';

interface IntegrationFormData {
  templateId: string;
  name: string;
  credentials: Record<string, string>;
  webhookUrl: string;
}

export default function IntegrationsHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<IntegrationFormData>({
    templateId: '',
    name: '',
    credentials: {},
    webhookUrl: '',
  });

  // Queries - using mock data until backend is implemented
  const templatesQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };
  const integrationsQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };
  const statsQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };

  // Mutations - using mock until backend is implemented
  const createIntegrationMutation = { mutate: (args?: any) => {}, isLoading: false };
  const updateIntegrationMutation = { mutate: (args?: any) => {}, isLoading: false };
  const deleteIntegrationMutation = { mutate: (args?: any) => {}, isLoading: false };
  const testIntegrationMutation = { mutate: (args?: any) => {}, isLoading: false };
  const syncIntegrationMutation = { mutate: (args?: any) => {}, isLoading: false };

  const resetForm = () => {
    setFormData({
      templateId: '',
      name: '',
      credentials: {},
      webhookUrl: '',
    });
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      templateId: template.id,
      name: template.name,
      credentials: {},
      webhookUrl: '',
    });
  };

  const handleCreateIntegration = () => {
    if (!selectedTemplate) return;

    createIntegrationMutation.mutate({
      templateId: formData.templateId,
      name: formData.name,
      credentials: formData.credentials,
      webhookUrl: formData.webhookUrl || undefined,
    });
  };

  const handleDeleteIntegration = (integrationId: string) => {
    if (confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      deleteIntegrationMutation.mutate({ integrationId });
    }
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    updateIntegrationMutation.mutate({
      integrationId,
      enabled: !enabled,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5" />;
      case 'social':
        return <Share2 className="w-5 h-5" />;
      case 'storage':
        return <Database className="w-5 h-5" />;
      case 'communication':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (templatesQuery.isLoading || integrationsQuery.isLoading || statsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading integrations hub...
      </div>
    );
  }

  const templates = templatesQuery.data?.templates || [];
  const integrations = integrationsQuery.data?.integrations || [];
  const stats = statsQuery.data;
  const categories = templatesQuery.data?.categories || [];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            Integrations Hub
          </h2>
          <p className="text-gray-600 mt-1">
            Connect your camp platform with external services and tools
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <LinkIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enabled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disabled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disabled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byCategory).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-1 capitalize">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Integrations */}
      {filteredIntegrations.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Active Integrations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getCategoryIcon(integration.category)}
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="flex items-center text-sm text-gray-500">
                          {getStatusIcon(integration.enabled)}
                          <span className="ml-1">{integration.enabled ? 'Active' : 'Disabled'}</span>
                        </span>
                        <span className="text-sm text-gray-500">Provider: {integration.provider}</span>
                        {integration.lastSyncAt && (
                          <span className="text-sm text-gray-500">
                            Last sync: {new Date(integration.lastSyncAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testIntegrationMutation.mutate({
                        templateId: integration.id,
                        credentials: {}, // Would need to get from secure storage
                      })}
                      disabled={testIntegrationMutation.isLoading}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm"
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </button>
                    <button
                      onClick={() => syncIntegrationMutation.mutate({ integrationId: integration.id })}
                      disabled={syncIntegrationMutation.isLoading}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center text-sm"
                    >
                      <Sync className="w-4 h-4 mr-1" />
                      Sync
                    </button>
                    <button
                      onClick={() => handleToggleIntegration(integration.id, integration.enabled)}
                      className={`px-3 py-1 rounded text-sm ${
                        integration.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {integration.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Available Integrations</h3>
          <p className="text-gray-600 mt-1">Choose from popular integrations to connect your platform</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredTemplates.map((template) => {
            const isInstalled = integrations.some(i => i.provider === template.provider);
            
            return (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getCategoryIcon(template.category)}
                    <h4 className="font-medium text-gray-900 ml-2">{template.name}</h4>
                  </div>
                  {isInstalled && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                      {template.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {template.provider}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSelectTemplate(template);
                      setShowCreateForm(true);
                    }}
                    disabled={isInstalled}
                    className={`px-3 py-1 rounded text-sm ${
                      isInstalled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isInstalled ? 'Installed' : 'Install'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Integration Modal */}
      {showCreateForm && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Install {selectedTemplate.name}</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={selectedTemplate.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-site.com/webhooks"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Credentials</h4>
                <div className="space-y-3">
                  {/* This would be dynamic based on template.requiredCredentials */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      onChange={(e) => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, api_key: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your API key"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIntegration}
                  disabled={createIntegrationMutation.isLoading || !formData.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createIntegrationMutation.isLoading ? 'Installing...' : 'Install'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}