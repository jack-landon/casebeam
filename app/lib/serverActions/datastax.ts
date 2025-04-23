import { DataAPIClient, Db, VectorizeDoc } from "@datastax/astra-db-ts";

export interface DocumentFullDocEmbeddings extends VectorizeDoc {
  version_id: string | null;
  type: string | null;
  jurisdiction: string | null;
  source: string | null;
  date: string | null;
  citation: string | null;
  url: string | null;
  text: string | null;
  $vector: number[];
}

export interface Document extends VectorizeDoc {
  _id: string;
  doc_id: string;
  type: string | null;
  jurisdiction: string | null;
  source: string | null;
  date: string | null;
  citation: string;
  url: string | null;
  chunk_index: string | null;
  total_chunks: string | null;
  $vector: number[];
  $vectorize: string;
}

export function connectToDatabase(): Db {
  const { ASTRA_DB_API_ENDPOINT: endpoint, ASTRA_DB_APPLICATION_TOKEN: token } =
    process.env;

  if (!token || !endpoint) {
    throw new Error(
      "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined."
    );
  }

  // Create an instance of the `DataAPIClient` class with your token.
  const client = new DataAPIClient(token);

  // Get the database specified by your endpoint.
  const database = client.db(endpoint);

  console.log(`Connected to database ${database.id}`);

  return database;
}
