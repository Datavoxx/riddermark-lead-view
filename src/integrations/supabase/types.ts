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
      cars: {
        Row: {
          arsmodell: number
          created_at: string | null
          id: string
          marke_modell: string
          regnr: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arsmodell: number
          created_at?: string | null
          id?: string
          marke_modell: string
          regnr: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arsmodell?: number
          created_at?: string | null
          id?: string
          marke_modell?: string
          regnr?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channel_participants: {
        Row: {
          channel_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_participants_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "group_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_1_id: string
          participant_2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1_id: string
          participant_2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1_id?: string
          participant_2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_drafts: {
        Row: {
          correlation_id: string
          created_at: string | null
          id: string
          lead_id: string | null
          resume_url: string | null
          status: string
          text: string
          user_id: string | null
        }
        Insert: {
          correlation_id: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          resume_url?: string | null
          status?: string
          text: string
          user_id?: string | null
        }
        Update: {
          correlation_id?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          resume_url?: string | null
          status?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      group_channels: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inbox_messages: {
        Row: {
          assigned_to: string | null
          body: string
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          received_at: string
          source: string
          starred: boolean
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          received_at?: string
          source?: string
          starred?: boolean
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          received_at?: string
          source?: string
          starred?: boolean
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          blocket_url: string | null
          claimed: boolean | null
          claimed_at: string | null
          claimed_by: string | null
          claimed_by_name: string | null
          completed_at: string | null
          created_at: string | null
          crm_stage: string | null
          crm_status: string | null
          deal_value: number | null
          id: string
          last_activity_at: string | null
          lead_email: string | null
          lead_namn: string | null
          link: string | null
          lost_reason: string | null
          message_id: string | null
          metadata: Json | null
          preview_description: string | null
          preview_image_url: string | null
          preview_title: string | null
          regnr: string | null
          resume_url: string | null
          source_channel: string | null
          subject: string | null
          summary: string | null
          summering: string | null
          updated_at: string | null
        }
        Insert: {
          blocket_url?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          claimed_by_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          crm_stage?: string | null
          crm_status?: string | null
          deal_value?: number | null
          id?: string
          last_activity_at?: string | null
          lead_email?: string | null
          lead_namn?: string | null
          link?: string | null
          lost_reason?: string | null
          message_id?: string | null
          metadata?: Json | null
          preview_description?: string | null
          preview_image_url?: string | null
          preview_title?: string | null
          regnr?: string | null
          resume_url?: string | null
          source_channel?: string | null
          subject?: string | null
          summary?: string | null
          summering?: string | null
          updated_at?: string | null
        }
        Update: {
          blocket_url?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          claimed_by_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          crm_stage?: string | null
          crm_status?: string | null
          deal_value?: number | null
          id?: string
          last_activity_at?: string | null
          lead_email?: string | null
          lead_namn?: string | null
          link?: string | null
          lost_reason?: string | null
          message_id?: string | null
          metadata?: Json | null
          preview_description?: string | null
          preview_image_url?: string | null
          preview_title?: string | null
          regnr?: string | null
          resume_url?: string | null
          source_channel?: string | null
          subject?: string | null
          summary?: string | null
          summering?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          sender_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          sender_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      read_states: {
        Row: {
          conversation_id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "read_states_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          correlation_id: string
          created_at: string | null
          duration_ms: number | null
          id: string
          lang: string | null
          storage_path: string
          thread_id: string
        }
        Insert: {
          correlation_id: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          lang?: string | null
          storage_path: string
          thread_id: string
        }
        Update: {
          correlation_id?: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          lang?: string | null
          storage_path?: string
          thread_id?: string
        }
        Relationships: []
      }
      report_sequence: {
        Row: {
          created_at: string | null
          id: number
          message_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message_id?: string
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          recording_id: string | null
          text: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          recording_id?: string | null
          text: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          recording_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          name: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          name?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workshop_entries: {
        Row: {
          car_id: string
          checked_in_at: string
          checked_out_at: string | null
          created_at: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string
          user_id: string
          workshop_address: string | null
          workshop_name: string
          workshop_place_id: string | null
        }
        Insert: {
          car_id: string
          checked_in_at?: string
          checked_out_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          workshop_address?: string | null
          workshop_name: string
          workshop_place_id?: string | null
        }
        Update: {
          car_id?: string
          checked_in_at?: string
          checked_out_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          workshop_address?: string | null
          workshop_name?: string
          workshop_place_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_entries_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_group_channel: {
        Args: { _name: string; _participant_ids: string[] }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_unread_counts: {
        Args: { for_user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_channel_participant: {
        Args: { _channel_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "butikschef" | "säljare" | "blocket_user"
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
      app_role: ["admin", "butikschef", "säljare", "blocket_user"],
    },
  },
} as const
