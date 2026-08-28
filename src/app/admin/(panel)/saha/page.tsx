import { redirect } from "next/navigation";

export default function AdminServiceLeadsRedirectPage() {
  redirect("/admin/teklifler?view=saha");
}