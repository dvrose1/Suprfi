// TEMPORARY - DELETE AFTER USE
// Resets doug@suprfi.com password to: SuprFi2024!

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'doug@suprfi.com';
    const newPassword = 'SuprFi2024!';
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    
    if (existing) {
      await prisma.adminUser.update({
        where: { email },
        data: { passwordHash, isActive: true },
      });
      return NextResponse.json({ success: true, message: 'Password reset for existing user' });
    } else {
      await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          role: 'god',
          isActive: true,
          name: 'Doug',
        },
      });
      return NextResponse.json({ success: true, message: 'Created new god user' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
