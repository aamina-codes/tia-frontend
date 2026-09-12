export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_notes: {
        Row: {
          appointment_date: string
          created_at: string
          follow_up_date: string | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checklist: {
        Row: {
          completed: boolean
          created_at: string
          entry_date: string
          id: string
          item_key: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          entry_date?: string
          id?: string
          item_key: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          entry_date?: string
          id?: string
          item_key?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_questions: {
        Row: {
          created_at: string
          id: string
          is_discussed: boolean
          question: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_discussed?: boolean
          question: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_discussed?: boolean
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      health_tracker: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          id: string
          mood: string | null
          notes: string | null
          synced_from_report_id: string | null
          t3_level: number | null
          t4_level: number | null
          tsh_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          synced_from_report_id?: string | null
          t3_level?: number | null
          t4_level?: number | null
          tsh_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          synced_from_report_id?: string | null
          t3_level?: number | null
          t4_level?: number | null
          tsh_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_tracker_synced_from_report_id_fkey"
            columns: ["synced_from_report_id"]
            isOneToOne: false
            referencedRelation: "lab_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reports: {
        Row: {
          ai_recommendations: string | null
          ai_summary: string | null
          created_at: string
          file_size: number | null
          id: string
          report_name: string
          report_type: string
          report_url: string | null
          t3_level: number | null
          t3_status: string | null
          t4_level: number | null
          t4_status: string | null
          tsh_level: number | null
          tsh_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          report_name: string
          report_type: string
          report_url?: string | null
          t3_level?: number | null
          t3_status?: string | null
          t4_level?: number | null
          t4_status?: string | null
          tsh_level?: number | null
          tsh_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          report_name?: string
          report_type?: string
          report_url?: string | null
          t3_level?: number | null
          t3_status?: string | null
          t4_level?: number | null
          t4_status?: string | null
          tsh_level?: number | null
          tsh_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          diagnosis_date: string | null
          diagnosis_type: string | null
          doctor_clinic: string | null
          doctor_contact: string | null
          doctor_name: string | null
          doctor_specialty: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          health_goals: string[]
          id: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          diagnosis_date?: string | null
          diagnosis_type?: string | null
          doctor_clinic?: string | null
          doctor_contact?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          health_goals?: string[]
          id?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          diagnosis_date?: string | null
          diagnosis_type?: string | null
          doctor_clinic?: string | null
          doctor_contact?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          health_goals?: string[]
          id?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean
          reminder_date: string
          reminder_time: string | null
          reminder_type: string
          synced_from_report_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          reminder_date: string
          reminder_time?: string | null
          reminder_type: string
          synced_from_report_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          reminder_date?: string
          reminder_time?: string | null
          reminder_type?: string
          synced_from_report_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_synced_from_report_id_fkey"
            columns: ["synced_from_report_id"]
            isOneToOne: false
            referencedRelation: "lab_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
