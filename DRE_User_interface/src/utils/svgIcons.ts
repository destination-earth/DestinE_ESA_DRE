/**
 * SVG icons utility
 * Contains reusable SVG icons for use throughout the application
 */

/**
 * Download icon with customizable size 
 */
export const getDownloadIcon = (size: number = 6): string => {
  // Use a filled download icon that will be more visible
  return `<svg class="h-${size} w-${size}" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C12.5523 2 13 2.44772 13 3V13.5858L16.2929 10.2929C16.6834 9.90237 17.3166 9.90237 17.7071 10.2929C18.0976 10.6834 18.0976 11.3166 17.7071 11.7071L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L6.29289 11.7071C5.90237 11.3166 5.90237 10.6834 6.29289 10.2929C6.68342 9.90237 7.31658 9.90237 7.70711 10.2929L11 13.5858V3C11 2.44772 11.4477 2 12 2ZM4 16C4.55228 16 5 16.4477 5 17V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V17C19 16.4477 19.4477 16 20 16C20.5523 16 21 16.4477 21 17V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V17C3 16.4477 3.44772 16 4 16Z" />
  </svg>`;
};

/**
 * Chart toolbar configuration with download icon
 */
export const getChartToolbarConfig = (
  filename: string,
  iconSize: number = 6
) => {
  return {
    show: true,
    tools: {
      download: getDownloadIcon(iconSize),
      selection: true,
      zoom: true,
      zoomin: true,
      zoomout: true,
      pan: true,
      reset: true
    },
    export: {
      csv: {
        filename: `${filename}-data`,
      },
      svg: {
        filename: `${filename}-chart`,
      },
      png: {
        filename: `${filename}-chart`,
      }
    }
  };
};
