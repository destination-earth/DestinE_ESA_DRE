import React, { useState, useEffect, useRef } from "react";
import Card from "../ui/Card";
import SectionHeader from "../commonFormComponents/SectionHeader";
import FormActions from "../commonFormComponents/FormActions";
import FloatingLabelSelect from "../commonFormComponents/FloatingLabelSelect";
import CoordinateInputs from "../commonFormComponents/CoordinateInputs";
import InfoBox from "../commonFormComponents/InfoBox";

interface ForecastTabProps {
  energyType?: "solar" | "wind";
}

interface FormData {
  latitude: string;
  longitude: string;
  forecastDays: string;
  forecastInterval: string;
}

const ForecastTab = ({
  energyType,
}: ForecastTabProps): React.ReactNode => {
  // Track if this is the first render
  const isFirstRender = useRef(true);
  
  // Use the provided energyType, but default to solar only on first render if undefined
  const effectiveEnergyType = isFirstRender.current && !energyType ? "solar" : energyType;
  
  // After first render, set isFirstRender to false
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    latitude: "",
    longitude: "",
    forecastDays: "7", // Default to 7 days
    forecastInterval: "hourly", // Default to hourly
  });

  // Validation functions
  const requiredValidation = (value: string) => value.trim() !== "";

  const latitudeValidation = (value: string) => {
    if (value === "") return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= -90 && num <= 90;
  };

  const longitudeValidation = (value: string) => {
    if (value === "") return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= -180 && num <= 180;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      requiredValidation(formData.latitude) &&
      latitudeValidation(formData.latitude) &&
      requiredValidation(formData.longitude) &&
      longitudeValidation(formData.longitude) &&
      requiredValidation(formData.forecastDays) &&
      requiredValidation(formData.forecastInterval)
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      console.log("Form submitted:", formData);
      // TODO: Implement API call
    }
  };

  const handleClear = () => {
    setFormData({
      latitude: "",
      longitude: "",
      forecastDays: "7",
      forecastInterval: "hourly",
    });
  };

  const getSectionTitle = () => {
    if (effectiveEnergyType === "solar") {
      return "Solar Energy Production Forecast";
    } else if (effectiveEnergyType === "wind") {
      return "Wind Energy Production Forecast";
    }
    return "No Energy Type Selected";
  };

  const getSectionDescription = () => {
    if (effectiveEnergyType === "solar") {
      return "Get accurate hourly or daily forecasts of solar radiation and power production for your location. Simply enter your coordinates to generate a detailed forecast for the next 7 days. This tool helps optimize operations, reduce balancing costs, and improve grid integration.";
    } else if (effectiveEnergyType === "wind") {
      return "Get accurate hourly or daily forecasts of wind speed and power production for your location. Simply enter your coordinates to generate a detailed forecast for the next 7 days. This tool helps optimize operations, reduce balancing costs, and improve grid integration.";
    }
    return "Please select an energy type";
  };

  // Effect to reset form when energy type changes
  useEffect(() => {
    // Reset the form when energy type changes
    handleClear();
  }, [energyType]);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <SectionHeader
            title={getSectionTitle()}
            description={getSectionDescription()}
          />
        </Card>

        <Card>
          {effectiveEnergyType === "solar" && (
            <div className="mb-6">
              <InfoBox
                title="Solar Forecast Information"
                text="The solar forecast provides predictions for Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI), as well as estimated power production based on your solar park specifications. For more detailed power production forecasts, please use the Premium Forecast service."
              />
            </div>
          )}

          {effectiveEnergyType === "wind" && (
            <div className="mb-6">
              <InfoBox
                title="Wind Forecast Information"
                text="The wind forecast provides predictions for wind speed and direction at 10m, 50m, and 100m heights, as well as estimated power production based on standard power curves. For more detailed power production forecasts with custom power curves, please use the Premium Forecast service."
              />
            </div>
          )}
        </Card>
        
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <CoordinateInputs
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLatitudeChange={handleInputChange("latitude")}
                onLongitudeChange={handleInputChange("longitude")}
                validateLatitude={latitudeValidation}
                validateLongitude={longitudeValidation}
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FloatingLabelSelect
                id="forecastDays"
                label="Forecast Days"
                value={formData.forecastDays}
                onChange={handleInputChange("forecastDays")}
                options={[
                  { value: "1", label: "1 Day" },
                  { value: "3", label: "3 Days" },
                  { value: "5", label: "5 Days" },
                  { value: "7", label: "7 Days" },
                ]}
              />

              <FloatingLabelSelect
                id="forecastInterval"
                label="Forecast Interval"
                value={formData.forecastInterval}
                onChange={handleInputChange("forecastInterval")}
                options={[
                  { value: "hourly", label: "Hourly" },
                  { value: "daily", label: "Daily" },
                ]}
              />
            </div>

            <FormActions
              onClear={handleClear}
              onSubmit={handleSubmit}
              isSubmitDisabled={!isFormValid()}
            />
          </form>
        </Card>
      </div>
    </>
  );
};

export default ForecastTab;
