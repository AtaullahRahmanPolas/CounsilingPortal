import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  bookingId: string;
  studentEmail: string;
  teacherEmail: string;
  studentName: string;
  teacherName: string;
  bookingDate: string;
  bookingTime: string;
  subject: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: NotificationRequest = await req.json();

    const bookingDateTime = new Date(`${payload.bookingDate}T${payload.bookingTime}`);
    const notificationTime = new Date(bookingDateTime.getTime() - (2 * 60 * 60 * 1000));

    console.log('Notification scheduled for:', notificationTime);
    console.log('Booking details:', {
      student: payload.studentEmail,
      teacher: payload.teacherEmail,
      date: payload.bookingDate,
      time: payload.bookingTime,
    });

    const data = {
      success: true,
      message: 'Notification scheduled successfully',
      notificationTime: notificationTime.toISOString(),
      studentEmail: payload.studentEmail,
      teacherEmail: payload.teacherEmail,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});