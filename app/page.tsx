import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const instant = false;

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("valibhoy_session");
  if (session?.value) {
    redirect("/dashboard");
  }
  redirect("/login");
}
