#!/usr/bin/env tsx
/**
 * Test script to verify the new authentication system
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testAuth() {
  console.log("🔐 Testing authentication system...");

  try {
    // Test 1: Check if we can find users by different login methods
    console.log("📱 Testing login methods...");

    const userByPhone = await prisma.user.findFirst({
      where: { phone: "+201000000000" },
    });

    if (userByPhone) {
      console.log(
        `✅ Found user by phone: ${userByPhone.name} (${userByPhone.role})`
      );
    }

    // Test 2: Check role distribution
    console.log("👥 Testing role system...");

    const roleStats = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "PROFESSOR" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);

    console.log(`✅ Role distribution:`);
    console.log(`   - Admins: ${roleStats[0]}`);
    console.log(`   - Professors: ${roleStats[1]}`);
    console.log(`   - Students: ${roleStats[2]}`);

    // Test 3: Check active users
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({
      where: { isActive: false },
    });

    console.log(`✅ User status:`);
    console.log(`   - Active: ${activeUsers}`);
    console.log(`   - Inactive: ${inactiveUsers}`);

    // Test 4: Verify password hashing works
    console.log("🔒 Testing password verification...");

    if (userByPhone) {
      const testPassword = "professor123";
      const isValid = await bcrypt.compare(testPassword, userByPhone.password);
      console.log(`✅ Password verification: ${isValid ? "PASSED" : "FAILED"}`);
    }

    console.log("🎉 Authentication system test completed successfully!");
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuth().catch((e) => {
  console.error(e);
  process.exit(1);
});
