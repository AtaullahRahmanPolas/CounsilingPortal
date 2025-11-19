export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'teacher' | 'admin';
          card_number: string | null;
          course: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'teacher' | 'admin';
          card_number?: string | null;
          course?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'student' | 'teacher' | 'admin';
          card_number?: string | null;
          course?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teacher_routines: {
        Row: {
          id: string;
          teacher_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      counselling_bookings: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          student_name: string;
          card_number: string;
          course: string;
          subject: string;
          description: string;
          booking_date: string;
          booking_time: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed';
          teacher_notes: string | null;
          notification_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          student_name: string;
          card_number: string;
          course: string;
          subject: string;
          description: string;
          booking_date: string;
          booking_time: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          teacher_notes?: string | null;
          notification_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          student_name?: string;
          card_number?: string;
          course?: string;
          subject?: string;
          description?: string;
          booking_date?: string;
          booking_time?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          teacher_notes?: string | null;
          notification_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
