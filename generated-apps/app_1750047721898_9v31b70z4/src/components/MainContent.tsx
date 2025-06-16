'use client';

import { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { Plus, Star, TrendingUp, Search, Bell, Users } from 'lucide-react';

interface MainContentProps {
    features: string[];
}

export function MainContent({ features }: MainContentProps) {
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem]);
            setNewItem('');
        }
    };

    const getFeatureIcon = (feature: string) => {
        if (feature.includes('search')) return <Search className="w-5 h-5" />;
        if (feature.includes('notification')) return <Bell className="w-5 h-5" />;
        if (feature.includes('user')) return <Users className="w-5 h-5" />;
        if (feature.includes('analytics')) return <TrendingUp className="w-5 h-5" />;
        return <Star className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Recipe Hub!</h2>
                <p className="text-white/70">Features: {features.join(', ')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GlassCard padding="md" hover>
                    <div className="flex items-center gap-3 mb-4">
                        <Plus className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Add New Item</h3>
                    </div>
                    <div className="space-y-3">
                        <GlassInput
                            value={newItem}
                            onChange={setNewItem}
                            placeholder="Enter item name..."
                        />
                        <GlassButton onClick={addItem} variant="primary" className="w-full">
                            Add Item
                        </GlassButton>
                    </div>
                </GlassCard>

                {features.slice(0, 2).map((feature, index) => (
                    <GlassCard key={index} padding="md" hover>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-blue-400">
                                {getFeatureIcon(feature)}
                            </div>
                            <h3 className="font-semibold text-white capitalize">{feature}</h3>
                        </div>
                        <p className="text-white/70 text-sm">
                            Your {feature} functionality will be implemented here.
                        </p>
                    </GlassCard>
                ))}
            </div>

            {items.length > 0 && (
                <GlassCard padding="md">
                    <h3 className="font-semibold text-white mb-4">Your Items ({items.length})</h3>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                <p className="text-white">{item}</p>
                                <button 
                                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}