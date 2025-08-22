
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { SearchResults } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';

const SearchPage: React.FC = () => {
    const { query } = useParams<{ query: string }>();
    const { searchPortal, askAIAboutPortal } = useAuth();
    const [results, setResults] = useState<SearchResults | null>(null);
    const [aiAnswer, setAiAnswer] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const decodedQuery = useMemo(() => query ? decodeURIComponent(query) : '', [query]);

    useEffect(() => {
        const performSearch = async () => {
            if (!decodedQuery) return;
            setLoading(true);
            setAiAnswer('');
            
            // Local search is instant
            const localResults = searchPortal(decodedQuery);
            setResults(localResults);

            // AI search can take time
            const aiResponse = await askAIAboutPortal(decodedQuery);
            setAiAnswer(aiResponse);
            
            setLoading(false);
        };
        performSearch();
    }, [decodedQuery, searchPortal, askAIAboutPortal]);
    
    const ResultSection: React.FC<{title: string, items: any[], linkPrefix: string, displayKey: string}> = ({title, items, linkPrefix, displayKey}) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div className="space-y-3">
                    {items.map(item => (
                        <Link key={item.id} to={`${linkPrefix}${item.id}`} className="block p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
                           <p className="font-semibold text-primary-400">{item[displayKey]}</p>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">
                Search Results for: <span className="text-primary-400">"{decodedQuery}"</span>
            </h1>

            {/* AI Answer Section */}
            <div className="mb-8 p-4 bg-slate-800/80 rounded-xl border border-primary-500/30">
                <h2 className="text-xl font-semibold text-primary-400 mb-2">AI Answer</h2>
                {loading && !aiAnswer ? (
                    <SkeletonLoader className="h-10 rounded-lg" />
                ) : (
                    <p className="text-slate-300">{aiAnswer}</p>
                )}
            </div>

            {/* Manual Results Section */}
            {loading && !results ? (
                <div className="space-y-6">
                    <SkeletonLoader className="h-24 rounded-lg" />
                    <SkeletonLoader className="h-40 rounded-lg" />
                </div>
            ) : (
                <div className="space-y-8">
                    <ResultSection title="Users" items={results?.users || []} linkPrefix="/profile" displayKey="name" />
                    <ResultSection title="Forum Topics" items={results?.topics || []} linkPrefix="/forum/" displayKey="title" />
                    <ResultSection title="Resources" items={results?.resources || []} linkPrefix="/resources" displayKey="title" />
                    <ResultSection title="Events" items={results?.events || []} linkPrefix="/events" displayKey="title" />
                </div>
            )}
             {results && Object.values(results).every(arr => arr.length === 0) && !loading && (
                <p className="text-center text-slate-500 py-10">No manual results found for your query.</p>
            )}
        </div>
    );
};

export default SearchPage;