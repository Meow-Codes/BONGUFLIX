import Typesense from "typesense";

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost",
      port: parseInt(process.env.TYPESENSE_PORT || "8108"),
      protocol: (process.env.TYPESENSE_PROTOCOL as "http" | "https") || "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "",
  connectionTimeoutSeconds: 5,
  retryIntervalSeconds: 0.1,
  numRetries: 3,
});