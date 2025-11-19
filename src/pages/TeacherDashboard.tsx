import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookingRequests } from '../components/Teacher/BookingRequests';
import { RoutineManager } from '../components/Teacher/RoutineManager';
import { GraduationCap, Calendar, Clock, LogOut } from 'lucide-react';

export function TeacherDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'routine'>('requests');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Counselling Portal</h1>
                <p className="text-xs text-gray-600">Teacher Dashboard</p>
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
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Booking Requests
            </button>
            <button
              onClick={() => setActiveTab('routine')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'routine'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Manage Routine
            </button>
          </div>
        </div>

        {activeTab === 'requests' ? <BookingRequests /> : <RoutineManager />}
      </div>
    </div>
  );
}
