// ABOUTME: Merchant self-signup API endpoint
// ABOUTME: Creates new contractor and admin user in a single transaction

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SignupSchema = z.object({
  business: z.object({
    name: z.string().min(1, 'Business name is required'),
    type: z.string().min(1, 'Business type is required'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  user: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = SignupSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.contractorUser.findUnique({
      where: { email: data.user.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if business name already exists
    const existingContractor = await prisma.contractor.findFirst({
      where: { businessName: data.business.name },
    });

    if (existingContractor) {
      return NextResponse.json(
        { error: 'A business with this name already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.user.password, 12);

    // Create contractor and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create contractor
      const contractor = await tx.contractor.create({
        data: {
          email: data.user.email.toLowerCase(),
          name: data.user.name,
          businessName: data.business.name,
          phone: data.business.phone,
          serviceType: data.business.type,
          status: 'approved', // Auto-approve for now, can change to 'pending' later
        },
      });

      // Create admin user for the contractor
      const user = await tx.contractorUser.create({
        data: {
          contractorId: contractor.id,
          email: data.user.email.toLowerCase(),
          name: data.user.name,
          passwordHash,
          role: 'admin',
          isActive: true,
        },
      });

      return { contractor, user };
    });

    console.log(`New merchant signup: ${result.contractor.businessName} (${result.user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      contractorId: result.contractor.id,
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
