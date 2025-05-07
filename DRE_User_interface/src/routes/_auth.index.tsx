import { createFileRoute } from "@tanstack/react-router";
import HomePageContent from "../components/homePage/HomePageContent";

export const Route = createFileRoute("/_auth/")({
  component: HomePageContent,
});
