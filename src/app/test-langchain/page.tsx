'use client';

import { useState } from 'react';

export default function TestLangChainPage() {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const testLangChain = async () => {
        if (!message.trim()) return;

        setLoading(true);
        setError('');
        setResponse('');

        try {
            const res = await fetch('/api/test-langchain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await res.json();

            if (data.success) {
                setResponse(`Provider: ${data.provider}\n\nResponse: ${data.response}`);
            } else {
                setError(data.error || 'Unknown error');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="glass-card p-8">
                    <h1 className="text-2xl font-bold text-white mb-6">🧪 LangChain Test</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2">Test Message:</label>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter a test message..."
                                className="glass-input w-full"
                                onKeyPress={(e) => e.key === 'Enter' && testLangChain()}
                            />
                        </div>

                        <button
                            onClick={testLangChain}
                            disabled={loading || !message.trim()}
                            className="glass-button glass-button-primary px-6 py-3 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test LangChain'}
                        </button>

                        {error && (
                            <div className="glass-card bg-red-500/20 border-red-400/30 p-4">
                                <p className="text-red-200">❌ Error: {error}</p>
                            </div>
                        )}

                        {response && (
                            <div className="glass-card bg-green-500/20 border-green-400/30 p-4">
                                <p className="text-green-200 whitespace-pre-wrap">✅ {response}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/20">
                        <h2 className="text-lg font-semibold text-white mb-4">🚀 Next Steps</h2>
                        <div className="space-y-2 text-white/80">
                            <p>1. Test the LangChain integration above</p>
                            <p>2. Go to <a href="/ai-generator" className="text-blue-400 hover:underline">/ai-generator</a> to test the full Voltaic system</p>
                            <p>3. Try prompts like "Create a todo app" or "Build a recipe manager"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 