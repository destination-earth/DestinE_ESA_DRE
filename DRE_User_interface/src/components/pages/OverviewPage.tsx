// import { useTranslation } from 'react-i18next';
// import { useState } from 'react';
// import JobsList from '../overview/JobsList';
// import JobsFilterBar from '../overview/JobsFilterBar';
// import { useJobsData } from '../../hooks/useJobsData';
// import { JobsFilter } from '../../hooks/useJobsApi';

// const OverviewPage = () => {
//   const { t } = useTranslation();
//   const [currentFilter, setCurrentFilter] = useState<JobsFilter>({});
  
//   const { 
//     jobs, 
//     isLoading, 
//     error, 
//     refresh 
//   } = useJobsData({
//     initialFilter: currentFilter
//   });

//   // Handle filter changes
//   const handleFilterChange = (newFilter: Partial<JobsFilter>) => {
//     setCurrentFilter(prev => ({ ...prev, ...newFilter }));
//   };

//   // Reset all filters
//   const handleResetFilters = () => {
//     setCurrentFilter({});
//   };

//   return (
//     <div className="">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">{t('overview.title', 'Archive')}</h1>
//         <button
//           onClick={refresh}
//           className="inline-flex items-center rounded bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
//         >
//           <svg
//             className="mr-1.5 h-4 w-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//             ></path>
//           </svg>
//           {t('overview.refresh', 'Refresh')}
//         </button>
//       </div>

//       <JobsFilterBar 
//         filter={currentFilter}
//         onFilterChange={handleFilterChange}
//         onResetFilters={handleResetFilters}
//       />

//       <div className="flex-1 overflow-hidden">
//         <JobsList 
//           jobs={jobs} 
//           isLoading={isLoading} 
//           error={error} 
//           onRefresh={refresh}
//         />
//       </div>
//     </div>
//   );
// };

// export default OverviewPage;