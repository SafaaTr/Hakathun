import Link from "next/link";
import { RafeeqLogo } from "@/components/shared/RafeeqLogo";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card border border-card-border rounded-3xl p-8 text-center space-y-6 shadow-xs">
        <RafeeqLogo iconSize={36} textColor="text-foreground" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-navy text-xs font-bold border border-card-border">
            <ShieldCheck className="w-4 h-4 text-blue" />
            <span>Workspace Provisioning</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Store Registration
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Store owner and administrator accounts on the web platform are provisioned directly by the Rafeeq system administrator.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-yellow hover:bg-yellow-hover text-slate-900 font-bold text-sm shadow-xs transition-colors"
        >
          <span>Go to Workspace Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
