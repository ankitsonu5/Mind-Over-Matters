import { redirect } from "next/navigation";

// The old submissions panel is replaced by the full admin at /admin
export default function PanelPage() {
  redirect("/admin/submissions");
}
