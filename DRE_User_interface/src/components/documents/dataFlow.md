# Data Flow in HYREF Assessment Components

## Table of Contents

- [Data Flow in HYREF Assessment Components](#data-flow-in-hyref-assessment-components)
  - [Table of Contents](#table-of-contents)
  - [File-Based Data Flow](#file-based-data-flow)
    - [File Structure and Responsibilities](#file-structure-and-responsibilities)
    - [Data Flow Between Files](#data-flow-between-files)
    - [Type Definitions Flow](#type-definitions-flow)
  - [Overview](#overview)
  - [Architecture Diagram](#architecture-diagram)
  - [Detailed Data Flow](#detailed-data-flow)
    - [1. User Input Collection](#1-user-input-collection)
    - [2. Form Validation Process](#2-form-validation-process)
    - [3. API Request Flow](#3-api-request-flow)
    - [4. Data Structure Transformation](#4-data-structure-transformation)
  - [Component Interaction](#component-interaction)
  - [TanStack Query Implementation](#tanstack-query-implementation)
  - [Error Handling Flow](#error-handling-flow)
  - [Energy Type Switching Behavior](#energy-type-switching-behavior)
  - [Conclusion](#conclusion)
  - [Forecast & Assessment Data Flow Documentation](#forecast--assessment-data-flow-documentation)
    - [Core Components](#core-components)
    - [API Interaction Flow](#api-interaction-flow)
    - [State Management](#state-management)
    - [Key Data Types](#key-data-types)

## File-Based Data Flow

```mermaid
graph TD
    subgraph "UI Components"
        A1[BasicTab.tsx] --> B1[useAssessmentQueries.ts]
        A2[PremiumTab.tsx] --> B1
        A3[AboutTab.tsx] --> B2[useForecastQueries.ts]
    end
    
    subgraph "Query Layer"
        B1 --> C1[useAssessmentApi.ts]
        B2 --> C2[useForecastApi.ts]
    end
    
    subgraph "API Service Layer"
        C1 --> D1[solarAssessmentApi.ts]
        C1 --> D2[windAssessmentApi.ts]
        C2 --> D3[solarForecastApi.ts]
        C2 --> D4[windForecastApi.ts]
    end
    
    subgraph "HTTP Layer"
        D1 --> E[axiosConfig.ts]
        D2 --> E
        D3 --> E
        D4 --> E
        E --> F[Backend API]
    end
    
    style A1 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style A2 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style A3 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style B1 fill:#c7ceea,stroke:#333,stroke-width:1px
    style B2 fill:#c7ceea,stroke:#333,stroke-width:1px
    style F fill:#b5ead7,stroke:#333,stroke-width:1px
```

### File Structure and Responsibilities

| File | Responsibility | Key Functions |
|------|----------------|---------------|
| **UI Components** | | |
| `BasicTab.tsx` | Handles basic assessment form UI and state | Form rendering, validation, submission |
| `PremiumTab.tsx` | Handles premium assessment form UI and state | Advanced form options, validation, submission |
| `AboutTab.tsx` | Displays information about assessments | Data visualization, chart rendering |
| **Query Layer** | | |
| `useAssessmentQueries.ts` | TanStack Query hooks for assessments | `useBasicSolarAssessmentMutation`, `useWindBasicQuery` |
| `useForecastQueries.ts` | TanStack Query hooks for forecasts | `useSolarForecastTimeSeriesQuery`, `useWindForecastAboutQuery` |
| **API Layer** | | |
| `useAssessmentApi.ts` | Authentication wrapper for assessment APIs | `submitSolarBasic`, `fetchWindAbout` |
| `useForecastApi.ts` | Authentication wrapper for forecast APIs | `fetchSolarForecastTimeSeries`, `fetchWindForecastAbout` |
| **Service Layer** | | |
| `solarAssessmentApi.ts` | Solar assessment API services | `submitBasicSolarAssessment`, `getSolarAbout` |
| `windAssessmentApi.ts` | Wind assessment API services | `submitBasicWindAssessment`, `getWindAbout` |
| `solarForecastApi.ts` | Solar forecast API services | `getSolarForecastTimeSeries`, `getSolarForecastAbout` |
| `windForecastApi.ts` | Wind forecast API services | `getWindForecastTimeSeries`, `getWindForecastAbout` |
| **HTTP Layer** | | |
| `axiosConfig.ts` | Axios configuration and interceptors | `setAuthToken`, `axiosInstance` |

### Data Flow Between Files

1. **User Input to API Request**:

   ```text
   BasicTab.tsx → useAssessmentQueries.ts → useAssessmentApi.ts → solarAssessmentApi.ts → axiosConfig.ts → Backend
   ```

2. **API Response to UI**:

   ```text
   Backend → axiosConfig.ts → solarAssessmentApi.ts → useAssessmentApi.ts → useAssessmentQueries.ts → BasicTab.tsx
   ```

3. **Forecast Data Flow**:

   ```text
   AboutTab.tsx → useForecastQueries.ts → useForecastApi.ts → solarForecastApi.ts → axiosConfig.ts → Backend
   ```

### Type Definitions Flow

The application uses TypeScript interfaces that are shared across files:

```mermaid
graph TD
    A[assessmentTypes.ts] --> B1[useAssessmentApi.ts]
    A --> B2[useAssessmentQueries.ts]
    A --> B3[solarAssessmentApi.ts]
    A --> B4[windAssessmentApi.ts]
    A --> B5[BasicTab.tsx/PremiumTab.tsx]
    
    C[forecastTypes.ts] --> D1[useForecastApi.ts]
    C --> D2[useForecastQueries.ts]
    C --> D3[solarForecastApi.ts]
    C --> D4[windForecastApi.ts]
    C --> D5[AboutTab.tsx]
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:1px
    style C fill:#f9d5e5,stroke:#333,stroke-width:1px
```

## Overview

This document provides a visual representation of the data flow in the HYREF assessment components, from user input to API response and visualization. The document focuses on the assessment workflow, which is a core functionality of the application.

## Architecture Diagram

```mermaid
graph TD
    subgraph "User Interface"
        A[User Input] --> B[Form Components]
        B --> C[Form Validation]
        C --> D[Form Submission]
    end
    
    subgraph "State Management"
        D --> E[TanStack Query Mutation]
        E --> F[API Service Layer]
    end
    
    subgraph "API Communication"
        F --> G[Axios Instance]
        G --> H[Backend API]
        H --> I[API Response]
        I --> J[Response Processing]
    end
    
    subgraph "UI Update"
        J --> K[State Update]
        K --> L[Results Display]
    end
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style H fill:#c7ceea,stroke:#333,stroke-width:2px
    style L fill:#b5ead7,stroke:#333,stroke-width:2px
```

## Detailed Data Flow

### 1. User Input Collection

```mermaid
flowchart LR
    subgraph "User Inputs"
        A1[Date Range] --> B
        A2[Coordinates] --> B
        A3[Energy Type] --> B
        A4[Specialized Fields] --> B
    end
    
    B[Form State]
    
    style A1 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style A2 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style A3 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style A4 fill:#f9d5e5,stroke:#333,stroke-width:1px
    style B fill:#eeeeee,stroke:#333,stroke-width:2px
```

The user interacts with various form components:

- **DateRangeInputs**: Collects start and end dates
- **CoordinateInputs**: Captures latitude and longitude
- **Energy Type Toggle**: Switches between solar and wind assessments
- **Specialized Fields**:
  - For Solar: tilt, azimuth, tracking, capacity
  - For Wind: hub height, power curve model

### 2. Form Validation Process

```mermaid
flowchart TD
    A[Form Data] --> B{Validation Service}
    B -->|Group 1 Validation| C[Common Fields]
    B -->|Group 2 Validation| D[Specialized Fields]
    
    C --> E{All Required<br>Fields Valid?}
    D --> E
    
    E -->|Yes| F[Form Valid]
    E -->|No| G[Form Invalid]
    
    style A fill:#eeeeee,stroke:#333,stroke-width:2px
    style F fill:#b5ead7,stroke:#333,stroke-width:2px
    style G fill:#f8d7da,stroke:#333,stroke-width:2px
```

- **useAssessmentFormValidation**: Custom hook that validates form data
- **Validation Groups**:
  - Group 1: Common fields (dates, coordinates)
  - Group 2: Specialized fields based on energy type
- **Validation Rules**: Date ranges, coordinate formats, required fields

### 3. API Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Component as BasicTab/PremiumTab
    participant Mutation as TanStack Mutation
    participant API as API Service
    participant Axios
    participant Backend
    
    User->>Component: Submit Form
    Component->>Component: Validate Form
    Component->>Mutation: mutate(formData)
    Mutation->>API: submitAssessment(data)
    API->>API: Format Data
    API->>Axios: post(endpoint, formattedData)
    Axios->>Backend: HTTP Request
    Backend->>Axios: HTTP Response
    Axios->>API: response.data
    API->>Mutation: Return Data
    Mutation->>Component: onSuccess/onError
    Component->>User: Display Results/Error
```

1. **Form Submission**: User submits the form
2. **Data Transformation**:
   - String values converted to appropriate types
   - Dates formatted to ISO strings
3. **API Call**:
   - TanStack Query mutation executes
   - API service formats and sends the request
4. **Response Handling**:
   - Success: Results displayed to user
   - Error: Error messages logged and displayed

### 4. Data Structure Transformation

```mermaid
graph TD
    A[Form Data<br>JavaScript Objects] --> B[API Request<br>Typed Objects]
    B --> C[HTTP Request<br>JSON]
    C --> D[Backend Processing]
    D --> E[HTTP Response<br>JSON]
    E --> F[API Response<br>Typed Objects]
    F --> G[UI State<br>JavaScript Objects]
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:1px
    style D fill:#c7ceea,stroke:#333,stroke-width:2px
    style G fill:#b5ead7,stroke:#333,stroke-width:1px
```

**Form Data to API Request:**

```typescript
// Form Data (Component State)
{
  startDate: "2025-03-01",
  endDate: "2025-03-31",
  latitude: "37.7749",
  longitude: "-122.4194"
}

// API Request (After Transformation)
{
  startDate: "2025-03-01T00:00:00.000Z",
  endDate: "2025-03-31T00:00:00.000Z",
  latitude: 37.7749,
  longitude: -122.4194
}
```

**API Response to UI State:**

```typescript
// API Response
{
  assessmentId: "a123456",
  results: {
    averageDailyProduction: 42.5,
    totalProduction: 1275,
    efficiencyRating: "High"
  },
  metadata: {
    // Additional information
  }
}

// UI State (For Results Display)
{
  data: {
    // API response data
  },
  energyType: "solar",
  startDate: "2025-03-01",
  endDate: "2025-03-31"
}
```

## Component Interaction

```mermaid
graph TD
    A[App] --> B[AssessmentPage]
    B --> C[EnergyTypeSelector]
    B --> D[TabNavigation]
    D --> E[BasicTab]
    D --> F[PremiumTab]
    D --> G[AboutTab]
    
    E --> H1[DateRangeInputs]
    E --> H2[CoordinateInputs]
    E --> H3[BasicWindInputs]
    E --> H4[FormActions]
    E --> H5[AssessmentResults]
    
    F --> I1[DateRangeInputs]
    F --> I2[CoordinateInputs]
    F --> I3[AdvancedSolarInputs]
    F --> I4[AdvancedWindInputs]
    F --> I5[FormActions]
    F --> I6[AssessmentResults]
    
    style E fill:#f9d5e5,stroke:#333,stroke-width:2px
    style F fill:#f9d5e5,stroke:#333,stroke-width:2px
    style H5 fill:#b5ead7,stroke:#333,stroke-width:2px
    style I6 fill:#b5ead7,stroke:#333,stroke-width:2px
```

## TanStack Query Implementation

```mermaid
graph TD
    A[Component] --> B[useMutation Hook]
    B --> C[Mutation Function]
    C --> D[API Service]
    D --> E[Axios Instance]
    
    A --> F[useQuery Hook]
    F --> G[Query Function]
    G --> D
    
    style B fill:#c7ceea,stroke:#333,stroke-width:2px
    style F fill:#c7ceea,stroke:#333,stroke-width:2px
```

**Key Components:**

1. **useMutation**: Handles form submissions

   ```typescript
   const solarMutation = useMutation<SolarAssessmentApiResponse, AxiosError, BasicSolarAssessmentRequest>({
     mutationFn: submitBasicSolarAssessment,
   });
   ```

2. **useQuery**: Fetches data

   ```typescript
   const { data, isLoading } = useQuery<AssessmentApiResponse, Error>({
     queryKey: ["assessment", "solar", "about"],
     queryFn: getSolarAbout,
   });
   ```

3. **Query Keys**: Structured hierarchically

   ```typescript
   ["assessment", "solar", "about"]
   ["assessment", "wind", "basic", startDate, endDate, latitude, longitude, height]
   ```

## Error Handling Flow

```mermaid
flowchart TD
    A[API Call] --> B{Success?}
    B -->|Yes| C[Process Data]
    B -->|No| D[Error Handler]
    
    D --> E{Error Type?}
    E -->|Axios Error| F[Log Response Details]
    E -->|Network Error| G[Log Request Details]
    E -->|Other Error| H[Log Error Message]
    
    F --> I[Display User Error]
    G --> I
    H --> I
    
    style B fill:#ffcc99,stroke:#333,stroke-width:2px
    style I fill:#f8d7da,stroke:#333,stroke-width:2px
```

Error handling is implemented with detailed logging:

```typescript
onError: (error: Error) => {
  console.error("Assessment error:", error);
  if (error instanceof AxiosError && error.response) {
    console.error("Error response data:", error.response.data);
    console.error("Error response status:", error.response.status);
  } else if (error instanceof AxiosError && error.request) {
    console.error("Error request:", error.request);
  } else {
    console.error("Error message:", error.message);
  }
}
```

## Energy Type Switching Behavior

```mermaid
stateDiagram-v2
    [*] --> SolarForm
    SolarForm --> WindForm: Change Energy Type
    WindForm --> SolarForm: Change Energy Type
    
    state SolarForm {
        [*] --> EmptyForm
        EmptyForm --> FilledForm: User Input
        FilledForm --> SubmittedForm: Submit
        SubmittedForm --> Results: Success
        SubmittedForm --> Error: Failure
        FilledForm --> EmptyForm: Clear
        Results --> EmptyForm: Clear
        Error --> EmptyForm: Clear
    }
    
    state WindForm {
        [*] --> EmptyWindForm
        EmptyWindForm --> FilledWindForm: User Input
        FilledWindForm --> SubmittedWindForm: Submit
        SubmittedWindForm --> WindResults: Success
        SubmittedWindForm --> WindError: Failure
        FilledWindForm --> EmptyWindForm: Clear
        WindResults --> EmptyWindForm: Clear
        WindError --> EmptyWindForm: Clear
    }
```

When switching energy types:

1. All form fields are reset to default values
2. All validation states are cleared
3. API mutations are reset
4. Previous results are cleared
5. Components are re-rendered with a new key

## Conclusion

This document provides a comprehensive overview of the data flow in the HYREF assessment components. The architecture follows a clean separation of concerns, with distinct layers for UI components, state management, API communication, and data visualization. The use of TanStack Query provides a robust solution for managing API state, caching, and error handling.

## Forecast & Assessment Data Flow Documentation

### Core Components

1. **TrainForecastForm**
   - Handles form submission
   - Data Flow:
     - Receives initialValues from parent
     - Validates using validateForm
     - Submits via useMutation
     - Emits status changes via onMutationStateChange

2. **OrdersView**
   - Displays order status
   - Data Flow:
     - Receives mutationState from parent
     - Shows loading/error states
     - Links to details view

3. **Tab Components (Annual/OneOff)**
   - Manages tab-specific logic
   - Data Flow:
     - Maintains formState
     - Handles submission locks
     - Coordinates between form and view

### API Interaction Flow

```mermaid
flowchart LR
    A[Tab Component] -->|initialValues| B(TrainForecastForm)
    B -->|onSubmit| C[API Mutation]
    C -->|status| D[OrdersView]
    D -->|retry| C
```

### State Management

- **Local State**: Form inputs, submission locks
- **Mutation State**: isLoading, isError, isSuccess
- **Cross-Component**: Shared via props callbacks

### Key Data Types

- OrderPayload: ISO dates, forecast parameters
- MutationState: { isLoading, isError, error }
