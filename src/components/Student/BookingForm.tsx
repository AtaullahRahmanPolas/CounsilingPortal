import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TeacherRoutine = Database['public']['Tables']['teacher_routines']['Row'];

interface TimeSlot {
  time: string;
  available: boolean;
}

export function BookingForm() {
  const { user, profile } = useAuth();
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [studentName, setStudentName] = useState(profile?.full_name || '');
  const [cardNumber, setCardNumber] = useState(profile?.card_number || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher && bookingDate) {
      loadAvailableSlots();
    }
  }, [selectedTeacher, bookingDate]);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const selectedDate = new Date(bookingDate);
      const dayOfWeek = selectedDate.getDay();

      const { data: routines, error: routineError } = await supabase
        .from('teacher_routines')
        .select('*')
        .eq('teacher_id', selectedTeacher)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (routineError) throw routineError;

      const { data: existingBookings, error: bookingError } = await supabase
        .from('counselling_bookings')
        .select('booking_time')
        .eq('teacher_id', selectedTeacher)
        .eq('booking_date', bookingDate)
        .in('status', ['pending', 'approved']);

      if (bookingError) throw bookingError;

      const bookedTimes = new Set(existingBookings?.map(b => b.booking_time) || []);
      const slots: TimeSlot[] = [];

      if (routines && routines.length > 0) {
        routines.forEach((routine: TeacherRoutine) => {
          const startTime = parseTime(routine.start_time);
          const endTime = parseTime(routine.end_time);

          let currentTime = startTime;
          while (currentTime < endTime) {
            const timeStr = formatTime(currentTime);
            const nextTime = currentTime + 90;

            if (nextTime <= endTime) {
              slots.push({
                time: timeStr,
                available: !bookedTimes.has(timeStr)
              });
            }

            currentTime = nextTime;
          }
        });
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setAvailableSlots([]);
    }
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('counselling_bookings')
        .insert({
          student_id: user.id,
          teacher_id: selectedTeacher,
          student_name: studentName,
          card_number: cardNumber,
          course,
          subject,
          description,
          booking_date: bookingDate,
          booking_time: selectedTime,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setSelectedTeacher('');
      setSubject('');
      setDescription('');
      setBookingDate('');
      setSelectedTime('');
      setAvailableSlots([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Counselling Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
            Student Name
          </label>
          <input
            id="studentName"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <input
            id="course"
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
            Select Teacher
          </label>
          <select
            id="teacher"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Brief Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
            Booking Date
          </label>
          <input
            id="bookingDate"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots (1.5 hours)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedTime === slot.time
                      ? 'bg-blue-600 text-white'
                      : slot.available
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTeacher && bookingDate && availableSlots.length === 0 && (
          <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
            No available slots for this teacher on the selected date.
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            Booking submitted successfully! The teacher will review your request.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedTime}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Book Session'}
        </button>
      </form>
    </div>
  );
}
