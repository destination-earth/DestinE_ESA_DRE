import React from 'react';
import { useTranslation } from 'react-i18next';
import { JobsFilter } from '../../hooks/useJobsApi';

interface JobsFilterBarProps {
  filter: JobsFilter;
  onFilterChange: (newFilter: Partial<JobsFilter>) => void;
  onResetFilters: () => void;
}

/**
 * Component for filtering jobs by type, source, and plan
 */
const JobsFilterBar: React.FC<JobsFilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters
}) => {
  const { t } = useTranslation();

  // Type filter options
  const typeOptions = [
    { value: 'assessment', label: t('assessment.filter.type.assessment', 'Assessment') },
    { value: 'forecast', label: t('assessment.filter.type.forecast', 'Forecast') },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center">
            <label htmlFor="type-filter" className="text-sm text-gray-600 mr-2">
              {t('overview.filter.type', 'Type')}:
            </label>
            <select
              id="type-filter"
              value={filter.type || ''}
              onChange={(e) => onFilterChange({ type: e.target.value ? e.target.value as 'assessment' | 'forecast' : undefined })}
              className="block appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center">
            <label htmlFor="source-filter" className="text-sm text-gray-600 mr-2">
              {t('overview.filter.source', 'Source')}:
            </label>
            <select
              id="source-filter"
              value={filter.source || ''}
              onChange={(e) => onFilterChange({ source: e.target.value ? e.target.value as 'solar' | 'wind' : undefined })}
              className="block appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">{t('overview.filter.all', 'All')}</option>
              <option value="solar">{t('overview.filter.solar', 'Solar')}</option>
              <option value="wind">{t('overview.filter.wind', 'Wind')}</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center">
            <label htmlFor="plan-filter" className="text-sm text-gray-600 mr-2">
              {t('overview.filter.plan', 'Plan')}:
            </label>
            <select
              id="plan-filter"
              value={filter.plan || ''}
              onChange={(e) => onFilterChange({ plan: e.target.value ? e.target.value as 'basic' | 'premium' : undefined })}
              className="block appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">{t('overview.filter.all', 'All')}</option>
              <option value="basic">{t('overview.filter.basic', 'Basic')}</option>
              <option value="premium">{t('overview.filter.premium', 'Premium')}</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          {t('overview.filter.reset', 'Reset Filters')}
        </button>
      </div>
    </div>
  );
};

export default JobsFilterBar;
