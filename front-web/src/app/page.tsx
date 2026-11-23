import { redirect } from "next/navigation";

export default function HomePage() {
  // Directly route users to the dashboard or login page
  redirect("/dashboard");
}
