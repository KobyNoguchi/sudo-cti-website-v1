'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CisaFeed, CisaVulnerability } from '@/lib/ai/types';

interface CisaKevPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedVulnerabilitiesForContext: CisaVulnerability[];
  onToggleVulnerabilityForContext: (vulnerability: CisaVulnerability) => void;
}

// Helper function to get NVD link
function getNvdLink(notes: string, cveId: string): string {
  const nvdRegex = /https:\/\/nvd\.nist\.gov\/vuln\/detail\/[^\s;]+/
  const match = notes.match(nvdRegex);
  if (match) {
    return match[0];
  }
  return `https://nvd.nist.gov/vuln/detail/${cveId}`;
}

const ITEMS_PER_PAGE = 10;

export default function CisaKevPopup({ 
  isOpen, 
  onOpenChange, 
  selectedVulnerabilitiesForContext, 
  onToggleVulnerabilityForContext 
}: CisaKevPopupProps) {
  const [feedData, setFeedData] = useState<CisaFeed | null>(null);
  const [allVulnerabilities, setAllVulnerabilities] = useState<CisaVulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && !feedData) {
      const fetchVulnerabilities = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/cisa-kev');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch data: ${response.status}`);
          }
          const data: CisaFeed = await response.json();
          setFeedData(data);
          setAllVulnerabilities(data.vulnerabilities || []);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
          setAllVulnerabilities([]);
        }
        setIsLoading(false);
      };
      fetchVulnerabilities();
    }
  }, [isOpen, feedData]);

  const selectedCveIds = useMemo(() => {
    return new Set(selectedVulnerabilitiesForContext.map(v => v.cveID));
  }, [selectedVulnerabilitiesForContext]);

  const filteredVulnerabilities = useMemo(() => {
    if (!searchTerm) {
      return allVulnerabilities;
    }
    return allVulnerabilities.filter(vuln => 
      vuln.vulnerabilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.cveID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.vendorProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.dateAdded.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVulnerabilities, searchTerm]);

  const paginatedVulnerabilities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredVulnerabilities.slice(startIndex, endIndex);
  }, [filteredVulnerabilities, currentPage]);

  const totalPages = Math.ceil(filteredVulnerabilities.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Dialog isOpen={isOpen} onClose={() => onOpenChange(false)} className="max-w-4xl h-[85vh] flex flex-col">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>CISA Known Exploited Vulnerabilities</DialogTitle>
        {feedData && (
          <DialogDescription>
            {feedData.title} (Updated: {new Date(feedData.dateReleased).toLocaleDateString()}) - {filteredVulnerabilities.length} of {allVulnerabilities.length} vulnerabilities shown
          </DialogDescription>
        )}
      </DialogHeader>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700 flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="search"
            placeholder="Search CVE, vendor, description, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 hover:text-slate-200"
            title="Close and apply context selections"
          >
            <Plus className="h-4 w-4" />
          </button>
          {selectedVulnerabilitiesForContext.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
              {selectedVulnerabilitiesForContext.length}
            </span>
          )}
        </div>
      </div>

      <DialogContent className="flex-grow overflow-y-auto bg-slate-900/50">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-lg text-slate-300">Loading CISA KEV data...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500 text-lg">Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && filteredVulnerabilities.length === 0 && searchTerm && (
          <div className="flex justify-center items-center h-full">
            <p className="text-lg text-slate-500">No vulnerabilities match your search &quot;{searchTerm}&quot;.</p>
          </div>
        )}
        {!isLoading && !error && filteredVulnerabilities.length > 0 && (
          <div className="space-y-4">
            {paginatedVulnerabilities.map((vuln) => {
              const isSelected = selectedCveIds.has(vuln.cveID);
              return (
                <div key={vuln.cveID} className="relative bg-slate-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow border border-slate-700">
                  {/* Add Context Button */}
                  <button
                    className={`absolute top-2 right-2 h-7 w-7 p-1 rounded-lg transition-colors ${isSelected 
                      ? 'text-green-400 bg-green-900/50 hover:bg-green-800/50'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700'
                    }`}
                    onClick={() => onToggleVulnerabilityForContext(vuln)}
                    title={isSelected ? "Remove from context" : "Add to context"}
                  >
                    <Plus className="h-full w-full" />
                  </button>
                  
                  <h3 className="text-lg font-semibold text-cyan-400 mb-1 pr-8">
                    <a 
                      href={getNvdLink(vuln.notes, vuln.cveID)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {vuln.vulnerabilityName} ({vuln.cveID})
                    </a>
                  </h3>
                  <p className="text-sm text-slate-300 mb-1">
                    <span className="font-medium">Vendor:</span> {vuln.vendorProject}
                  </p>
                  <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                    {vuln.shortDescription}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-slate-500">
                      Date Added: {new Date(vuln.dateAdded).toLocaleDateString()}
                    </p>
                    {vuln.knownRansomwareCampaignUse === 'Known' && (
                      <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded-full">
                        Ransomware
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        {totalPages > 0 && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}

