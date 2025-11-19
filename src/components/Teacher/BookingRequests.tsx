import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, BookOpen, FileText, Check, X } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Booking = Database['public']['Tables']['counselling_bookings']['Row'] & {
  student: { full_name: string; email: string };
};

export function BookingRequests() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('counselling_bookings')
        .select(`
          *,
          student:profiles!counselling_bookings_student_id_fkey(full_name, email)
        `)
        .eq('teacher_id', user!.id)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const { error } = await supabase
        .from('counselling_bookings')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
      await loadBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string, notes?: string) => {
    setActionLoading(bookingId);
    try {
      const { error } = await supabase
        .from('counselling_bookings')
        .update({
          status: 'rejected',
          teacher_notes: notes || 'Booking rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;
      await loadBookings();
    } catch (err) {
      console.error('Error rejecting booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Counselling Requests</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No booking requests yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {booking.student_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-7">{booking.student.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{booking.booking_time} (1.5 hours)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{booking.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{booking.course}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Card Number:</p>
                <p className="text-sm text-gray-600">{booking.card_number}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {booking.description}
                </p>
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
