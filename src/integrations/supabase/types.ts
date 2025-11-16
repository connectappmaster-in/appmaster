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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_transactions: {
        Row: {
          amount: number
          asset_id: string
          created_at: string
          id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          asset_id: string
          created_at?: string
          id?: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          asset_id?: string
          created_at?: string
          id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "asset_transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          additional_depreciation_eligible: boolean | null
          applicable_law: Database["public"]["Enums"]["applicable_law"]
          asset_category: string
          asset_name: string
          created_at: string
          depreciation_method: Database["public"]["Enums"]["depreciation_method"]
          depreciation_rate: number
          id: string
          multi_shift_use: number | null
          original_cost: number
          purchase_date: string
          residual_value_pct: number | null
          updated_at: string
          useful_life: number
          user_id: string
        }
        Insert: {
          additional_depreciation_eligible?: boolean | null
          applicable_law: Database["public"]["Enums"]["applicable_law"]
          asset_category: string
          asset_name: string
          created_at?: string
          depreciation_method: Database["public"]["Enums"]["depreciation_method"]
          depreciation_rate: number
          id?: string
          multi_shift_use?: number | null
          original_cost: number
          purchase_date: string
          residual_value_pct?: number | null
          updated_at?: string
          useful_life: number
          user_id: string
        }
        Update: {
          additional_depreciation_eligible?: boolean | null
          applicable_law?: Database["public"]["Enums"]["applicable_law"]
          asset_category?: string
          asset_name?: string
          created_at?: string
          depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          depreciation_rate?: number
          id?: string
          multi_shift_use?: number | null
          original_cost?: number
          purchase_date?: string
          residual_value_pct?: number | null
          updated_at?: string
          useful_life?: number
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action: string
          action_value: Json | null
          created_at: string
          execution_order: number | null
          id: string
          is_active: boolean | null
          rule_name: string
          trigger: string
          trigger_value: Json | null
        }
        Insert: {
          action: string
          action_value?: Json | null
          created_at?: string
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          trigger: string
          trigger_value?: Json | null
        }
        Update: {
          action?: string
          action_value?: Json | null
          created_at?: string
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          trigger?: string
          trigger_value?: Json | null
        }
        Relationships: []
      }
      depreciation_schedules: {
        Row: {
          accumulated_depreciation: number
          additional_depreciation: number | null
          additions: number | null
          asset_id: string
          closing_value: number
          created_at: string
          depreciation: number
          disposals: number | null
          financial_year: string
          id: string
          opening_value: number
          year_number: number
        }
        Insert: {
          accumulated_depreciation: number
          additional_depreciation?: number | null
          additions?: number | null
          asset_id: string
          closing_value: number
          created_at?: string
          depreciation: number
          disposals?: number | null
          financial_year: string
          id?: string
          opening_value: number
          year_number: number
        }
        Update: {
          accumulated_depreciation?: number
          additional_depreciation?: number | null
          additions?: number | null
          asset_id?: string
          closing_value?: number
          created_at?: string
          depreciation?: number
          disposals?: number | null
          financial_year?: string
          id?: string
          opening_value?: number
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_schedules_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          ticket_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          ticket_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          ticket_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_rules: {
        Row: {
          created_at: string
          escalate_if_breached: boolean | null
          escalate_to_role: string | null
          first_response_time_minutes: number
          id: string
          is_active: boolean | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution_time_minutes: number
          rule_name: string
        }
        Insert: {
          created_at?: string
          escalate_if_breached?: boolean | null
          escalate_to_role?: string | null
          first_response_time_minutes: number
          id?: string
          is_active?: boolean | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution_time_minutes: number
          rule_name: string
        }
        Update: {
          created_at?: string
          escalate_if_breached?: boolean | null
          escalate_to_role?: string | null
          first_response_time_minutes?: number
          id?: string
          is_active?: boolean | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_time_minutes?: number
          rule_name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_email: string | null
          auto_renew: boolean | null
          billing_cycle: string | null
          category: string | null
          cost: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          invoice_email: string | null
          logo_url: string | null
          notes: string | null
          notification_methods: Json | null
          payment_method: string | null
          plan_description: string | null
          plan_tier: string | null
          provider_name: string | null
          reminder_days: number | null
          renewal_date: string | null
          send_reminder: boolean | null
          status: string
          subscription_end_date: string | null
          subscription_name: string | null
          subscription_start_date: string | null
          subscription_url: string | null
          tool_id: string
          trial_days_remaining: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_email?: string | null
          logo_url?: string | null
          notes?: string | null
          notification_methods?: Json | null
          payment_method?: string | null
          plan_description?: string | null
          plan_tier?: string | null
          provider_name?: string | null
          reminder_days?: number | null
          renewal_date?: string | null
          send_reminder?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_name?: string | null
          subscription_start_date?: string | null
          subscription_url?: string | null
          tool_id: string
          trial_days_remaining?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_email?: string | null
          logo_url?: string | null
          notes?: string | null
          notification_methods?: Json | null
          payment_method?: string | null
          plan_description?: string | null
          plan_tier?: string | null
          provider_name?: string | null
          reminder_days?: number | null
          renewal_date?: string | null
          send_reminder?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_name?: string | null
          subscription_start_date?: string | null
          subscription_url?: string | null
          tool_id?: string
          trial_days_remaining?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color_code: string | null
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          team_name: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          team_name: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          team_name?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          author_id: string
          comment_text: string
          created_at: string
          id: string
          is_public: boolean
          mentions: Json | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comment_text: string
          created_at?: string
          id?: string
          is_public?: boolean
          mentions?: Json | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comment_text?: string
          created_at?: string
          id?: string
          is_public?: boolean
          mentions?: Json | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_team: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          custom_fields: Json | null
          customer_email: string
          customer_name: string
          description: string
          due_date: string | null
          id: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          tags: Json | null
          ticket_number: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_team?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          custom_fields?: Json | null
          customer_email: string
          customer_name: string
          description: string
          due_date?: string | null
          id?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: Json | null
          ticket_number: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_team?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          custom_fields?: Json | null
          customer_email?: string
          customer_name?: string
          description?: string
          due_date?: string | null
          id?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: Json | null
          ticket_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_team_fkey"
            columns: ["assigned_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          push_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_save_interval: number | null
          company_address: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          currency_symbol: string | null
          default_depreciation_method:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          default_residual_value_pct: number | null
          enable_additional_depreciation: boolean | null
          enable_multi_shift: boolean | null
          fy_start_day: number | null
          fy_start_month: number | null
          id: string
          theme_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save_interval?: number | null
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          currency_symbol?: string | null
          default_depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          default_residual_value_pct?: number | null
          enable_additional_depreciation?: boolean | null
          enable_multi_shift?: boolean | null
          fy_start_day?: number | null
          fy_start_month?: number | null
          id?: string
          theme_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save_interval?: number | null
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          currency_symbol?: string | null
          default_depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          default_residual_value_pct?: number | null
          enable_additional_depreciation?: boolean | null
          enable_multi_shift?: boolean | null
          fy_start_day?: number | null
          fy_start_month?: number | null
          id?: string
          theme_mode?: string | null
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
      generate_ticket_number: { Args: never; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      applicable_law: "Companies Act" | "Income Tax Act" | "Both"
      availability_status: "Available" | "Busy" | "Away" | "Offline"
      depreciation_method: "SLM" | "WDV"
      issue_type: "Bug" | "Feature Request" | "Question" | "Urgent" | "General"
      ticket_priority: "Critical" | "High" | "Medium" | "Low"
      ticket_status: "Open" | "In Progress" | "Pending" | "Resolved" | "Closed"
      transaction_type: "Addition" | "Disposal"
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
      applicable_law: ["Companies Act", "Income Tax Act", "Both"],
      availability_status: ["Available", "Busy", "Away", "Offline"],
      depreciation_method: ["SLM", "WDV"],
      issue_type: ["Bug", "Feature Request", "Question", "Urgent", "General"],
      ticket_priority: ["Critical", "High", "Medium", "Low"],
      ticket_status: ["Open", "In Progress", "Pending", "Resolved", "Closed"],
      transaction_type: ["Addition", "Disposal"],
    },
  },
} as const
