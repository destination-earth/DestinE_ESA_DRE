import React from "react";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

interface FormActionsProps {
  onClear: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText?: string;
  clearButtonText?: string;
}

const FormActions = ({
  onClear,
  onSubmit,
  isSubmitDisabled,
  submitButtonText,
  clearButtonText,
}: FormActionsProps): React.ReactNode => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-6 flex justify-end space-x-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onClear}
        className="bg-blue-100 px-6 py-3 font-medium uppercase text-blue-800 hover:bg-blue-200"
      >
        {clearButtonText || t("forecast.common.button.clear", "CLEAR")}
      </Button>
      <Button
        type="submit"
        variant="outline"
        disabled={isSubmitDisabled}
        className={classNames(
          "border px-6 py-3 font-medium uppercase",
          isSubmitDisabled 
            ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "border-blue-500 bg-white text-blue-500 hover:bg-blue-50"
        )}
        onClick={onSubmit}
      >
        {submitButtonText || t("forecast.common.button.send", "SEND")}
      </Button>
    </div>
  );
};

export default FormActions;
