import { createFileRoute } from "@tanstack/react-router";
import ArchivePage from "../components/pages/ArchivePage";

export const Route = createFileRoute("/_auth/archive")({
  component: ArchivePage,
});
