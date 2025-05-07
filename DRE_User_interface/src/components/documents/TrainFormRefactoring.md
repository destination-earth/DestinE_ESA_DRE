# Comprehensive Refactoring Plan for TrainForecastForm.tsx

**Goal:** Improve the readability, maintainability, and testability of the `TrainForecastForm.tsx` component by breaking it down into smaller, more focused units and extracting business logic into reusable hooks.

## 1. Extract JSX Components

The current JSX within `TrainForecastForm` contains significant conditional logic based on `energyType`. Extracting these sections into dedicated components will simplify the main component's render method.

### 1.1. `WindSpecificInputs.tsx`

**Purpose:** Group all form inputs that are only relevant for the 'wind' energy type.
**Contents:**

* `HubHeightInput` component.
* `FloatingLabelSelect` for 'Power Curve Models'.
* `FloatingLabelInput` wrapping the `ValidatedInput` for 'Capacity'.
* Associated labels, styling (`div` wrappers, spacing classes like `mb-24`).
* Logic for handling the conditional display of the Power Curve file name.

**Props Needed:** Values from `formData` (hubHeight, powerCurveModel, capacity), `onInputChange` handlers, `handlePowerCurveChange` handler, `t` function for translations, refs (`hubHeightRef`, `capacityRef`).

### 1.2. `SolarSpecificInputs.tsx`

**Purpose:** Group all form inputs that are only relevant for the 'solar' energy type.
**Contents:**

* `ValidatedInput` for elevation.
* Associated labels and styling.

**Props Needed:** Values from `formData` (elevation), `onInputChange` handlers, `t` function for translations, refs (`elevationRef`).

### 1.3. `TemplateUploadSection.tsx`

**Purpose:** Encapsulate the logic for displaying the correct file upload component (`SolarTemplateUpload` or `WindTemplateUpload`) based on `energyType`.
**Contents:**

* The outer `Card` wrapper.
* Conditional rendering logic (`energyType === 'solar' ? ... : ...`).
* `SolarTemplateUpload` component instance.
* `WindTemplateUpload` component instance.
* Validation button and status indicators.
* Error message display.

**Props Needed:** `energyType`, `templateFile`, `handleTemplateFileChange`, `handleValidateFile`, validation states (`isFileValidated`, `validationErrorMsg`), loading states (`isValidationLoading`), and `formKey` for reset functionality.

### 1.4. `MapSection.tsx`

**Purpose:** Encapsulate the map selector and related UI elements.
**Contents:**

* `MapSelector` component.
* Conditional rendering for power curve file upload (when `energyType === 'wind'` and `formData.powerCurveModel === 'upload_custom'`).

**Props Needed:** `latitude`, `longitude`, `onCoordinateChange`, `powerCurveFile`, `formData`, `handlePowerCurveFileUploadCallback`, `formKey`, `energyType`.

## 2. Extract Business Logic into Custom Hooks

The current component contains complex business logic for validation, form state management, and API interactions. Extracting these into custom hooks will improve testability and reusability.

### 2.1. `useWindFileValidation.ts`

**Purpose:** Manage the validation state and logic for wind files.
**Functionality:**

* State management for wind validation (`isWindFileValidated`, `windValidationMessage`, etc.).
* Integration with `useValidateWindFilesMutation` hook.
* Validation logic from `handleValidateWindFiles`.
* Reset functionality.

**Return Values:** Validation states, validation function, reset function, and loading state.

### 2.2. `useSolarFileValidation.ts`

**Purpose:** Manage the validation state and logic for solar files.
**Functionality:**

* State management for solar validation (`isFileValidated`, `validationErrorMsg`, etc.).
* Integration with `useValidateSolarFileMutation` hook.
* Validation logic.
* Reset functionality.

**Return Values:** Validation states, validation function, reset function, and loading state.

### 2.3. `useForecastFormValidation.ts`

**Purpose:** Manage the overall form validation logic.
**Functionality:**

* Form validation logic from `validateFormInternal`.
* Integration with field-specific validations.
* Effect to run validation when dependencies change.

**Return Values:** Form validity state and validation function.

## 3. Refactor the Main Component

After extracting components and hooks, the main `TrainForecastForm` component will be significantly smaller and more focused on orchestration rather than implementation details.

### 3.1. Main Component Structure

```typescript
const TrainForecastForm: React.FC<TrainForecastFormProps> = (props) => {
  // Basic state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [powerCurveFile, setPowerCurveFile] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(1);
  
  // Use custom hooks
  const windValidation = useWindFileValidation(props.planType);
  const solarValidation = useSolarFileValidation();
  const formValidation = useForecastFormValidation(/* params */);
  
  // Handler functions (simplified)
  const handleTemplateFileChange = useCallback(/* ... */, [/* ... */]);
  const handleValidateFile = useCallback(/* ... */, [/* ... */]);
  const handleSubmit = useCallback(/* ... */, [/* ... */]);
  
  // Render UI with extracted components
  return (
    <div key={formKey} className="space-y-8">
      <Card>
        <form onSubmit={/* ... */}>
          <div className="flex flex-col gap-6 pb-6 md:flex-row">
            <MapSection /* props */ />
            
            {props.energyType === 'wind' ? (
              <WindSpecificInputs /* props */ />
            ) : (
              <SolarSpecificInputs /* props */ />
            )}
          </div>
          
          <TemplateUploadSection /* props */ />
          
          <FormActions /* props */ />
        </form>
      </Card>
    </div>
  );
};
```

## 4. Implementation Strategy

1. Start by extracting the custom hooks, as they contain the most complex logic.
2. Create the UI components one by one, testing each after implementation.
3. Refactor the main component to use the new hooks and components.
4. Add comprehensive tests for each extracted piece.
5. Ensure the refactored component maintains feature parity with the original.

## 5. Benefits of This Approach

1. **Improved Maintainability**: Smaller, focused components and hooks are easier to understand and maintain.
2. **Better Code Reuse**: The extracted hooks and components can be reused in other parts of the application.
3. **Separation of Concerns**: Validation logic is separated from UI rendering, and UI is organized by purpose.
4. **Testability**: Smaller units are easier to test in isolation.
5. **Performance**: By using proper dependency arrays in useCallback and useEffect, we can avoid unnecessary re-renders.
6. **Readability**: The main component becomes more readable by delegating implementation details to other files.
**Props Needed:** `energyType`, file handling callbacks (`handleTemplateFileChange`, `setTemplateFile`), download handlers (`downloadSolar...`, `downloadWind...`), validation handlers (`handleValidateFile`, `handleValidateWindFiles`), validation state (`isValidationLoading`, `isWindValidationLoading`, `validationErrorMsg`, `windValidationMessage`, `isFileValidated`, `isWindFileValidated`), `formKey`, `t` function.

## 2. Create Custom Hook: `useTrainFileValidation`

The logic for handling backend file validation (`useValidateSolarFileMutation` and `useValidateWindFilesMutation`) is complex and involves managing multiple state variables. Extracting this into a custom hook will centralize this responsibility.

**Purpose:** Manage the state and logic associated with backend validation of uploaded template/power curve files.
**Responsibilities:**

* Internally call `useValidateSolarFileMutation` and `useValidateWindFilesMutation`.
* Define `onSuccess` and `onError` handlers for these mutations.
* Manage validation-related state.
* Expose functions to trigger validation for solar or wind.
* Expose the current validation status and messages.
**State to Manage:** `isSolarLoading`, `isWindLoading`, `isSolarValidated`, `isWindValidated`, `solarValidationMessage`, `windValidationMessage`, `validatedSolarFilename`.
**Functions to Expose:** `triggerSolarValidation(file)`, `triggerWindValidation(params)`, `resetValidationState()`.
**Return Value:** An object containing the necessary state flags and messages (e.g., `{ isLoading, isValidated, validationMessage, validatedFilename }`).

## 3. Simplify `TrainForecastForm.tsx`

After creating the components and the hook:

**Update JSX:** Replace the extracted sections with the new components (`<WindSpecificInputs ... />`, `<TemplateUploadSection ... />`).
**Integrate Hook:** Replace the direct usage of validation mutation hooks and related `useState`/`useCallback` definitions with the new `useTrainFileValidation` hook.
**Refactor `validateFormInternal`:** Simplify the internal form validation logic to check basic field validity and the `isValidated` flag returned by the `useTrainFileValidation` hook.
**Refactor `handleSubmit`:** Update the submission logic to use state/filenames provided by the `useTrainFileValidation` hook where necessary.

## Benefits

**Reduced Complexity:** `TrainForecastForm` becomes significantly smaller and easier to understand.
**Improved Reusability:** The extracted components and hook can potentially be reused or adapted elsewhere.
**Better Separation of Concerns:** Each part focuses on a specific task (rendering wind inputs, handling template uploads, managing validation state).
**Increased Testability:** Smaller, focused units are generally easier to test in isolation.
