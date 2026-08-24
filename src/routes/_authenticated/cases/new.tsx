import { createFileRoute } from "@tanstack/react-router";
import { NewCaseForm } from "./-components/NewCaseForm";

export const Route = createFileRoute("/_authenticated/cases/new")({
  component: NewCaseForm,
});
