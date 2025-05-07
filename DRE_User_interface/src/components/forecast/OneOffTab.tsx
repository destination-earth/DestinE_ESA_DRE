import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/Button";
import RadioButtonGroup from "../commonFormComponents/RadioButtonGroup";
import TrainForecastForm from "./TrainForecastForm";
import StandardForecastForm from "./StandardForecastForm";
import OrderView from "./OrderView";
import ForecastVisualizationModal from "./ForecastVisualizationModal";
import SuccessDialog from "../common/SuccessDialog";
import { useForecastForm } from "../../hooks/useForecastForm";
import { useOrderManagement } from "../../hooks/useOrderManagement";
import Card from "../ui/Card";
import SectionHeader from "../commonFormComponents/SectionHeader";
import {
  SolarTrainingDescription,
  WindTrainingDescription,
  SolarSpecsDescription,
  WindSpecsDescription,
} from "./text/ForecastOneoffText";

interface OneOffTabProps {
  energyType?: "solar" | "wind";
}

type ForecastOption = "train" | "standard";

const OneOffTab = ({
  energyType = "solar",
}: OneOffTabProps): React.ReactNode => {
  const { t } = useTranslation();
  // Always use solar as default if energyType is undefined or invalid
  const effectiveEnergyType =
    energyType === "solar" || energyType === "wind" ? energyType : "solar";

  // Use our custom hooks
  const [activeTab, setActiveTab] = React.useState<ForecastOption>("train");

  const navigate = useNavigate();

  const { formData, formKey, handleInputChange, handleClear, setFormKey } =
    useForecastForm({
      energyType: effectiveEnergyType,
      formMode: activeTab,
      sourceTab: "oneoff",
    });

  const {
    orders,
    showOrderView,
    isVisualizationModalOpen,
    selectedOrderId,
    selectedOrderEnergyType,
    handleFormSubmitSuccess,
    handleNewOrder,
    handleVisualizeOrder,
    handleCloseVisualizationModal,
    isSuccessDialogOpen,
    setIsSuccessDialogOpen,
    // setShowOrderView,
  } = useOrderManagement();

  // Effect to reset to train mode and clear form when energy type changes
  useEffect(() => {
    // Reset to train mode
    setActiveTab("train");

    // Clear the form when energy type changes
    handleClear();

    // Force re-render of child components
    setFormKey((prevKey) => prevKey + 1);
  }, [energyType, handleClear, setFormKey]);

  // Reset the form when returning from order view
  useEffect(() => {
    if (!showOrderView) {
      handleClear();
      setFormKey((prevKey) => prevKey + 1);
    }
  }, [showOrderView, handleClear, setFormKey]);

  const getRadioOptions = () => {
    if (energyType === "wind") {
      return [
        {
          value: "train",
          label: t(
            "forecast.oneoff.toggle.wind.train",
            "TRAIN USING YOUR OWN WIND SPEED AND ENERGY DATA",
          ),
        },
        {
          value: "standard",
          label: t(
            "forecast.oneoff.toggle.wind.standard",
            "WIND FARM SPECIFICATIONS",
          ),
        },
      ];
    } else {
      return [
        {
          value: "train",
          label: t(
            "forecast.oneoff.toggle.solar.train",
            "TRAIN USING YOUR OWN DATA",
          ),
        },
        {
          value: "standard",
          label: t(
            "forecast.oneoff.toggle.solar.standard",
            "PARK SPECIFICATIONS",
          ),
        },
      ];
    }
  };

  // Get title based on active tab and energy type
  const getTitle = () => {
    if (activeTab === "train") {
      return energyType === "solar"
        ? t("forecast.oneoff.title.solar.train", "Train Using Your Own Data")
        : t(
            "forecast.oneoff.title.wind.train",
            "Train using your own wind speed and energy data",
          );
    } else {
      return energyType === "solar"
        ? t("forecast.oneoff.title.solar.standard", "Solar Park Specifications")
        : t("forecast.oneoff.title.wind.standard", "Using power curves");
    }
  };

  // Get description based on active tab and energy type
  const getDescription = () => {
    if (activeTab === "train") {
      return energyType === "solar" ? (
        <SolarTrainingDescription />
      ) : (
        <WindTrainingDescription />
      );
    } else {
      return energyType === "solar" ? (
        <SolarSpecsDescription />
      ) : (
        <WindSpecsDescription />
      );
    }
  };

  const handleFormModeChange = (value: string) => {
    // Clear the form when changing between train and standard
    handleClear();

    // Update the forecast option
    setActiveTab(value as ForecastOption);

    // Force re-render of child components
    setFormKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      {/* Toggle between forecast options when not in order view */}
      {!showOrderView && (
        <div className="flex h-16 items-center justify-between">
          <RadioButtonGroup
            options={getRadioOptions()}
            selectedValue={activeTab}
            onChange={handleFormModeChange}
            name="forecast-mode"
            className="mb-4"
          />

          {/* Always reserve space for the button, but only show it when needed */}
          <div className="min-w-[150px]">
            {activeTab === "train" && (
              <Button
                type="button"
                variant="outline"
                className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                // onClick={() => setShowOrderView(true)}
                onClick={() => navigate({ to: "/archive" })}
              >
                {t("forecast.oneoff.button.visitArchive", "VISIT ARCHIVE")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Card with title and description */}
      {!showOrderView && (
        <Card>
          <div className="flex">
            <div className="mr-6">
              <div className="h-32 w-40 rounded bg-gray-200"></div>
            </div>
            <div>
              <SectionHeader
                title={getTitle()}
                description={getDescription()}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        onNavigate={() => {
          setIsSuccessDialogOpen(false);
          navigate({
            to: "/archive",
            search: { defaultType: "forecast" },
          });
        }}
        message={t(
          "forecast.oneoff.successDialog.message",
          "Your order has been submitted successfully",
        )}
        title={t(
          "forecast.oneoff.successDialog.title",
          "Submission Successful",
        )}
      />

      {/* Show order view or form based on state */}
      {showOrderView ? (
        <>
          {console.log("Rendering OrderView with orders:", orders)}
          <OrderView
            orders={orders}
            onNewOrder={handleNewOrder}
            onVisualize={handleVisualizeOrder}
          />
        </>
      ) : /* Render the appropriate form based on the selected option */
      activeTab === "train" ? (
        <TrainForecastForm
          key={formKey}
          energyType={effectiveEnergyType}
          planType="oneoff"
          formData={formData}
          onInputChange={handleInputChange}
          onClear={handleClear}
          onSubmit={handleFormSubmitSuccess}
          formMode="train"
          sourceTab="oneoff"
        />
      ) : (
        <StandardForecastForm
          key={`standard-${formKey}`}
          energyType={effectiveEnergyType}
          formData={formData}
          onInputChange={handleInputChange}
          onClear={handleClear}
          onSubmit={handleFormSubmitSuccess}
          sourceTab="oneoff"
        />
      )}
      {/* Render the visualization modal */}
      <ForecastVisualizationModal
        isOpen={isVisualizationModalOpen}
        onClose={handleCloseVisualizationModal}
        orderId={selectedOrderId}
        energyType={selectedOrderEnergyType}
      />
    </div>
  );
};

export default OneOffTab;
