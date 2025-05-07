import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, getOrders } from "../services/mockData/ordersMockApi";

interface UseOrderManagementOptions {
  initialShowOrderView?: boolean;
}

export function useOrderManagement({ 
  initialShowOrderView = false 
}: UseOrderManagementOptions = {}) {
  // State to control showing the order view
  const [showOrderView, setShowOrderView] = useState<boolean>(initialShowOrderView);
  // State to control the success dialog
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  
  // State for visualization modal
  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderEnergyType, setSelectedOrderEnergyType] = useState<"solar" | "wind">("solar");
  
  // State for tracking mutation state
  const [mutationState, setMutationState] = useState<{
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
  }>({
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
  });

  // Fetch orders when in order view
  const { data: orders = [], refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: showOrderView,
    refetchOnWindowFocus: false,
    staleTime: 0, // Set to 0 to always consider data stale and allow refetching
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Handle form submission success
  const handleFormSubmitSuccess = useCallback(() => {
    console.log("Form submitted successfully, opening success dialog");

    // Open the success dialog instead of switching view
    setIsSuccessDialogOpen(true);

    // Explicitly refetch orders in the background
    setTimeout(() => {
      console.log("Explicitly refetching orders after submission");
      refetchOrders();
    }, 100); // Keep timeout for potential race condition avoidance
  }, [refetchOrders]);

  // Handle returning to the form view
  const handleNewOrder = useCallback(() => {
    console.log("Creating new order, hiding order view");
    setShowOrderView(false);
  }, []);

  // Handle order visualization
  const handleVisualizeOrder = useCallback(
    (orderId: string) => {
      console.log(`Visualizing order ${orderId}`);

      // Find the order to get its energy type
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrderId(orderId);
        setSelectedOrderEnergyType(order.energyType);
        setIsVisualizationModalOpen(true);
      }
    },
    [orders]
  );

  // Handle closing the visualization modal
  const handleCloseVisualizationModal = useCallback(() => {
    setIsVisualizationModalOpen(false);
    setSelectedOrderId(null);
  }, []);

  // Handle mutation state changes
  const handleMutationStateChange = useCallback((state: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
  }) => {
    setMutationState(state);
  }, []);

  return {
    orders,
    showOrderView,
    isVisualizationModalOpen,
    selectedOrderId,
    selectedOrderEnergyType,
    mutationState,
    handleFormSubmitSuccess,
    handleNewOrder,
    handleVisualizeOrder,
    handleCloseVisualizationModal,
    handleMutationStateChange,
    setShowOrderView,
    refetchOrders,
    isSuccessDialogOpen,
    setIsSuccessDialogOpen,
  };
}
