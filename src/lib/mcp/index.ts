import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listAssessmentsTool from "./tools/list-assessments";
import getAssessmentTool from "./tools/get-assessment";
import listPackagesTool from "./tools/list-packages";
import listResourcesTool from "./tools/list-resources";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "adhd-tester",
  title: "adhd-tester",
  version: "0.1.0",
  instructions:
    "Tools for FocusCheck, an ADHD screening app. Read the signed-in user's profile, list and read their completed screening assessments (survey responses, cognitive game results, AI interpretation), list pricing packages, and list curated ADHD learning resources. Results are screening indicators, not a diagnosis.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfileTool,
    listAssessmentsTool,
    getAssessmentTool,
    listPackagesTool,
    listResourcesTool,
  ],
});
