/**
 * Utility functions for template downloads
 */

// Base URL for templates
const BASE_TEMPLATE_URL = 'https://hyrefapp.dev.desp.space/templates/forecast';

/**
 * Template types
 */
export enum TemplateType {
  TRAIN_DATA = 'train_data',
  POWER_CURVE = 'power_curve'
}

/**
 * Energy types
 */
export enum EnergyType {
  WIND = 'wind',
  SOLAR = 'solar'
}

/**
 * Get the appropriate template URL based on the template type and energy type
 * @param templateType The type of template (train_data or power_curve)
 * @param energyType The energy type (wind or solar)
 * @returns The URL to download the template
 */
export const getTemplateUrl = (
  templateType: TemplateType,
  energyType: EnergyType
): string => {
  // Power curve templates are only available for wind
  if (templateType === TemplateType.POWER_CURVE) {
    return `${BASE_TEMPLATE_URL}/wind/power_curve.csv`;
  }

  // Train data templates are available for both wind and solar
  return `${BASE_TEMPLATE_URL}/${energyType}/train_data.csv`;
};

/**
 * Get the appropriate filename for the template
 * @param templateType The type of template (train_data or power_curve)
 * @param energyType The energy type (wind or solar)
 * @returns The suggested filename for the template
 */
export const getTemplateFileName = (
  templateType: TemplateType,
  energyType: EnergyType
): string => {
  if (templateType === TemplateType.POWER_CURVE) {
    return 'power_curve_template.csv';
  }
  
  return `${energyType}_${templateType}_template.csv`;
};
