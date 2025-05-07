/**
 * Mock data structure for forecast orders
 * Each order contains:
 * - date: The date and time the order was submitted
 * - energySource: The active energy source (wind/solar) when the form was submitted
 * - plan: The type of plan (One-off or Annual)
 */

// Define the ForecastOrder interface
export interface ForecastOrder {
  id: string;
  date: string;
  energySource: 'solar' | 'wind';
  plan: 'One-off' | 'Annual';
  status: 'pending' | 'completed' | 'failed';
}

// Initial mock data for forecast orders
export const forecastOrders: ForecastOrder[] = [
  {
    id: '1',
    date: '2025-03-20T14:30:00Z',
    energySource: 'solar',
    plan: 'One-off',
    status: 'completed'
  },
  {
    id: '2',
    date: '2025-03-21T09:15:00Z',
    energySource: 'wind',
    plan: 'Annual',
    status: 'completed'
  },
  {
    id: '3',
    date: '2025-03-22T11:45:00Z',
    energySource: 'solar',
    plan: 'Annual',
    status: 'pending'
  }
];

/**
 * Function to add a new forecast order
 * @param energySource The energy source (solar or wind)
 * @param plan The plan type (One-off or Annual)
 * @returns The newly created order
 */
export const addForecastOrder = (
  energySource: 'solar' | 'wind',
  plan: 'One-off' | 'Annual'
): ForecastOrder => {
  // Generate a new ID (in a real app, this would be handled by the backend)
  const newId = (forecastOrders.length + 1).toString();
  
  // Create the new order with current date and time
  const newOrder: ForecastOrder = {
    id: newId,
    date: new Date().toISOString(),
    energySource,
    plan,
    status: 'pending'
  };
  
  // Add to the array
  forecastOrders.push(newOrder);
  
  return newOrder;
};

/**
 * Function to get all forecast orders
 * @returns Array of all forecast orders
 */
export const getAllForecastOrders = (): ForecastOrder[] => {
  return [...forecastOrders];
};

/**
 * Function to get a forecast order by ID
 * @param id The order ID to find
 * @returns The found order or undefined
 */
export const getForecastOrderById = (id: string): ForecastOrder | undefined => {
  return forecastOrders.find(order => order.id === id);
};

/**
 * Function to update a forecast order's status
 * @param id The order ID to update
 * @param status The new status
 * @returns The updated order or undefined if not found
 */
export const updateForecastOrderStatus = (
  id: string,
  status: 'pending' | 'completed' | 'failed'
): ForecastOrder | undefined => {
  const orderIndex = forecastOrders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    return undefined;
  }
  
  forecastOrders[orderIndex] = {
    ...forecastOrders[orderIndex],
    status
  };
  
  return forecastOrders[orderIndex];
};