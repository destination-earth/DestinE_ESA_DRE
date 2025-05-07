// useJobsData.ts
// Custom hook for managing jobs data with filtering, sorting, and pagination

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useJobsApi, Job, JobsFilter } from './useJobsApi';

interface UseJobsDataProps {
  initialFilter?: JobsFilter;
  defaultPageSize?: number;
}

export const useJobsData = ({ 
  initialFilter = { type: 'assessment' }, // Default to assessment type
  defaultPageSize = 10
}: UseJobsDataProps = {}) => {
  // State for filters, data, and UI state
  const [filter, setFilter] = useState<JobsFilter>(initialFilter);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentType, setCurrentType] = useState<'assessment' | 'forecast' | undefined>(initialFilter.type);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [pageIndex, setPageIndex] = useState(0);
  
  // Get the API functions from our hook
  const { fetchUserJobs } = useJobsApi();
  
  // Update filter when initialFilter changes
  useEffect(() => {
    setFilter(initialFilter);
    setCurrentType(initialFilter.type);
  }, [initialFilter]);
  
  // Fetch jobs data with current filters
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching jobs with filter:', filter);
      
      // Fetch jobs with the current filter
      const response = await fetchUserJobs(filter);
      setJobs(response.jobs || []);
      setCurrentType(response.type || 'assessment'); // Default to assessment if no type is specified
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'));
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserJobs, filter]);
  
  // Fetch jobs whenever the filter changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Update filters
  const updateFilter = useCallback((newFilter: Partial<JobsFilter>) => {
    console.log('Updating filter:', newFilter);
    setFilter(prev => ({ ...prev, ...newFilter }));
    if (newFilter.type) {
      setCurrentType(newFilter.type);
    }
    // Reset to first page when filter changes
    setPageIndex(0);
  }, []);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    console.log('Resetting filters to default (assessment)');
    setFilter({ type: 'assessment' }); // Reset to assessment type
    setCurrentType('assessment');
    setPageIndex(0);
  }, []);
  
  // Computed values for pagination
  const totalPages = useMemo(() => 
    Math.ceil(jobs.length / pageSize), 
    [jobs.length, pageSize]
  );
  
  const paginatedJobs = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return jobs.slice(start, end);
  }, [jobs, pageIndex, pageSize]);
  
  // Sorting functionality
  const sortJobs = useCallback((sortField: keyof Job, direction: 'asc' | 'desc') => {
    setJobs(prevJobs => {
      const sorted = [...prevJobs].sort((a, b) => {
        // Handle date fields specially
        if (sortField === 'datetime') {
          const dateA = new Date(a[sortField] || '');
          const dateB = new Date(b[sortField] || '');
          return direction === 'asc' 
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
        
        // Handle string fields
        const valueA = String(a[sortField] || '').toLowerCase();
        const valueB = String(b[sortField] || '').toLowerCase();
        
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  }, []);
  
  return {
    // Data
    jobs,
    paginatedJobs,
    totalJobs: jobs.length,
    
    // Filters
    filter,
    currentType,
    updateFilter,
    resetFilters,
    
    // Pagination
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    totalPages,
    
    // Sorting
    sortJobs,
    
    // Loading state
    isLoading,
    error,
    
    // Actions
    refresh: fetchJobs,
  };
};
