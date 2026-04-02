import "dotenv/config";
import { typesenseClient } from "../config/typesense.js";
import { MEDIA_COLLECTION, mediaCollectionSchema } from "../config/typesense.schema.js";

async function main() {
  try {
    // Drop existing collection for a clean re-index
    await typesenseClient.collections(MEDIA_COLLECTION).delete();
    console.log("Dropped existing collection.");
  } catch {
    console.log("No existing collection, creating fresh.");
  }

  const collection = await typesenseClient.collections().create(mediaCollectionSchema);
  console.log("Collection created:", collection.name);
}

main().catch(console.error);