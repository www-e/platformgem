// src/app/api/student/payment-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const studentId = session.user.id;

    // Get student's payment statistics
    const payments = await prisma.payment.findMany({
      where: { userId: studentId },
    });

    // Calculate basic stats
    const totalTransactions = payments.length;
    const successfulPayments = payments.filter(
      (p) => p.status === "COMPLETED"
    ).length;
    const failedPayments = payments.filter(
      (p) => p.status === "FAILED"
    ).length;
    const cancelledPayments = payments.filter(
      (p) => p.status === "CANCELLED"
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.status === "PENDING"
    ).length;
    const totalSpent = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum: number, payment) => sum + Number(payment.amount), 0);

    const averageOrderValue =
      successfulPayments > 0 ? totalSpent / successfulPayments : 0;

    // Monthly spending (last 6 months)
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return (
          paymentDate >= monthStart &&
          paymentDate <= monthEnd &&
          payment.status === "COMPLETED"
        );
      });

      const monthAmount = monthPayments.reduce(
        (sum: number, payment) => sum + Number(payment.amount),
        0
      );

      monthlySpending.push({
        month: date.toLocaleDateString("ar-SA", {
          month: "long",
          year: "numeric",
        }),
        amount: monthAmount,
        transactions: monthPayments.length,
      });
    }

    // Payment methods statistics
    const paymentMethodsMap = new Map<string, { count: number; totalAmount: number }>();
    payments.forEach((payment) => {
      if (payment.status === "COMPLETED") {
        const method = payment.paymentMethod || "credit_card";
        if (!paymentMethodsMap.has(method)) {
          paymentMethodsMap.set(method, { count: 0, totalAmount: 0 });
        }
        const methodData = paymentMethodsMap.get(method)!;
        methodData.count++;
        methodData.totalAmount += Number(payment.amount);
      }
    });

    const paymentMethods = Array.from(paymentMethodsMap.entries()).map(
      ([method, data]) => ({
        method,
        count: data.count,
        totalAmount: data.totalAmount,
        percentage:
          successfulPayments > 0 ? (data.count / successfulPayments) * 100 : 0,
      })
    );

    const stats = {
      totalSpent,
      totalTransactions,
      successfulPayments,
      failedPayments,
      cancelledPayments,
      pendingPayments,
      averageOrderValue,
      successRate:
        totalTransactions > 0
          ? (successfulPayments / totalTransactions) * 100
          : 0,
      monthlySpending,
      paymentMethods,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Payment stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}
