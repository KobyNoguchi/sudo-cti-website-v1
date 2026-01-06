'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Search, Plus } from 'lucide-react';
import { mitreEnterpriseMatrixData, Tactic, Technique } from '@/lib/ai/mitre/mitreEnterpriseData';

interface MitreEnterpriseMatrixModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedTechniquesForContext: Technique[];
  onToggleTechniqueForContext: (technique: Technique) => void;
}

export default function MitreEnterpriseMatrixModal({
  isOpen,
  onOpenChange,
  selectedTechniquesForContext,
  onToggleTechniqueForContext,
}: MitreEnterpriseMatrixModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTactics, setFilteredTactics] = useState<Tactic[]>(mitreEnterpriseMatrixData);
  const selectedTechniqueIds = useMemo(() => new Set(selectedTechniquesForContext.map(t => t.id)), [selectedTechniquesForContext]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTactics(mitreEnterpriseMatrixData);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = mitreEnterpriseMatrixData.map(tactic => {
      const techniques = tactic.techniques.filter(
        technique =>
          technique.name.toLowerCase().includes(lowercasedFilter) ||
          technique.id.toLowerCase().includes(lowercasedFilter)
      );
      return { ...tactic, techniques };
    }).filter(tactic => tactic.techniques.length > 0);
    
    setFilteredTactics(filtered);
  }, [searchTerm]);
  
  return (
    <Dialog isOpen={isOpen} onClose={() => onOpenChange(false)} className="max-w-7xl w-[90vw] h-[90vh] flex flex-col">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>MITRE ATT&CK® Enterprise Matrix</DialogTitle>
        <DialogDescription>
          Select techniques to add them to the AI context.
        </DialogDescription>
      </DialogHeader>
      
      <div className="p-4 border-b border-slate-700 flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search techniques by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="relative">
          <button
            className="p-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700"
            onClick={() => onOpenChange(false)}
            title="Apply context selections and close"
          >
            <Plus className="h-4 w-4" />
          </button>
          {selectedTechniquesForContext.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {selectedTechniquesForContext.length}
            </span>
          )}
        </div>
      </div>

      <DialogContent className="flex-grow overflow-x-auto overflow-y-hidden p-4">
        <div className="flex space-x-2 h-full">
          {filteredTactics.map(tactic => (
            <div key={tactic.name} className="flex-shrink-0 w-64 bg-slate-800/50 rounded-lg h-full flex flex-col border border-slate-700">
              <div className="p-2 border-b border-slate-700">
                <h3 className="font-bold text-center text-slate-200 truncate" title={tactic.name}>
                  {tactic.name}
                </h3>
                <p className="text-xs text-slate-500 text-center">
                  {tactic.techniques.length} techniques
                </p>
              </div>
              <div className="overflow-y-auto flex-grow p-1">
                {tactic.techniques.map(technique => {
                  const isSelected = selectedTechniqueIds.has(technique.id);
                  return (
                    <div
                      key={technique.id}
                      onClick={() => onToggleTechniqueForContext(technique)}
                      className={`p-1.5 my-0.5 rounded-md cursor-pointer text-sm flex justify-between items-center ${
                        isSelected
                          ? 'bg-cyan-600/80 text-white'
                          : 'hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="truncate pr-2">{technique.name}</span>
                      <span className="text-slate-400/50 text-xs">{technique.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

