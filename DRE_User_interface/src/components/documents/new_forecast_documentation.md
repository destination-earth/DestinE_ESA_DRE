# Forecast Component Documentation

## Table of Contents

<!-- 1. Overview
2. Component Structure
3. Data Flow
4. API Endpoints
5. Validation
6. State Management
7. Mutation Handling
8. Internationalization
9. Utility Functions
10. Planned Refactoring -->
1. [Overview](#overview))
2. [Component Structure](new_forecast_documentation.md#component-structure)
3. [Data Flow](new_forecast_documentation.md#data-flow)
4. [API Endpoints](new_forecast_documentation.md#api-endpoints)
5. [Validation](new_forecast_documentation.md#validation)
6. [State Management](new_forecast_documentation.md#state-management)
7. [Mutation Handling](new_forecast_documentation.md#mutation-handling)
8. [Internationalization](new_forecast_documentation.md#internationalization)
9. [Utility Functions](new_forecast_documentation.md#utility-functions)
10. [Planned Refactoring](new_forecast_documentation.md#planned-refactoring)

## Overview

The forecast component provides users with the ability to generate energy production forecasts for solar and wind power plants. It supports two main forecasting services accessible via separate tabs within the main `ForecastLayout`:

1. One-off Forecasting (`OneOffTab`): Generates a forecast for a specific time period (currently 2-day).
2. Annual Forecasting (`AnnualTab`): Generates a forecast for an entire year.

Each service allows users to choose between two methods via radio buttons:

1. Trained Model (`TrainForecastForm`): Uses historical time-series data uploaded by the user (via a specific template file) to train a model for potentially more accurate, site-specific forecasts.
2. Standard Model (`StandardForecastForm`): Uses standard meteorological models combined with user-provided site and equipment specifications (e.g., location, capacity, elevation, tilt, azimuth, hub height, power curve).

An additional `AboutTab` provides descriptive information and showcases example forecast visualizations using pre-fetched demonstration data.

## Component Structure

The core forecast functionality is organized as follows:

```text
src/
├── components/
│   ├── pages/
│   │   └── ForecastPage.tsx       # Main page entry point
│   ├── forecast/
│   │   ├── ForecastLayout.tsx     # Manages tabs (About, One-off, Annual) and energy type selection
│   │   ├── AboutTab.tsx         # Displays info and demo charts
│   │   ├── OneOffTab.tsx        # Container for One-off forecast forms
│   │   ├── AnnualTab.tsx        # Container for Annual forecast forms
│   │   ├── TrainForecastForm.tsx  # Form for submitting template-based forecasts (reused by OneOff/Annual)
│   │   ├── StandardForecastForm.tsx # Form for submitting spec-based forecasts (reused by OneOff/Annual)
│   │   ├── OrderView.tsx        # Component to display submitted orders (potentially)
│   │   ├── ForecastVisualizationModal.tsx # Modal for visualizing forecast results
│   │   ├── ForecastTimeSeriesChart.tsx # Chart component for solar time series
│   │   ├── ForecastPredictionComparisonChart.tsx # Chart component for solar comparison
│   │   ├── WindPowerSpeedChart.tsx # Chart component for wind power/speed (currently uses mock data)
│   │   ├── WindActualVsPredictedChart.tsx # Chart component for wind comparison (currently uses mock data)
│   │   └── text/                    # Contains text descriptions for different sections
│   │       └── ...
│   ├── commonFormComponents/    # Reusable form elements (Inputs, Selects, etc.)
│   ├── fileHandling/            # Components for file uploads (e.g., SolarTemplateUpload)
│   └── mapSelectorComponent/    # Map component for selecting coordinates
├── hooks/
│   ├── useForecastQueries.ts    # TanStack Query hooks for API interaction (queries & mutations)
│   ├── useForecastApi.ts        # Abstraction layer defining API fetch functions
│   ├── useForecastForm.ts       # Hook for managing shared form state and logic
│   └── useOrderManagement.ts    # Hook for managing submitted orders and visualization state
├── services/
│   ├── api/
│   │   ├── forecastTypes.ts       # TypeScript types for API requests/responses
│   │   ├── solarForecastApi.ts    # Functions for specific solar API calls
│   │   ├── windForecastApi.ts     # Functions for specific wind API calls
│   │   └── axiosConfig.ts         # Axios instance configuration
│   ├── validation/
│   │   ├── validators.ts          # Input validation functions
│   │   └── formValidation/        # Components/logic for validated inputs
│   └── mockData/
│       └── ordersMockApi.ts       # Mock function for adding orders (used by mutations)
└── types/                         # Shared TypeScript types
    └── ...
```

## Data Flow

1. User Interaction: The user navigates to the Forecast page (`ForecastPage.tsx`) and selects either the "One-off" (`OneOffTab.tsx`) or "Annual" (`AnnualTab.tsx`) tab.
2. Energy Type Selection: The user selects either "Solar" or "Wind" within the chosen tab.
3. Mode Selection: The user chooses between "Train" (using a historical data file) or "Standard" (providing site specifications).
4. Form Display: Based on the selections, either `TrainForecastForm.tsx` or `StandardForecastForm.tsx` is rendered.
5. Data Input: The user fills in the required fields in the form.
6. Client-Side Validation: As the user interacts with the form (e.g., `onBlur`, `onChange`), input fields are validated using functions from `src/services/validation/validators.ts` via the `ValidatedInput` component. The `useForecastForm` hook tracks the validity of each field.
7. Form State Management: The `useForecastForm` hook manages the `formData` state, updating it as the user types.
8. Submission Attempt: The user clicks the submit button.
9. Submission Enabled Check: The form checks if `isFormValid` (managed by `useForecastForm`) is true. If not, submission is blocked.
10. API Call: If valid, the appropriate mutation hook from `useForecastQueries.ts` (`useForecastTemplateMutation` for Train, `useStandardForecastMutation` for Standard) is triggered.
    * This hook determines the correct API endpoint based on energy type and source tab (One-off/Annual).
    * It calls the relevant API function (`solarForecastApi.ts` or `windForecastApi.ts`) to make the `POST` request.
    * For 'Train' mode, it sends `FormData`. For 'Standard' mode, it sends JSON (potentially with a file for wind power curves).
11. API Response Handling: The mutation hook handles the API response:
    * On Success: Displays a success notification, potentially adds the order to a local list (currently mocked via `ordersMockApi.ts` in `useOrderManagement`), and clears the form using `handleClear` from `useForecastForm`.
    * On Error: Displays an error notification.
12. Visualization: If the user later chooses to visualize a submitted order (via `OrderView` or potentially another mechanism), the `handleVisualizeOrder` function from `useOrderManagement` is called. This likely triggers a separate API call (e.g., GET `/api/Forecast/{type}/visualize/{id}`) to fetch the visualization data, which is then displayed in the `ForecastVisualizationModal` using the appropriate chart components.

## API Endpoints

The following backend API endpoints are currently used by the forecast components (primarily via `useForecastQueries.ts`):

* Fetching Demonstration Data (About Tab):
  * Uses functions (`fetchSolarForecastAbout`, `fetchWindForecastAbout`) defined in `useForecastApi.ts`. The exact GET endpoints are within that hook's implementation (e.g., likely `GET /api/Forecast/solar/about` and `GET /api/Forecast/wind/about`).
* Submitting "Train" Forecasts (via Template File Upload):
  * Solar (One-Off): `POST /api/Forecast/solar/basic_file`
  * Solar (Annual): `POST /api/Forecast/solar/premium_file`
  * Wind (One-Off): `POST /api/Forecast/wind/basic_file`
  * Wind (Annual): `POST /api/Forecast/wind/premium_file`
  * (Content-Type: multipart/form-data)
* Submitting "Standard" Forecasts (via Specifications):
  * Solar (One-Off): `POST /api/Forecast/solar/basic`
  * Solar (Annual): `POST /api/Forecast/solar/premium`
  * Wind (One-Off): `POST /api/Forecast/wind/basic`
  * Wind (Annual): `POST /api/Forecast/wind/premium`
  * (Content-Type: application/json, potentially multipart/form-data if custom power curve file is included for wind)
* Fetching Past Orders:
  * Handled by `useOrderManagement` hook. The specific endpoint (e.g., `GET /api/Forecast/orders`) is not confirmed within the viewed code but is implied.
* Adding New Orders:
  * Currently **mocked** via `addOrder` function in `src/services/mockData/ordersMockApi.ts` within the mutation's `onSuccess` callback.
* Visualizing Past Orders:
  * Handled by `useOrderManagement` hook via `handleVisualizeOrder` function. The specific endpoint (e.g., `GET /api/Forecast/{solar|wind}/visualize/{orderId}`) is not confirmed within the viewed code but is implied by usage in other components like `JobsList`.

## Validation

* Client-Side: Input validation is primarily handled on the client-side.
  * The `ValidatedInput` component wraps standard inputs.
  * It uses validation functions imported from `src/services/validation/validators.ts` (e.g., `validateLatitudeFormat`, `validatePositiveNumber`).
  * Validation typically occurs `onBlur` or `onChange`, providing immediate feedback to the user.
  * Overall form validity is calculated within the specific form components (`TrainForecastForm`, `StandardForecastForm`) by combining the validity state of individual inputs.
  * The submit button is disabled based on the overall form validity.
* Server-Side: Assumed to be present on the backend API endpoints, but details are outside the scope of the frontend documentation.

## State Management

* Local Component State (`useState`): Used within individual components for UI state (e.g., `activeTab` in `OneOffTab`/`AnnualTab`, `formKey` for triggering resets).
* Shared Form State (`useForecastForm`): This custom hook centralizes the state (`formData`) for both `TrainForecastForm` and `StandardForecastForm`. It also provides handlers (`handleInputChange`, `handleClear`) and calculates form validity (`isFormValid`), ensuring consistency across different modes (`train`/`standard`), energy types (`solar`/`wind`), and tabs (`oneoff`/`annual`).
* Order/Visualization State (`useOrderManagement`): This custom hook manages the state related to submitted forecast orders, including the list of orders (currently mocked), whether the `OrderView` is shown, and the state for the `ForecastVisualizationModal` (`isVisualizationModalOpen`, `selectedOrderId`).
* API Request State (TanStack Query): Manages the state of asynchronous API calls (queries and mutations), including loading, success, error, and data caching. Used extensively in `useForecastQueries.ts`.

## Mutation Handling

* API submissions (creating new forecasts) are handled using mutation hooks defined in `src/hooks/useForecastQueries.ts`, built upon TanStack Query (`useMutation`).
  * `useForecastTemplateMutation`: Handles submissions for the 'Train' forms (`TrainForecastForm`). Takes `energyType` and `sourceTab` as arguments to determine the correct API endpoint (`basic_file` vs. `premium_file`). Expects `FormData`.
  * `useStandardForecastMutation`: Handles submissions for the 'Standard' forms (`StandardForecastForm`). Takes `energyType` and `sourceTab` as arguments to determine the correct API endpoint (`basic` vs. `premium`). Expects a JSON object (and potentially a file for wind power curves).
* These hooks manage the loading state (`isUploading`/`isSubmitting`), handle success via an `onSuccess` callback (which integrates with `useOrderManagement` and clears the form via `useForecastForm`), and manage errors.
* The actual API call logic resides in functions imported from `solarForecastApi.ts` and `windForecastApi.ts`.

## Internationalization

* Text content (labels, titles, descriptions) is managed using `react-i18next`.
* The `useTranslation` hook is used within components to access translated strings (e.g., `t('forecast.oneoff.title.solar.train')`).
* Static text descriptions are often encapsulated in separate components within the `text/` subdirectories (e.g., `ForecastOneoffText.tsx`, `ForecastAnnualText.tsx`).

## Utility Functions

* Validation: `src/services/validation/validators.ts` contains various functions for validating specific input types.
* API Calls: `src/services/api/solarForecastApi.ts` and `windForecastApi.ts` contain functions that encapsulate the details of making specific API calls using Axios.
* Mocking: `src/services/mockData/` contains mock functions and data used for development or where backend functionality is not yet complete (e.g., `ordersMockApi.ts`).

## Planned Refactoring

### Refactoring Objectives

The current implementation is functional but slated for refactoring to address several areas:

* API Endpoint Consolidation:** Instead of separate endpoints for Solar/Wind and One-off/Annual, consolidate into fewer, more generic endpoints.
* Data Flow Simplification:** Pass API data more directly from the query hooks to the visualization components, removing intermediate transformation steps where possible, especially for wind data which currently relies on mock data in charts.
* Validation Improvements:** Explore using a more robust validation library (e.g., Zod, Yup) integrated with `react-hook-form` for schema-based validation.
* Media Type Handling:** Explicitly handle `multipart/form-data` vs `application/json` request types based on whether a file upload is required.

### Key Considerations

*Backward Compatibility:* Ensure changes don't break existing functionality unintentionally.
