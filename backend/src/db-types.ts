// Auto-generated via `pnpm gen:db`
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export interface Database {
  public: {
    Tables: {
      org: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
      };
      savings_event: {
        Row: {
          id: string;
          org_id: number;
          ts: string;
          cloud: string | null;
          region: string | null;
          sku: string | null;
          kwh: number | null;
          usd: number | null;
          kg: number | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          org_id: number;
          ts?: string;
          cloud?: string | null;
          region?: string | null;
          sku?: string | null;
          kwh?: number | null;
          usd?: number | null;
          kg?: number | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          org_id?: number;
          ts?: string;
          cloud?: string | null;
          region?: string | null;
          sku?: string | null;
          kwh?: number | null;
          usd?: number | null;
          kg?: number | null;
          note?: string | null;
        };
      };
      sku_catalogue: {
        Row: {
          cloud: string | null;
          region: string | null;
          sku: string | null;
          watts: number | null;
          usd_hour: number | null;
        };
        Insert: {
          cloud?: string | null;
          region?: string | null;
          sku?: string | null;
          watts?: number | null;
          usd_hour?: number | null;
        };
        Update: {
          cloud?: string | null;
          region?: string | null;
          sku?: string | null;
          watts?: number | null;
          usd_hour?: number | null;
        };
      };
      api_key: {
        Row: {
          id: string;
          org_id: number;
          secret: string;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: number;
          secret: string;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: number;
          secret?: string;
          label?: string | null;
          created_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          repo: string;
          ts: string;
          actor_id: string | null;
          action: string | null;
          meta: Json | null;
        };
        Insert: {
          id?: string;
          repo: string;
          ts?: string;
          actor_id?: string | null;
          action?: string | null;
          meta?: Json | null;
        };
        Update: {
          id?: string;
          repo?: string;
          ts?: string;
          actor_id?: string | null;
          action?: string | null;
          meta?: Json | null;
        };
      };
    };
    Functions: {
      ledger_summary: {
        Args: {
          p_org: number;
        };
        Returns: {
          total_usd: number | null;
          total_kg: number | null;
        };
      };
    };
  };
}
