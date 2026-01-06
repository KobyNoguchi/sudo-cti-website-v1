'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Search, X, Plus } from 'lucide-react';
import { mitreICSMatrixData, Tactic, Technique } from '@/lib/ai/mitre/mitreICSData';

interface MitreAttackMatrixModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedTechniquesForContext: Technique[];
  onToggleTechniqueForContext: (technique: Technique) => void;
}

export default function MitreAttackMatrixModal({
  isOpen, 
  onOpenChange, 
  selectedTechniquesForContext, 
  onToggleTechniqueForContext 
}: MitreAttackMatrixModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Technique[]>([]);

  const allTechniques = useMemo(() => 
    mitreICSMatrixData.flatMap(tactic => tactic.techniques), 
    []
  );

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = allTechniques.filter(technique =>
      technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technique.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, allTechniques]);

  const handleSearchResultClick = (technique: Technique) => {
    onToggleTechniqueForContext(technique);
    setSearchTerm("");
    setSearchResults([]);
  };

  const isTechniqueSelectedInContext = (techniqueId: string) => {
    return selectedTechniquesForContext.some(t => t.id === techniqueId);
  }

  return (
    <Dialog isOpen={isOpen} onClose={() => onOpenChange(false)} className="max-w-[95vw] w-full max-h-[90vh] flex flex-col">
      <DialogHeader className="flex flex-col sm:flex-row justify-between items-start">
        <div className="flex-grow">
          <DialogTitle>MITRE ATT&CK ICS Matrix</DialogTitle>
          <DialogDescription>
            Select techniques to add to context. Click cells in the matrix or use the search bar.
          </DialogDescription>
        </div>
        <div className="relative mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(technique => (
                  <div
                    key={technique.id}
                    onClick={() => handleSearchResultClick(technique)}
                    className={`p-2 text-sm cursor-pointer hover:bg-slate-700 ${isTechniqueSelectedInContext(technique.id) ? 'bg-slate-700 font-semibold text-cyan-400' : 'text-slate-300'}`}
                  >
                    {technique.name} ({technique.id})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-slate-400 hover:text-slate-200 border border-slate-600 rounded-lg hover:bg-slate-700"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {selectedTechniquesForContext.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                {selectedTechniquesForContext.length}
              </span>
            )}
          </div>
        </div>
      </DialogHeader>

      <DialogContent className="overflow-auto flex-grow p-4">
        <div className="grid grid-cols-12 gap-px bg-slate-700 rounded-lg overflow-hidden">
          {mitreICSMatrixData.map((tactic: Tactic) => (
            <div key={tactic.name} className="flex flex-col bg-slate-800">
              <div 
                className="p-2 font-bold text-center text-xs border-b border-slate-700 sticky top-0 bg-slate-800 text-slate-200 z-10 whitespace-nowrap overflow-hidden text-ellipsis"
                title={tactic.name}
              >
                {tactic.name}
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto">
                {tactic.techniques.map((technique: Technique, idx) => (
                  <div
                    key={technique.id}
                    className={`p-2 text-xs cursor-pointer transition-colors duration-150 
                      ${isTechniqueSelectedInContext(technique.id) 
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"}
                      ${idx < tactic.techniques.length - 1 ? 'border-b border-slate-700' : ''}
                    `}
                    onClick={() => onToggleTechniqueForContext(technique)}
                    title={`${technique.name} (${technique.id})`}
                  >
                    {technique.name}
                    <span className="text-slate-500 ml-1">({technique.id})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>

      <DialogFooter>
        <div></div>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

