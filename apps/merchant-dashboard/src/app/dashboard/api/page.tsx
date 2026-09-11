'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Define interfaces for data structures
interface ApiKey {
    id: string;
    name: string;
    key: string; // This will only be available right after generation for security
    created_at: string;
    last_used_at: string | null;
    status: 'active' | 'revoked';
}

interface WebhookDelivery {
    id: string;
    timestamp: string;
    status: 'success' | 'failed';
    payload_preview: string;
    response_code: number;
    response_body_preview: string;
}

export default function ApiKeysPage() {
    // State for API Keys management
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loadingApiKeys, setLoadingApiKeys] = useState(true);
    const [errorApiKeys, setErrorApiKeys] = useState<string | null>(null);

    // State for New API Key Modal
    const [isGenerateKeyModalOpen, setIsGenerateKeyModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null); // To display the key once
    const [generatingKey, setGeneratingKey] = useState(false);
    const [generateKeyError, setGenerateKeyError] = useState<string | null>(null);

    // State for Webhook Management
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookDeliveryLogs, setWebhookDeliveryLogs] = useState<WebhookDelivery[]>([]);
    const [loadingWebhookConfig, setLoadingWebhookConfig] = useState(true);
    const [loadingDeliveryLogs, setLoadingDeliveryLogs] = useState(true);
    const [testFireStatus, setTestFireStatus] = useState<string | null>(null);
    const [savingWebhookUrl, setSavingWebhookUrl] = useState(false);
    const [webhookError, setWebhookError] = useState<string | null>(null);

    // --- Data Fetching Hooks ---

    // Simulate fetching existing API keys
    useEffect(() => {
        const fetchApiKeys = async () => {
            setLoadingApiKeys(true);
            setErrorApiKeys(null);
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 500));
                setApiKeys([
                    { id: 'key_abc123', name: 'Dashboard Integration', key: '', created_at: '2023-01-15T10:00:00Z', last_used_at: '2023-11-20T14:30:00Z', status: 'active' },
                    { id: 'key_def456', name: 'Reporting Service', key: '', created_at: '2023-03-01T08:00:00Z', last_used_at: null, status: 'active' },
                    { id: 'key_ghi789', name: 'Legacy App Key', key: '', created_at: '2022-07-01T12:00:00Z', last_used_at: '2022-09-10T16:00:00Z', status: 'revoked' },
                ]);
            } catch (err) {
                setErrorApiKeys('Failed to fetch API keys.');
                console.error(err);
            } finally {
                setLoadingApiKeys(false);
            }
        };
        fetchApiKeys();
    }, []);

    // Simulate fetching webhook configuration and delivery logs
    useEffect(() => {
        const fetchWebhookData = async () => {
            setLoadingWebhookConfig(true);
            setLoadingDeliveryLogs(true);
            setWebhookError(null);
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 600));
                setWebhookUrl('https://your-production.com/paysurity-webhook'); // Mock current URL
                setWebhookDeliveryLogs([
                    { id: 'log_001', timestamp: '2023-11-21T10:00:00Z', status: 'success', payload_preview: '{ "event": "payment.succeeded", "id": "pay_xyz" }', response_code: 200, response_body_preview: '{"status":"received"}' },
                    { id: 'log_002', timestamp: '2023-11-21T09:30:00Z', status: 'failed', payload_preview: '{ "event": "invoice.paid", "id": "inv_abc" }', response_code: 500, response_body_preview: 'Internal Server Error' },
                    { id: 'log_003', timestamp: '2023-11-20T18:00:00Z', status: 'success', payload_preview: '{ "event": "customer.created", "id": "cust_123" }', response_code: 200, response_body_preview: 'OK' },
                ]);
            } catch (err) {
                setWebhookError('Failed to fetch webhook data.');
                console.error(err);
            } finally {
                setLoadingWebhookConfig(false);
                setLoadingDeliveryLogs(false);
            }
        };
        fetchWebhookData();
    }, []);

    // --- Event Handlers ---

    // Handler for generating a new API key
    const handleGenerateApiKey = useCallback(async () => {
        if (!newKeyName.trim()) {
            setGenerateKeyError('API Key name cannot be empty.');
            return;
        }

        setGeneratingKey(true);
        setGenerateKeyError(null);
        setGeneratedApiKey(null); // Clear previous key if any

        try {
            // Simulate API call to generate key
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newKey: ApiKey = {
                id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: newKeyName.trim(),
                key: `sk_live_${Math.random().toString(36).substring(2, 18)}`, // Mock secret key
                created_at: new Date().toISOString(),
                last_used_at: null,
                status: 'active',
            };
            setApiKeys(prev => [...prev, newKey]);
            setGeneratedApiKey(newKey.key); // Display the key temporarily
            // Reset form fields after successful generation
            setNewKeyName('');
            setNewKeyDescription('');
        } catch (err) {
            setGenerateKeyError('Failed to generate API key. Please try again.');
            console.error(err);
        } finally {
            setGeneratingKey(false);
        }
    }, [newKeyName]);

    // Handler for revoking an API key
    const handleRevokeKey = useCallback(async (keyId: string) => {
        if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return;
        }

        // Optimistically update UI
        const originalKeys = [...apiKeys];
        setApiKeys(prev => prev.map(key =>
            key.id === keyId ? { ...key, status: 'revoked' } : key
        ));

        try {
            // Simulate API call to revoke key
            await new Promise(resolve => setTimeout(resolve, 800));
            // In a real app, verify backend success here. If failed, revert UI.
        } catch (err) {
            alert('Failed to revoke API key. Please try again.');
            setApiKeys(originalKeys); // Revert on error
            console.error(err);
        }
    }, [apiKeys]);

    // Handler for saving the webhook URL
    const handleSaveWebhookUrl = useCallback(async () => {
        if (!webhookUrl.trim()) {
            setWebhookError('Webhook URL cannot be empty.');
            return;
        }
        setSavingWebhookUrl(true);
        setWebhookError(null);
        try {
            // Simulate API call to save URL
            await new Promise(resolve => setTimeout(resolve, 700));
            alert('Webhook URL saved successfully!');
            // Reload webhook config if necessary, or just rely on state
        } catch (err) {
            setWebhookError('Failed to save webhook URL. Please ensure it is a valid URL.');
            console.error(err);
        } finally {
            setSavingWebhookUrl(false);
        }
    }, [webhookUrl]);

    // Handler for test-firing a webhook
    const handleTestFireWebhook = useCallback(async () => {
        if (!webhookUrl.trim()) {
            setWebhookError('Please set a Webhook URL before testing.');
            return;
        }
        setTestFireStatus('Sending test event...');
        try {
            // Simulate API call to trigger test webhook
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Simulate a new log entry after test fire
            const isSuccess = Math.random() > 0.3; // Simulate some failures
            const newLog: WebhookDelivery = {
                id: `log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: isSuccess ? 'success' : 'failed',
                payload_preview: '{ "event": "test.event", "data": { "message": "hello" } }',
                response_code: isSuccess ? 200 : 500,
                response_body_preview: isSuccess ? '{"status":"test_received"}' : '{"error":"internal_server_error"}',
            };
            setWebhookDeliveryLogs(prev => [newLog, ...prev]); // Add to the top
            setTestFireStatus(isSuccess ? 'Test event sent successfully!' : 'Test event failed to deliver. Check logs.');
        } catch (err) {
            setTestFireStatus('Failed to initiate test event.');
            console.error(err);
        } finally {
            // Clear status message after a short delay
            setTimeout(() => setTestFireStatus(null), 5000);
        }
    }, [webhookUrl]);

    // --- Render Logic ---

    return (
        <div className="container mx-auto p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">API Keys & Webhooks</h1>

            {/* API Keys Management Section */}
            <section className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">API Keys</h2>
                    <button
                        onClick={() => {
                            setIsGenerateKeyModalOpen(true);
                            setGeneratedApiKey(null);
                            setNewKeyName('');
                            setNewKeyDescription('');
                            setGenerateKeyError(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Generate New Key
                    </button>
                </div>

                {loadingApiKeys && <p className="text-gray-600">Loading API keys...</p>}
                {errorApiKeys && <p className="text-red-500">{errorApiKeys}</p>}

                {!loadingApiKeys && !errorApiKeys && apiKeys.length === 0 && (
                    <p className="text-gray-600">No API keys found. Generate one to get started.</p>
                )}

                {!loadingApiKeys && !errorApiKeys && apiKeys.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {apiKeys.map((key) => (
                                    <tr key={key.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(key.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {key.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {key.status === 'active' && (
                                                <button
                                                    onClick={() => handleRevokeKey(key.id)}
                                                    className="text-red-600 hover:text-red-900 ml-4 disabled:opacity-50"
                                                    disabled={generatingKey} // Disable during key generation for consistency
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Generate New Key Modal */}
            {isGenerateKeyModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Generate New API Key</h3>
                        {generatedApiKey ? (
                            <div>
                                <p className="mb-4 text-green-700 font-medium">Your new API key has been generated successfully. Please copy it now as it will not be shown again for security reasons.</p>
                                <div className="bg-gray-100 p-3 rounded-md break-all relative">
                                    <code className="text-gray-800 select-all pr-10">{generatedApiKey}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedApiKey)}
                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        title="Copy to clipboard"
                                    >
                                        {/* Simple copy icon (replace with SVG if available) */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsGenerateKeyModalOpen(false)}
                                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="keyName" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        id="keyName"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., My Integration Service"
                                        disabled={generatingKey}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="keyDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                    <textarea
                                        id="keyDescription"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newKeyDescription}
                                        onChange={(e) => setNewKeyDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Describe the purpose or usage of this key"
                                        disabled={generatingKey}
                                    ></textarea>
                                </div>
                                {generateKeyError && <p className="text-red-500 text-sm mb-4">{generateKeyError}</p>}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsGenerateKeyModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                                        disabled={generatingKey}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerateApiKey}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                        disabled={generatingKey || !newKeyName.trim()}
                                    >
                                        {generatingKey ? 'Generating...' : 'Generate Key'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Webhook Management Section */}
            <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Webhook Management</h2>

                {loadingWebhookConfig && <p className="text-gray-600">Loading webhook configuration...</p>}
                {webhookError && <p className="text-red-500 mb-4">{webhookError}</p>}

                {!loadingWebhookConfig && (
                    <>
                        <div className="mb-6">
                            <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">Webhook URL</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="url"
                                    id="webhookUrl"
                                    className="flex-1 block w-full border border-gray-300 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://your-domain.com/webhook-listener"
                                    disabled={savingWebhookUrl}
                                    required
                                />
                                <button
                                    onClick={handleSaveWebhookUrl}
                                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                                    disabled={savingWebhookUrl || !webhookUrl.trim()}
                                >
                                    {savingWebhookUrl ? 'Saving...' : 'Save URL'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={handleTestFireWebhook}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                disabled={!webhookUrl.trim() || testFireStatus === 'Sending test event...'}
                            >
                                Test Fire Webhook
                            </button>
                            {testFireStatus && <p className="text-sm text-gray-600">{testFireStatus}</p>}
                        </div>
                    </>
                )}

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Delivery Log</h3>
                {loadingDeliveryLogs && <p className="text-gray-600">Loading delivery logs...</p>}

                {!loadingDeliveryLogs && webhookDeliveryLogs.length === 0 && (
                    <p className="text-gray-600">No delivery logs found. Test-fire a webhook to see entries.</p>
                )}

                {!loadingDeliveryLogs && webhookDeliveryLogs.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload Preview</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {webhookDeliveryLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-all max-w-xs">{log.payload_preview}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-all max-w-xs">{log.response_code} {log.response_body_preview}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}