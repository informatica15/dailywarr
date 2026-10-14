import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept working: Hall of Honors is now Hall of Flames.
export const Route = createFileRoute("/achievements")({
  beforeLoad: () => { throw redirect({ to: "/hall-of-flames", statusCode: 301 }); },
});
