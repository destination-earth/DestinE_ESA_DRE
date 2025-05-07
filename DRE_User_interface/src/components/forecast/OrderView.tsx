import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { Order } from "../../services/mockData/ordersMockApi";

interface OrderViewProps {
  orders: Order[];
  onNewOrder: () => void;
  onVisualize: (orderId: string) => void;
}

// Use React.memo to prevent unnecessary re-renders
const OrderView: React.FC<OrderViewProps> = React.memo(
  ({ orders, onNewOrder, onVisualize }) => {
    const { t } = useTranslation();

    // Memoize the sorted orders to maintain referential stability
    const sortedOrders = useMemo(() => {
      return [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }, [orders]);

    // Format date from ISO string to DD/MM/YY HH:MM
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(2);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {t("forecast.orderView.title", "Your Orders")}
          </h2>
        </div>

        {sortedOrders.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {t(
                "forecast.orderView.noOrders",
                "No orders found. Create a new order to get started.",
              )}
            </p>
          </Card>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 border-b border-gray-200 pb-2 text-sm font-medium text-gray-600">
              <div className="col-span-3 flex items-center">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t("forecast.orderView.date", "Date")}
                </span>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {t("forecast.orderView.energySource", "Energy Source")}
                </span>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {t("forecast.orderView.plan", "Plan")}
                </span>
              </div>
              <div className="col-span-3"></div>
            </div>

            {/* Table rows */}
            <div className="space-y-1 pt-2">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 gap-4 border-b border-gray-100 py-4 text-sm"
                >
                  <div className="col-span-3 flex items-center">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="col-span-3 flex items-center capitalize">
                    {order.energyType}
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs text-pink-800">
                      {order.plan}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end">
                    <Button
                      onClick={() => onVisualize(order.id)}
                      className="rounded border-none bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      {t("forecast.orderView.visualize", "VISUALIZE")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* NEW ORDER button at the bottom right */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={onNewOrder}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                {t("forecast.orderView.newOrder", "NEW ORDER")}
              </Button>
            </div>
          </div>
        )}

        {/* Show NEW ORDER button at the bottom right even when there are no orders */}
        {sortedOrders.length === 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onNewOrder}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              {t("forecast.orderView.newOrder", "NEW ORDER")}
            </Button>
          </div>
        )}
      </div>
    );
  },
);

// Add displayName for better debugging
OrderView.displayName = "OrderView";

export default OrderView;
