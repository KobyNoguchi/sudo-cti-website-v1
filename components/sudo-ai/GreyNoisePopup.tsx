'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { TransformedGreyNoiseFeed, GreyNoiseItem, ParsedDescription } from '@/lib/ai/types';

interface GreyNoisePopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItems: GreyNoiseItem[];
  onToggleItem: (item: GreyNoiseItem) => void;
}

function getIntentionColor(intention: string | null): string {
  if (!intention) return 'bg-slate-700 text-slate-300';
  switch (intention.toLowerCase()) {
    case 'benign':
      return 'bg-green-900/50 text-green-400 border border-green-700';
    case 'malicious':
      return 'bg-red-900/50 text-red-400 border border-red-700';
    default:
      return 'bg-slate-700 text-slate-300';
  }
}

export default function GreyNoisePopup({ isOpen, onOpenChange, selectedItems, onToggleItem }: GreyNoisePopupProps) {
  const [feedData, setFeedData] = useState<TransformedGreyNoiseFeed | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !feedData) {
      const fetchGreyNoiseData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/greynoise');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch GreyNoise data: ${response.status}`);
          }
          const data: TransformedGreyNoiseFeed = await response.json();
          setFeedData(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred while fetching GreyNoise data');
          }
        }
        setIsLoading(false);
      };
      fetchGreyNoiseData();
    }
  }, [isOpen, feedData]);

  const renderDescription = (desc: ParsedDescription) => (
    <div className="mt-2 space-y-2 text-sm">
      {desc.summaryText && <p className="text-slate-300">{desc.summaryText}</p>}
      <div className="flex flex-wrap gap-2 items-center text-xs mt-1">
        {desc.category && (
          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
            {desc.category}
          </span>
        )}
        {desc.intention && (
          <span className={`px-2 py-1 rounded-full ${getIntentionColor(desc.intention)}`}>
            {desc.intention}
          </span>
        )}
        {desc.recommendBlock !== null && (
          <span className={`px-2 py-1 rounded-full ${desc.recommendBlock ? 'bg-red-900/50 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
            Block: {desc.recommendBlock ? 'Yes' : 'No'}
          </span>
        )}
      </div>
      {desc.references && desc.references.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold text-xs text-slate-400">References:</h4>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {desc.references.map((ref, index) => (
              ref.url && (
                <li key={index} className="text-xs">
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    {ref.text || ref.url}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Dialog isOpen={isOpen} onClose={() => onOpenChange(false)} className="max-w-4xl h-[85vh] flex flex-col">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>{feedData?.feedTitle || 'GreyNoise Intelligence Feed'}</DialogTitle>
        <DialogDescription>
          {feedData ? `${feedData.feedDescription || 'Latest threat intelligence from GreyNoise.'} Displaying ${feedData.items.length} items.` : 'Loading feed details...'}
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="flex-grow overflow-y-auto bg-slate-900/50">
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-300">Loading GreyNoise data...</span>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!isLoading && !error && (!feedData || feedData.items.length === 0) && (
          <p className="text-center text-slate-500">No GreyNoise feed items found.</p>
        )}
        {!isLoading && !error && feedData && feedData.items.length > 0 && (
          <div className="space-y-4">
            {feedData.items.map((item: GreyNoiseItem) => {
              const isSelected = selectedItems.some(selected => selected.guid === item.guid);
              return (
                <div key={item.guid} className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-1">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {item.title}
                        </a>
                      ) : item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      Published: {new Date(item.pubDate).toLocaleString()}
                    </p>
                    {renderDescription(item.description)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                    <Button
                      size="sm"
                      variant={isSelected ? "outline" : "primary"}
                      onClick={() => onToggleItem(item)}
                    >
                      {isSelected ? 'Remove from Context' : 'Add to Context'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <div></div>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}

