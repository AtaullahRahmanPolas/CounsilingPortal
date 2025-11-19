import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookingForm } from '../components/Student/BookingForm';
import { MyBookings } from '../components/Student/MyBookings';
import { GraduationCap, Calendar, LogOut } from 'lucide-react';

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'book' | 'bookings'>('book');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Counselling Portal</h1>
                <p className="text-xs text-gray-600">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-600">{profile?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'book'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Session
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              My Bookings
            </button>
          </div>
        </div>

        {activeTab === 'book' ? <BookingForm /> : <MyBookings />}
      </div>
    </div>
  );
}
