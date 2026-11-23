import { LoginIllustration } from "@/components/login/LoginIllustration";
import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Column: Rafeeq Golden Story & Illustration (Figma) */}
      <LoginIllustration />

      {/* Right Column: Secure Workspace Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <LoginForm />
      </div>
    </main>
  );
}
