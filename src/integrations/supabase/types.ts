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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          document_id: string | null
          feedback: string | null
          grade: number | null
          id: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          document_id?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          document_id?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assigned_to: string[] | null
          created_at: string | null
          created_by: string
          description: string | null
          doc_type: string
          due_date: string | null
          id: string
          title: string
        }
        Insert: {
          assigned_to?: string[] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          doc_type: string
          due_date?: string | null
          id?: string
          title: string
        }
        Update: {
          assigned_to?: string[] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          doc_type?: string
          due_date?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          created_at: string | null
          document_id: string
          expires_at: string | null
          id: string
          share_token: string | null
          shared_by: string | null
          team_members: string[] | null
          view_count: number | null
          visibility: Database["public"]["Enums"]["doc_visibility"]
        }
        Insert: {
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          id?: string
          share_token?: string | null
          shared_by?: string | null
          team_members?: string[] | null
          view_count?: number | null
          visibility?: Database["public"]["Enums"]["doc_visibility"]
        }
        Update: {
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          id?: string
          share_token?: string | null
          shared_by?: string | null
          team_members?: string[] | null
          view_count?: number | null
          visibility?: Database["public"]["Enums"]["doc_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          audience: string
          content: string
          created_at: string | null
          created_by: string | null
          detail_level: string
          document_id: string
          format: string
          id: string
          input: string
          template: string
          version_number: number
        }
        Insert: {
          audience: string
          content: string
          created_at?: string | null
          created_by?: string | null
          detail_level: string
          document_id: string
          format: string
          id?: string
          input: string
          template: string
          version_number: number
        }
        Update: {
          audience?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          detail_level?: string
          document_id?: string
          format?: string
          id?: string
          input?: string
          template?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          audience: string
          content: string
          created_at: string
          detail_level: string
          format: string
          id: string
          input: string
          parent_id: string | null
          template: string
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          audience: string
          content: string
          created_at?: string
          detail_level: string
          format: string
          id?: string
          input: string
          parent_id?: string | null
          template: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          audience?: string
          content?: string
          created_at?: string
          detail_level?: string
          format?: string
          id?: string
          input?: string
          parent_id?: string | null
          template?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          default_audience: string | null
          default_detail_level: string | null
          default_format: string | null
          description: string | null
          id: string
          is_official: boolean | null
          name: string
          sample_input: string | null
          template_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          default_audience?: string | null
          default_detail_level?: string | null
          default_format?: string | null
          description?: string | null
          id?: string
          is_official?: boolean | null
          name: string
          sample_input?: string | null
          template_type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          default_audience?: string | null
          default_detail_level?: string | null
          default_format?: string | null
          description?: string | null
          id?: string
          is_official?: boolean | null
          name?: string
          sample_input?: string | null
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string | null
          doc_type: string
          feedback_rating: number | null
          generation_time_ms: number | null
          id: string
          language: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          feedback_rating?: number | null
          generation_time_ms?: number | null
          id?: string
          language: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          feedback_rating?: number | null
          generation_time_ms?: number | null
          id?: string
          language?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "educator" | "student" | "user"
      doc_visibility: "private" | "team" | "public"
      notification_type:
        | "draft_reminder"
        | "collaboration"
        | "template_update"
        | "assignment"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "educator", "student", "user"],
      doc_visibility: ["private", "team", "public"],
      notification_type: [
        "draft_reminder",
        "collaboration",
        "template_update",
        "assignment",
      ],
    },
  },
} as const
