// Define the Order type
export interface Order {
  id: string;
  energyType: 'solar' | 'wind';
  plan: 'One-off' | 'Annual';
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

// In-memory storage for orders
let orders: Order[] = [
  {
    id: '1',
    energyType: 'solar',
    plan: 'One-off',
    createdAt: '2025-03-13T14:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    energyType: 'solar',
    plan: 'One-off',
    createdAt: '2025-03-13T15:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    energyType: 'solar',
    plan: 'One-off',
    createdAt: '2025-03-13T16:20:00Z',
    status: 'pending'
  },
  {
    id: '4',
    energyType: 'solar',
    plan: 'One-off',
    createdAt: '2025-03-13T17:10:00Z',
    status: 'pending'
  },
];

// Function to get all orders
export const getOrders = (): Order[] => {
  console.log("Getting orders:", orders);
  return [...orders];
};

// Function to get an order by ID
export const getOrderById = (id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

// Function to add a new order
export const addOrder = (
  energyType: 'solar' | 'wind',
  plan: 'One-off' | 'Annual'
): Order => {
  // Create a unique ID using timestamp and random string to ensure uniqueness
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const id = `${timestamp}-${randomStr}`;
  
  const newOrder: Order = {
    id,
    energyType,
    plan,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Add the order to our in-memory storage
  orders = [...orders, newOrder];
  
  console.log(`Added new ${energyType} order with ID: ${id}`);
  console.log("Current orders:", orders);
  
  return newOrder;
};

// Function to update an order status
export const updateOrderStatus = (
  id: string,
  status: 'pending' | 'completed' | 'failed'
): Order | undefined => {
  const orderIndex = orders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    return undefined;
  }
  
  // Create a new array with the updated order
  const updatedOrders = [
    ...orders.slice(0, orderIndex),
    { ...orders[orderIndex], status },
    ...orders.slice(orderIndex + 1)
  ];
  
  orders = updatedOrders;
  
  return orders[orderIndex];
};

// Function to delete an order
export const deleteOrder = (id: string): boolean => {
  const initialLength = orders.length;
  orders = orders.filter(order => order.id !== id);
  return orders.length < initialLength;
};

// Function to clear all orders (for testing purposes)
export const clearOrders = (): void => {
  orders = [];
};
