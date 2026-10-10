import type { Metadata } from "next";
import { getOrders } from "@/lib/api";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Orders",
  description: "View recent RevoShop orders.",
};

export const dynamic = "force-dynamic";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function OrdersPage() {
  const orders = await getOrders(20, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
        Order management
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Recent Orders
      </h1>

      <p className="mt-3 text-slate-600">
        Showing up to 20 recent orders retrieved from the RevoShop API.
      </p>

      {orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Order #{order.id}
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Customer ID: {order.user_id}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-blue-700">
                    {order.status}
                  </span>

                  <p className="mt-2 text-xl font-bold text-blue-700">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Order items ({order.items.length})
                </h3>

                {order.items.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {order.items.map((item, index) => (
                      <li
                        key={`${item.product_id}-${index}`}
                        className="flex flex-wrap justify-between gap-2 text-sm text-slate-600"
                      >
                        <span>
                          Product #{item.product_id} × {item.quantity}
                        </span>
                        <span className="font-medium text-slate-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No items recorded for this order.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No orders found
          </h2>
          <p className="mt-2 text-slate-500">
            Orders will appear here when the API returns order records.
          </p>
        </div>
      )}
    </section>
  );
}
