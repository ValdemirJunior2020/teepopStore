// client/src/components/PayPalCheckout.jsx

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL;
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function buildMessage(error, fallback) {
  if (error?.message) return error.message;
  return fallback;
}

export default function PayPalCheckout({ cart, shippingInfo, shippingReady, onPaid }) {
  const { user } = useAuth();
  const [checkoutError, setCheckoutError] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!clientId) {
    return (
      <div className="notice error-notice">
        Missing VITE_PAYPAL_CLIENT_ID. Add it to client/.env locally and Netlify environment variables in production.
      </div>
    );
  }

  if (!apiBase) {
    return (
      <div className="notice error-notice">
        Missing VITE_API_BASE_URL. Add your Render server URL to Netlify environment variables.
      </div>
    );
  }

  if (!shippingReady) {
    return <div className="notice">Complete the shipping form first.</div>;
  }

  return (
    <div>
      {processing && <div className="notice">Processing your secure PayPal payment...</div>}
      {checkoutError && <div className="notice error-notice">{checkoutError}</div>}

      <PayPalScriptProvider
        options={{
          clientId,
          currency: "USD",
          intent: "capture",
          components: "buttons"
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "pill", label: "paypal" }}
          disabled={!cart.length || !shippingReady || processing}
          createOrder={async () => {
            setCheckoutError("");
            setProcessing(true);

            try {
              const response = await fetch(`${apiBase}/api/paypal/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart, shippingInfo })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Could not create PayPal order.");
              }

              return data.id;
            } catch (error) {
              setProcessing(false);
              setCheckoutError(buildMessage(error, "Could not start PayPal checkout."));
              throw error;
            }
          }}
          onApprove={async (data) => {
            try {
              const response = await fetch(`${apiBase}/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderID: data.orderID,
                  cart,
                  email: shippingInfo.email || user?.email || null,
                  shippingInfo
                })
              });

              const captureData = await response.json();

              if (!response.ok) {
                throw new Error(captureData.error || "Could not capture PayPal order.");
              }

              onPaid(captureData);
            } catch (error) {
              setCheckoutError(buildMessage(error, "Payment failed after approval."));
              throw error;
            } finally {
              setProcessing(false);
            }
          }}
          onCancel={() => {
            setProcessing(false);
            setCheckoutError("Payment was canceled. Your cart is still saved.");
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            setProcessing(false);
            setCheckoutError("PayPal checkout failed. Please try again or contact TeePoP support.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
