// Type declarations for our custom modules
declare module "../../services/mockData/ordersMockApi" {
  export interface Order {
    id: string;
    energyType: 'solar' | 'wind';
    plan: 'One-off' | 'Annual';
    createdAt: string;
    status: 'pending' | 'completed' | 'failed';
  }

  export function getOrders(): Order[];
  export function getOrderById(id: string): Order | undefined;
  export function addOrder(energyType: 'solar' | 'wind', plan: 'One-off' | 'Annual'): Order;
  export function updateOrderStatus(id: string, status: 'pending' | 'completed' | 'failed'): Order | undefined;
  export function deleteOrder(id: string): boolean;
  export function clearOrders(): void;
}

// Also add a declaration for the relative path from components/forecast
declare module "../services/mockData/ordersMockApi" {
  export * from "../../services/mockData/ordersMockApi";
}

declare module "./OrderView" {
  import React from 'react';
  import { Order } from '../../services/mockData/ordersMockApi';
  
  interface OrderViewProps {
    orders: Order[];
    onNewOrder: () => void;
    onVisualize: (orderId: string) => void;
  }
  
  const OrderView: React.FC<OrderViewProps>;
  export default OrderView;
}
