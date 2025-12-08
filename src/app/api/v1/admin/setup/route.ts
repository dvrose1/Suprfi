// ABOUTME: Setup endpoint to create initial God user
// ABOUTME: Only works if no admin users exist

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if any admin users already exist
    const existingUsers = await prisma.adminUser.count();
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Admin users already exist. Contact existing admin for access.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create God user
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'god',
        name: name || 'Admin',
        isActive: true,
      },
    });

    console.log(`[Setup] Created God user: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'God user created. You can now login at /admin/login',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Check if setup is needed
export async function GET() {
  try {
    const existingUsers = await prisma.adminUser.count();
    
    return NextResponse.json({
      setupRequired: existingUsers === 0,
      message: existingUsers === 0 
        ? 'No admin users exist. Use POST to create the first God user.' 
        : 'Admin users already exist.',
    });
  } catch (error) {
    console.error('[Setup] Error checking status:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
