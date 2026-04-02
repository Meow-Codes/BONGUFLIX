import type { CollectionCreateSchema } from "typesense";

export const MEDIA_COLLECTION = "media";

export const mediaCollectionSchema: CollectionCreateSchema = {
  name: MEDIA_COLLECTION,
  fields: [
    { name: "id", type: "string" }, // "movie_123" | "tv_456"
    { name: "title", type: "string" }, // searchable
    { name: "type", type: "string", facet: true }, // "movie" | "tv"
    { name: "popularity", type: "float", optional: false },
    { name: "vote_average", type: "float", optional: true },
    { name: "year", type: "int32", optional: true },
    { name: "poster_path", type: "string", optional: true },
    { name: "tmdb_id", type: "int32", optional: true },
  ],
  default_sorting_field: "popularity", // fallback sort when no text match
  token_separators: ["-", ":", "'", ".", "!"], // handle "Spider-Man", "S.H.I.E.L.D."
};
