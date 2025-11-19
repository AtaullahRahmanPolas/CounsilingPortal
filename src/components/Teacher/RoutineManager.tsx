import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type TeacherRoutine = Database['public']['Tables']['teacher_routines']['Row'];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function RoutineManager() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<TeacherRoutine[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadRoutines();
    }
  }, [user]);

  const loadRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_routines')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setRoutines(data || []);
    } catch (err) {
      console.error('Error loading routines:', err);
    }
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (startTime >= endTime) {
        throw new Error('End time must be after start time');
      }

      const { error: insertError } = await supabase
        .from('teacher_routines')
        .insert({
          teacher_id: user!.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_active: true
        });

      if (insertError) throw insertError;

      await loadRoutines();
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add routine');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teacher_routines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadRoutines();
    } catch (err) {
      console.error('Error deleting routine:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teacher_routines')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadRoutines();
    } catch (err) {
      console.error('Error toggling routine:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Counselling Routine</h2>

      <form onSubmit={handleAddRoutine} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Time Slot</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </form>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Current Schedule</h3>
        {routines.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No routine set yet. Add time slots above.</p>
        ) : (
          <div className="space-y-2">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  routine.is_active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 min-w-[100px]">
                    {DAYS[routine.day_of_week]}
                  </span>
                  <span className="text-gray-600">
                    {routine.start_time} - {routine.end_time}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      routine.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {routine.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(routine.id, routine.is_active)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    {routine.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
