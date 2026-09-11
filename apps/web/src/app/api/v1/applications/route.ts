import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received new merchant application via Next.js API Route:', body);

    // Simulate database transaction or CRM ingestion delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return success to the frontend wizard
    return NextResponse.json({
      success: true,
      applicationId: `APP-${Math.floor(Math.random() * 1000000)}`,
      // Route the user to the proper post-lead-capture success state
      continueUrl: '/success', 
    });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
