"""
cams_tools

A package providing:
  - CAMSAuth: authentication against the Destination Earth DEDL identity service.
  - BaseQuery: abstract base for all CAMS STAC queries.
  - AssessmentQuery: implementation for solar radiation assessment timeseries.
  - ForecastQuery: implementation for CAMS forecast products.

Author: Rizos-Theodoros Chadoulis
Date: 2024-07-03
License: MIT
"""

__version__ = "0.1.0"
__author__ = "Rizos-Theodoros Chadoulis"
__license__ = "MIT"

import logging

# package-level logger
logger = logging.getLogger(__name__)

# Importing clases
from .cams_tools import (
    Authentication,
    BaseQuery,
    AssessmentQuery,
    ForecastQuery,
    CAMSGlobalAtmosphericCompositionForecast
)

# Importing functions
from .cams_tools import (
    preprocess_grib_file,
    seasonal_profile_dict_from_series
)

__all__ = [
    "Authentication",
    "BaseQuery",
    "ForecastQuery",
    "AssessmentQuery",
    "CAMSGlobalAtmosphericCompositionForecast",
    "preprocess_grib_file",
    "seasonal_profile_dict_from_series"
]


