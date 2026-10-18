import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AuthModal } from "@/components/auth-modal";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user) {
        setAuthOpen(true);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <AdminDashboard
        isOpen={true}
        onClose={() => {
          navigate({ to: "/" });
        }}
      />
      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          if (!user) {
            navigate({ to: "/" });
          }
        }}
        onSuccess={() => {
          setAuthOpen(false);
        }}
      />
    </div>
  );
}
