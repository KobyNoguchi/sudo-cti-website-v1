'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { NvdVulnerability } from '@/lib/ai/types';

interface NvdPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedVulnerabilitiesForContext: NvdVulnerability[];
  onToggleVulnerabilityForContext: (vulnerability: NvdVulnerability) => void;
}

export default function NvdPopup({ 
  isOpen, 
  onOpenChange, 
  selectedVulnerabilitiesForContext, 
  onToggleVulnerabilityForContext 
}: NvdPopupProps) {
  const [vulnerabilities, setVulnerabilities] = useState<NvdVulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 20;

  const fetchVulnerabilities = useCallback(async (startIndex = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        resultsPerPage: String(resultsPerPage),
        startIndex: String(startIndex),
      });

      if (searchTerm) {
        params.append('keywordSearch', searchTerm);
      } else {
        // Fetch recent vulnerabilities by default if no search term
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // Last 30 days
        params.append('pubStartDate', startDate.toISOString());
        params.append('pubEndDate', endDate.toISOString());
      }

      const response = await fetch(`/api/nvd/cves?${params.toString()}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch data');
      }
      const data = await response.json();
      setVulnerabilities(data.vulnerabilities || []);
      setTotalResults(data.totalResults || 0);
      setCurrentPage(Math.floor(startIndex / resultsPerPage));
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, resultsPerPage]);

  useEffect(() => {
    if (isOpen) {
      fetchVulnerabilities();
    }
  }, [isOpen, fetchVulnerabilities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVulnerabilities(0);
  };
  
  const handlePageChange = (newPage: number) => {
    fetchVulnerabilities(newPage * resultsPerPage);
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const getSeverityColor = (cve: NvdVulnerability['cve']) => {
    const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 
                 cve.metrics?.cvssMetricV2?.[0]?.baseSeverity;
    switch (cvss?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-900/50 text-red-400';
      case 'HIGH': return 'bg-orange-900/50 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-900/50 text-yellow-400';
      case 'LOW': return 'bg-green-900/50 text-green-400';
      default: return 'bg-slate-700 text-slate-400';
    }
  };

  const getScore = (cve: NvdVulnerability['cve']) => {
    return cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
           cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
           'N/A';
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => onOpenChange(false)} className="max-w-5xl h-[90vh] flex flex-col">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>NVD Vulnerability Database</DialogTitle>
        <DialogDescription>
          Search for vulnerabilities from the National Vulnerability Database.
        </DialogDescription>
      </DialogHeader>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 p-4 border-b border-slate-700">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            placeholder="Search by keyword (e.g., 'Apache Log4j')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      <DialogContent className="flex-grow overflow-y-auto bg-slate-900/50">
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-300">Loading...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center p-4 text-red-500">Error: {error}</div>
        )}
        {!isLoading && !error && vulnerabilities.length > 0 && (
          <ul className="space-y-3">
            {vulnerabilities.map(({ cve }) => {
              const isSelected = selectedVulnerabilitiesForContext.some(v => v.cve.id === cve.id);
              return (
                <li key={cve.id} className="p-4 border border-slate-700 rounded-lg bg-slate-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-cyan-400">{cve.id}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(cve)}`}>
                          {getScore(cve)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {cve.descriptions.find(d => d.lang === 'en')?.value || 'No description available.'}
                      </p>
                      <div className="mt-3 text-xs text-slate-500">
                        <span className="font-semibold">Published:</span> {new Date(cve.published).toLocaleDateString()}
                        <span className="font-semibold ml-4">Last Modified:</span> {new Date(cve.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant={isSelected ? "outline" : "primary"}
                      onClick={() => onToggleVulnerabilityForContext({ cve })}
                      className="flex-shrink-0"
                    >
                      {isSelected ? 'Remove' : 'Add to Context'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!isLoading && !error && vulnerabilities.length === 0 && (
          <div className="text-center p-4 text-slate-500">No results found.</div>
        )}
      </DialogContent>

      <DialogFooter>
        <span className="text-sm text-slate-400">
          Showing page {currentPage + 1} of {totalPages} ({totalResults} results)
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0 || isLoading}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

