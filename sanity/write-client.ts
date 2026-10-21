import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

const token = process.env.SANITY_API_WRITE_TOKEN;

/** Server-only client used to store customer review submissions. Never import from client components. */
export const writeClient = token
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" })
  : null;
