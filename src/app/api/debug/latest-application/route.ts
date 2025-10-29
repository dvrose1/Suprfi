import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const app = await prisma.application.findFirst({
      where: {
        customer: {
          firstName: 'Emma',
          lastName: 'Rodriguez'
        }
      },
      include: {
        customer: true,
        job: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!app) {
      return NextResponse.json({ error: 'No application found' }, { status: 404 })
    }

    return NextResponse.json({
      link: `http://localhost:3000/apply/${app.token}`,
      customer: `${app.customer.firstName} ${app.customer.lastName}`,
      amount: Number(app.job.estimateAmount),
      service: app.job.serviceType,
      status: app.status,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
