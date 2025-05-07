import React, { useState, useMemo, useCallback } from "react";
import VisualizationModal from "./VisualizationModal";
import { VisualizationData } from '../../types/visualization';
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import Table from "../ui/Table";
import { Job } from "../../hooks/useJobsApi";
import StatusBadge from "../common/StatusBadge";
import PlanBadge from "../common/PlanBadge";
import axiosInstance from '../../services/api/axiosConfig';
import {
  CloseIcon,
  DownloadFileIcon,
  CheckmarkIcon,
  CopyIcon,
  EyeIcon,
  DownloadArrowIcon,
  ChartIcon,
  ErrorIcon,
  RefreshIcon,
  EmptyDocumentIcon,
} from "./jobsSvgIcons";
import { SortingState } from "@tanstack/react-table"; // Import SortingState

// Modal component for displaying download URLs
const DownloadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  urls: string[];
  jobKey: string;
  energySource?: string;
}> = ({ isOpen, onClose, urls, jobKey, energySource }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Download {energySource || ""} Files for Job {jobKey}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {urls.length > 0 ? (
            <ul className="space-y-2">
              {urls.map((url, index) => {
                // Extract filename from URL
                let filename = "Download File";
                try {
                  const urlObj = new URL(url);
                  const pathSegments = urlObj.pathname.split("/");
                  if (pathSegments.length > 0) {
                    const lastSegment = pathSegments[pathSegments.length - 1];
                    if (lastSegment) {
                      filename = decodeURIComponent(lastSegment);
                    }
                  }
                } catch (e) {
                  console.error("Error parsing URL:", e);
                }

                return (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <DownloadFileIcon className="mr-2 h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {filename}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              No download files available.
            </p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface JobsListProps {
  jobs: Job[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  isLoading,
  error,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [copiedJobKey, setCopiedJobKey] = useState<string | null>(null);
  const [downloadsModalOpen, setDownloadsModalOpen] = useState(false);
  const [currentDownloads, setCurrentDownloads] = useState<string[]>([]);
  const [currentJobKey, setCurrentJobKey] = useState<string>("");
  const [currentSource, setCurrentSource] = useState<string>("");
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Helper function to handle viewing downloads
  const handleViewDownloads = useCallback(
    (
      downloads: string[] | Record<string, string>,
      jobKey: string,
      source: string,
    ) => {
      // Convert downloads to array if it's an object
      const downloadsList = Array.isArray(downloads)
        ? downloads
        : Object.values(downloads);

      setCurrentDownloads(downloadsList);
      setCurrentJobKey(jobKey);
      setCurrentSource(source);
      setDownloadsModalOpen(true);
    },
    [],
  );

  // Helper function to view job details
  // const handleViewDetails = useCallback((jobKey: string) => {
  //   // Navigate to job details page
  //   console.log(`Viewing details for job ${jobKey}`);
  //   // Here you would typically navigate to a details page
  //   alert(`Details for job ${jobKey} would open here`);
  // }, []);

  // Helper function to visualize results
  const handleVisualizeResults = useCallback(async (jobKey: string) => {
    try {
      const job = jobs.find(j => j.jobKey === jobKey);
      if (!job) {
        alert('Job not found');
        return;
      }
      // Use currentType as fallback for requestType
      const requestType = job.requestType || 'assessment';
      console.log('Job object in handleVisualizeResults:', job);
      console.log('Resolved requestType:', requestType);
      let endpoint = '';
      if (requestType === 'assessment') {
        if (job.energySource === 'solar') {
          endpoint = `/api/Assessment/solar/visualize`;
        } else if (job.energySource === 'wind') {
          endpoint = `/api/Assessment/wind/visualize`;
        }
      } else if (requestType === 'forecast') {
        if (job.energySource === 'solar') {
          endpoint = `/api/Forecast/solar/visualize`;
        } else if (job.energySource === 'wind') {
          endpoint = `/api/Forecast/wind/visualize`;
        }
      }
      if (!endpoint) {
        alert('Unknown job type or energy source');
        return;
      }
      // Log the request URL
      const requestUrl = `${endpoint}?jobKey=${encodeURIComponent(jobKey)}`;
      console.log('Visualization request:', requestUrl);
      // Make GET request with jobKey as query param
      const res = await axiosInstance.get(requestUrl);
      setVisualizationData(res.data as VisualizationData);
      setSelectedJob(job);
      setVisualizationModalOpen(true);
    } catch (err: unknown) {
      console.error('Visualization error:', err);
      alert('Failed to fetch visualization data.');
    }
  }, [jobs]);

  // Helper function to copy job ID to clipboard
  const copyToClipboard = useCallback((jobKey: string) => {
    navigator.clipboard
      .writeText(jobKey)
      .then(() => {
        setCopiedJobKey(jobKey);
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopiedJobKey(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);

  // Column configuration using TanStack Table
  const columnHelper = createColumnHelper<Job>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("jobKey", {
        header: () => (
          <span className="w-22 block text-center font-semibold text-gray-900">
            {t("assessment.list.jobKey", "Job ID")}
          </span>
        ),
        meta: { width: "150px" }, // Increased width for the button with text
        cell: (info) => {
          const jobKey = info.getValue();
          const isCopied = copiedJobKey === jobKey;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => copyToClipboard(jobKey)}
                className={`inline-flex items-center rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isCopied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={`${t("assessment.list.copyJobKey", "Copy Job ID")}: ${jobKey}`}
              >
                {isCopied ? (
                  <>
                    <CheckmarkIcon className="mr-1 h-4 w-4" />
                    {t("assessment.list.copied", "Copied")}
                  </>
                ) : (
                  <>
                    <CopyIcon className="mr-1 h-4 w-4" />
                    {t("assessment.list.copy", "Copy ID")}
                  </>
                )}
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor("datetime", {
        header: () => (
          <span className="w-22 block text-center font-semibold text-gray-900">
            {t("assessment.list.date", "Date")}
          </span>
        ),
        meta: { width: "150px" },
        cell: (info) => {
          const value = info.getValue();
          try {
            const date = new Date(value);

            // Format date as dd/mm/yyyy
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            return (
              <div className="text-center text-gray-700">{formattedDate}</div>
            );
          } catch (error) {
            console.error("Error formatting date:", error);
            return <div className="text-center text-red-500">Invalid date</div>;
          }
        },
        sortingFn: "datetime", // Use the built-in datetime sorting function
      }),
      columnHelper.accessor("energySource", {
        header: () => (
          <span className="w-22 block text-center font-semibold text-gray-900">
            {t("assessment.list.energySource", "Energy Source")}
          </span>
        ),
        meta: { width: "120px" },
        cell: (info) => (
          <div className="text-center font-medium text-gray-700">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("plan", {
        header: () => (
          <span className="w-22 block text-center font-semibold text-gray-900">
            {t("assessment.list.plan", "Plan")}
          </span>
        ),
        meta: { width: "100px" },
        cell: (info) => (
          <div className="text-center">
            <PlanBadge plan={info.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("progress", {
        header: () => (
          <span className="w-22 block text-center font-semibold text-gray-900">
            {t("assessment.list.progress", "Progress")}
          </span>
        ),
        meta: { width: "100px" },
        cell: (info) => (
          <div className="text-center">
            <StatusBadge status={info.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("parameters", {
        header: () => (
          <span className="block w-16 text-center font-semibold text-gray-900">
            {t("assessment.list.parameters", "Parameters")}
          </span>
        ),
        meta: { width: "150px" },
        enableSorting: false,
        cell: (info) => {
          const parameters = info.getValue();

          if (!parameters) {
            return (
              <div className="text-center text-gray-400">
                {t("assessment.list.noParameters", "No parameters")}
              </div>
            );
          }

          // Format parameters for display
          let formattedParams = "";
          try {
            if (typeof parameters === "string") {
              try {
                // Try to parse as JSON
                const parsedParams = JSON.parse(parameters);
                formattedParams = Object.entries(parsedParams)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n");
              } catch (e) {
                // If not valid JSON, use as is
                formattedParams = parameters;
              }
            } else if (typeof parameters === "object") {
              formattedParams = Object.entries(parameters)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n");
            }
          } catch (e) {
            console.error("Error formatting parameters:", e);
            formattedParams = String(parameters);
          }

          return (
            <div className="flex justify-center">
              <div className="group relative inline-block">
                <button
                  // onClick={() => handleViewDetails(jobKey)}
                  className={`inline-flex items-center rounded bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200`}
                  title={t("assessment.list.viewParameters", "View Parameters")}
                >
                  <ChartIcon className="mr-1 h-4 w-4" />
                  {t("assessment.list.viewParameters", "Parameters")}
                </button>
                <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-64 rounded border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                  <pre className="whitespace-pre-wrap text-xs text-gray-700">
                    {formattedParams}
                  </pre>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("downloadUrls", {
        id: "downloads",
        header: () => (
          <span className="block w-24 text-center font-semibold text-gray-900">
            {t("assessment.list.downloadUrl", "Download URL")}
          </span>
        ),
        meta: { width: "100px" },
        enableSorting: false,
        cell: (info) => {
          const downloadUrl = info.row.original.downloadUrl;
          const downloadUrls = info.row.original.downloadUrls;

          // Check if we have any download URLs
          const hasDownloads =
            (downloadUrl && downloadUrl.length > 0) ||
            (downloadUrls &&
              (Array.isArray(downloadUrls)
                ? downloadUrls.length > 0
                : Object.keys(downloadUrls).length > 0));

          if (!hasDownloads) {
            return (
              <div className="text-center text-gray-400">
                {t("assessment.list.noDownloadUrl", "No download URL")}
              </div>
            );
          }

          return (
            <div className="flex justify-center">
              <button
                className="flex items-center justify-center rounded bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                onClick={() => {
                  const downloads = downloadUrls || [downloadUrl];
                  handleViewDownloads(
                    downloads as string[],
                    info.row.original.jobKey,
                    info.row.original.energySource,
                  );
                }}
                title={t("assessment.list.downloadFiles", "Download Files")}
              >
                <DownloadArrowIcon className="h-5 w-5" />
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor("jobKey", {
        id: "actions",
        header: () => (
          <span className="block w-20 text-center font-semibold text-gray-900">
            {t("assessment.list.visualize", "Visualize")}
          </span>
        ),
        meta: { width: "100px" },
        enableSorting: false,
        cell: (info) => {
          const jobKey = info.getValue();

          return (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleVisualizeResults(jobKey)}
                className="flex items-center justify-center rounded bg-indigo-100 p-2 text-indigo-600 hover:bg-indigo-200"
                title={t("assessment.list.visualize", "Visualize Results")}
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            
              {/* {info.row.original.progress === "completed" && (
                <button
                  onClick={() => handleVisualizeResults(jobKey)}
                  className="flex items-center justify-center rounded bg-purple-100 p-2 text-purple-600 hover:bg-purple-200"
                  title={t("assessment.list.visualize", "Visualize Results")}
                >
                  <ChartIcon className="h-5 w-5" />
                </button>
              )} */}
            </div>
          );
        },
      }),
    ],
    [
      t,
      copiedJobKey,
      handleViewDownloads,
      handleVisualizeResults,
      copyToClipboard,
      columnHelper,
    ],
  );

  // Define initial sorting state: sort by 'datetime' descending
  const initialSorting: SortingState = useMemo(
    () => [{ id: "datetime", desc: true }],
    [],
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full rounded-lg bg-white p-6 shadow">
        <div className="flex animate-pulse flex-col space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-64 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <ErrorIcon className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">
            {t("assessment.list.errorLoading", "Error Loading Jobs")}
          </h3>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshIcon className="mr-2 h-4 w-4" />
            {t("assessment.list.tryAgain", "Try Again")}
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="w-full rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <EmptyDocumentIcon className="h-16 w-16 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            {t("assessment.list.noJobs", "No Jobs Found")}
          </h3>
          <p className="text-gray-600">
            {t(
              "assessment.list.noJobsDescription",
              "There are no jobs matching your current filters.",
            )}
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshIcon className="mr-2 h-4 w-4" />
            {t("assessment.list.refresh", "Refresh")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto">
          <Table columns={columns} data={jobs} initialSorting={initialSorting} /> 
        </div>

        {/* Download Modal */}
        {currentDownloads.length > 0 && (
          <DownloadModal
            isOpen={downloadsModalOpen}
            onClose={() => setDownloadsModalOpen(false)}
            urls={currentDownloads}
            jobKey={currentJobKey}
            energySource={currentSource}
          />
        )}
      </div>
      <VisualizationModal
        isOpen={visualizationModalOpen}
        onClose={() => setVisualizationModalOpen(false)}
        job={selectedJob}
        data={visualizationData}
      />
    </>
  );
};

export default JobsList;
