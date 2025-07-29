// src/app/simple-payment-test/page.tsx
// Simple payment test page to debug issues

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimplePaymentTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDebugPayment = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🔍 Testing debug payment endpoint...");

      const response = await fetch("/api/debug-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: "debug-payment",
          courseId: "test-course",
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      setResult({
        status: response.status,
        data: data,
      });
    } catch (error) {
      console.error("Test failed:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testActualPayment = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🔍 Testing actual payment initiation...");

      // First get a course
      const coursesResponse = await fetch("/api/courses?limit=1");
      const coursesData = await coursesResponse.json();

      if (coursesData.courses.length === 0) {
        throw new Error("No courses found");
      }

      const course = coursesData.courses[0];
      console.log("Using course:", course.title);

      // Try payment initiation
      const paymentResponse = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      console.log("Payment response status:", paymentResponse.status);
      console.log("Payment response headers:", paymentResponse.headers);

      // Check if response is JSON or HTML
      const contentType = paymentResponse.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        const paymentData = await paymentResponse.json();
        console.log("Payment response data:", paymentData);

        setResult({
          status: paymentResponse.status,
          data: paymentData,
          course: {
            id: course.id,
            title: course.title,
            price: course.price,
          },
        });
      } else {
        // Response is HTML (error page)
        const htmlText = await paymentResponse.text();
        console.log(
          "HTML response (first 500 chars):",
          htmlText.substring(0, 500)
        );

        setResult({
          status: paymentResponse.status,
          error: "Server returned HTML instead of JSON",
          htmlPreview: htmlText.substring(0, 500),
        });
      }
    } catch (error) {
      console.error("Payment test failed:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Simple Payment Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testDebugPayment} disabled={loading}>
              Test Debug Endpoint
            </Button>
            <Button onClick={testActualPayment} disabled={loading}>
              Test Actual Payment
            </Button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2">Testing...</p>
            </div>
          )}

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
