// HonorProxy Database Types
// This is a manually maintained type definition reflecting the current schema.
// For the most accurate types, run:
//   npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/database.types.ts
// after applying all migrations.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cemeteries: {
        Row: {
          id: string
          name: string
          slug: string
          location_city: string | null
          location_state: string | null
          official_site_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          location_city?: string | null
          location_state?: string | null
          official_site_url?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          slug?: string
          location_city?: string | null
          location_state?: string | null
          official_site_url?: string | null
          notes?: string | null
        }
      }

      grave_requests: {
        Row: {
          id: string
          requester_id: string
          requester_email: string | null          // denormalized for reliable delivery
          cemetery_id: string
          deceased_full_name: string
          relationship_to_deceased: string | null
          personal_message: string | null
          section: string | null
          grave_number: string | null
          plot_info: string | null
          status: 'open' | 'claimed' | 'fulfilled'
          claimed_by: string | null
          claimed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          requester_email?: string | null
          cemetery_id: string
          deceased_full_name: string
          relationship_to_deceased?: string | null
          personal_message?: string | null
          section?: string | null
          grave_number?: string | null
          plot_info?: string | null
          status?: 'open' | 'claimed' | 'fulfilled'
          claimed_by?: string | null
          claimed_at?: string | null
        }
        Update: {
          status?: string
          claimed_by?: string | null
          claimed_at?: string | null
          requester_email?: string | null
          section?: string | null
          grave_number?: string | null
          plot_info?: string | null
          personal_message?: string | null
          relationship_to_deceased?: string | null
        }
      }

      visits: {
        Row: {
          id: string
          grave_request_id: string
          visitor_id: string
          status: 'planned' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grave_request_id: string
          visitor_id: string
          status?: 'planned' | 'completed' | 'cancelled'
        }
        Update: {
          status?: string
        }
      }

      visit_reports: {
        Row: {
          id: string
          visit_id: string
          grave_request_id: string
          visit_date: string
          reflection_text: string
          tribute_left: string | null
          photo_urls: string[] | null
          is_approved: boolean
          thank_you_message: string | null
          thank_you_sent_at: string | null
          visitor_reply: string | null
          visitor_reply_at: string | null
          is_public: boolean
          moderated_by: string | null
          moderated_at: string | null
          moderation_notes: string | null
          rejected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visit_id: string
          grave_request_id: string
          visit_date: string
          reflection_text: string
          tribute_left?: string | null
          photo_urls?: string[] | null
          is_approved?: boolean
          thank_you_message?: string | null
          thank_you_sent_at?: string | null
          visitor_reply?: string | null
          visitor_reply_at?: string | null
          is_public?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          rejected_at?: string | null
        }
        Update: {
          reflection_text?: string
          tribute_left?: string | null
          photo_urls?: string[] | null
          is_approved?: boolean
          thank_you_message?: string | null
          visitor_reply?: string | null
          is_public?: boolean
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          rejected_at?: string | null
        }
      }

      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          is_veteran: boolean | null
          veteran_branch: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          is_veteran?: boolean | null
          veteran_branch?: string | null
          bio?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          email?: string | null
          phone?: string | null
          is_veteran?: boolean | null
          veteran_branch?: string | null
          bio?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Helper types for convenience in the app
export type GraveRequest = Database['public']['Tables']['grave_requests']['Row']
export type Visit = Database['public']['Tables']['visits']['Row']
export type VisitReport = Database['public']['Tables']['visit_reports']['Row']
export type Cemetery = Database['public']['Tables']['cemeteries']['Row']
