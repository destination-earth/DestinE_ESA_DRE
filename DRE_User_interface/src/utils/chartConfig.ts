/**
 * Common chart toolbar configuration with custom icons
 */
export const getToolbarConfig = () => {
  return {
    show: true,
    tools: {
      download: true,
      selection: true,
      zoom: true,
      zoomin: true,
      zoomout: true,
      pan: true,
      reset: true
    },
    export: {
      csv: {
        filename: 'chart-data',
        columnDelimiter: ',',
        headerCategory: 'Date/Time',
        headerValue: 'Value'
      },
      svg: {
        filename: 'chart-image',
      },
      png: {
        filename: 'chart-image',
      }
    },
    autoSelected: 'zoom',
    // Custom icons for toolbar buttons
    icons: {
      menu: '<i class="fas fa-ellipsis-v"></i>',
      zoom: '<i class="fas fa-search-plus"></i>',
      zoomin: '<i class="fas fa-plus"></i>',
      zoomout: '<i class="fas fa-minus"></i>',
      pan: '<i class="fas fa-arrows-alt"></i>',
      reset: '<i class="fas fa-undo"></i>',
      download: '<i class="fas fa-download"></i>'
    }
  };
};
