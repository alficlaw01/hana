// ============================================================
// Hana Matching Engine — Shimmer Embedding System
// Generates vector embeddings for Shimmer profiles and
// performs similarity search via Supabase pgvector.
// ============================================================

import type {
  ShimmerProfile,
  EmbeddingResult,
  SimilaritySearchResult,
  VectorSearchParams,
} from './types.js';

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536; // text-embedding-3-small = 1536 dims

const MAX_TEXT_LENGTH = 8000; // token-safe chunk limit for raw text

// ----------------------------------------------------------
// Shimmer Text Serialisation
// Converts a ShimmerProfile into a rich text string for embedding.
// ----------------------------------------------------------

export function shimmerToText(shimmer: ShimmerProfile): string {
  const sections: string[] = [];

  sections.push(`Name: ${shimmer.name}, ${shimmer.age} years old, ${shimmer.gender}. Works as ${shimmer.occupation}.`);
  if (shimmer.tagline) sections.push(`Tagline: ${shimmer.tagline}`);
  if (shimmer.bio) sections.push(`Bio: ${shimmer.bio}`);

  // Personality
  const p = shimmer.personality;
  sections.push(`Personality: Openness ${p.openness}/10, Conscientiousness ${p.conscientiousness}/10, Extraversion ${p.extraversion}/10, Agreeableness ${p.agreeableness}/10, Neuroticism ${p.neuroticism}/10. Humor style: ${p.humorStyle ?? 'not specified'}. Emotional expressiveness: ${p.emotionalExpressiveness ?? 5}/10.`);

  // Values
  const vals = shimmer.values;
  const valueStrings = Object.entries(vals)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
  sections.push(`Values: ${valueStrings}.`);

  // Lifestyle
  const l = shimmer.lifestyle;
  sections.push(`Lifestyle: Lives in ${l.location.neighbourhood ?? l.location.city}. Schedule: ${l.schedule}. Exercise: ${l.exercise}. Diet: ${l.diet}. Social battery: ${l.socialBattery}. Home style: ${l.homeStyle}. Weekend style: ${l.weekendStyle}.`);

  if (l.alcohol) sections.push(`Alcohol: ${l.alcohol}.`);
  if (l.smoking) sections.push(`Smoking: ${l.smoking}.`);
  if (l.pets) sections.push(`Pets: ${l.pets}.`);

  // Interests
  const ints = shimmer.interests;
  const interestStrings = [
    ints.food.length ? `Food: ${ints.food.join(', ')}` : null,
    ints.music.length ? `Music: ${ints.music.join(', ')}` : null,
    ints.film.length ? `Film: ${ints.film.join(', ')}` : null,
    ints.tv.length ? `TV: ${ints.tv.join(', ')}` : null,
    ints.books.length ? `Books: ${ints.books.join(', ')}` : null,
    ints.sports.length ? `Sports: ${ints.sports.join(', ')}` : null,
    ints.travel.length ? `Travel: ${ints.travel.join(', ')}` : null,
    ints.hobbies.length ? `Hobbies: ${ints.hobbies.join(', ')}` : null,
  ].filter(Boolean);
  sections.push(`Interests: ${interestStrings.join('. ')}.`);

  // Dealbreakers
  const db = shimmer.dealbreakers;
  if (db.mustHave.length) sections.push(`Must have: ${db.mustHave.join(', ')}`);
  if (db.absoluteNo.length) sections.push(`Absolute no: ${db.absoluteNo.join(', ')}`);
  if (db.preferNot.length) sections.push(`Prefer not: ${db.preferNot.join(', ')}`);

  // Relationship
  const r = shimmer.relationship;
  sections.push(`Relationship: Looking for ${r.lookingFor}. Style: ${r.relationshipStyle}. Communication: ${r.communicationStyle}. Conflict style: ${r.conflictStyle}. Love language: ${r.loveLanguage}.`);

  // Ambitions
  const a = shimmer.ambitions;
  sections.push(`Ambitions: Short term (1yr): ${a.shortTerm}. Medium term (5yr): ${a.mediumTerm}. Long term (10yr): ${a.longTerm}. Legacy: ${a.legacy}.`);

  // Conversation depth
  const cl = shimmer.conversationLog;
  sections.push(`Shimmer depth: ${cl.turns} conversation turns, covering ${cl.topicsCovered.length} topics. Last updated: ${cl.lastUpdated}.`);

  const text = sections.join(' ');
  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
}

// ----------------------------------------------------------
// Embedding Generation
// Calls OpenAI-compatible embedding API.
// Replace `embeddingApiUrl` and `apiKey` with actual config.
// ----------------------------------------------------------

export interface EmbeddingConfig {
  apiKey: string;
  model?: string;
  embeddingApiUrl?: string; // defaults to OpenAI endpoint
}

// Retry helper with exponential backoff for 429 / 5xx responses
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryDelaysMs = [1000, 2000, 4000],
): Promise<Response> {
  const maxAttempts = retryDelaysMs.length + 1;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;

    const isRetryable = response.status === 429 || response.status >= 500;
    const hasMoreAttempts = attempt < maxAttempts - 1;

    if (isRetryable && hasMoreAttempts) {
      await new Promise<void>((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
      continue;
    }

    const error = await response.text();
    throw new Error(`Embedding API error ${response.status}: ${error}`);
  }
  // unreachable, but satisfies TypeScript
  throw new Error('Embedding API failed after all retries');
}

export async function generateEmbedding(
  text: string,
  config: EmbeddingConfig,
): Promise<EmbeddingResult> {
  const { apiKey, model = EMBEDDING_MODEL, embeddingApiUrl = 'https://api.openai.com/v1/embeddings' } = config;

  const response = await fetchWithRetry(embeddingApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, MAX_TEXT_LENGTH),
    }),
  });

  const data = await response.json() as {
    data: Array<{ embedding: number[]; index: number }>;
    model: string;
    usage: { total_tokens: number };
  };

  const embedding = data.data[0]?.embedding ?? [];
  return {
    embedding,
    model: data.model,
    tokenCount: data.usage.total_tokens,
    truncated: text.length >= MAX_TEXT_LENGTH,
  };
}

// Convenience: generate embedding from a Shimmer profile
export async function embedShimmer(
  shimmer: ShimmerProfile,
  config: EmbeddingConfig,
): Promise<EmbeddingResult> {
  const text = shimmer.rawText ?? shimmerToText(shimmer);
  return generateEmbedding(text, config);
}

// ----------------------------------------------------------
// Cosine Similarity
// ----------------------------------------------------------

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// ----------------------------------------------------------
// Supabase pgvector Similarity Search
// Returns top-N candidates by cosine similarity.
// ----------------------------------------------------------

// Supabase generic response type
interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface SupabaseClient {
  from(table: string): QueryBuilder;
  rpc(fn: string, args?: Record<string, unknown>): QueryBuilder;
}

export interface QueryBuilder {
  select(...cols: string[]): QueryBuilder;
  insert(rows: Record<string, unknown>[]): QueryBuilder;
  update(partial: Record<string, unknown>): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  neq(column: string, value: unknown): QueryBuilder;
  in(column: string, values: unknown[]): QueryBuilder;
  gte(column: string, value: unknown): QueryBuilder;
  lte(column: string, value: unknown): QueryBuilder;
  rpc(fn: string, args?: Record<string, unknown>): QueryBuilder;
  limit(n: number): QueryBuilder;
  single<T>(): Promise<T>;
  then<TResult1, TResult2>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
}

export interface SupabaseClient {
  from(table: string): QueryBuilder;
  rpc(fn: string, args?: Record<string, unknown>): QueryBuilder;
}

export async function vectorSimilaritySearch(
  userId: string,
  userEmbedding: number[],
  supabase: SupabaseClient,
  params: VectorSearchParams,
): Promise<SimilaritySearchResult[]> {
  const { topN = 20, minSimilarity = 0.5, poolFilter } = params;

  // Supabase pgvector match_docs RPC (cosine distance, returns match scores)
  // Returns: user_id, shimmer_id, similarity
  const rpcArgs: Record<string, unknown> = {
    query_embedding: userEmbedding,
    match_threshold: minSimilarity,
    match_count: topN,
    p_user_id: userId,
  };
  if (poolFilter) {
    rpcArgs.pool_filter = poolFilter;
  }
  const rpcResult = await supabase.rpc('match_shimmers', rpcArgs) as unknown as SupabaseResponse<Array<{ user_id: string; shimmer_id: string; similarity: number }>>;
  const { data, error } = rpcResult;

  if (error) throw new Error(`pgvector search error: ${error.message}`);

  // Supabase match_shimmers returns rows with { user_id, shimmer_id, similarity }
  const rows = data as Array<{ user_id: string; shimmer_id: string; similarity: number }>;

  return rows.map((row) => ({
    userId: row.user_id,
    shimmerId: row.shimmer_id,
    similarityScore: row.similarity,
  }));
}

// ----------------------------------------------------------
// SQL snippet to create the match_shimmers RPC function
// Run this as a Supabase migration.
// ----------------------------------------------------------

export const MATCH_SHIMMERS_SQL = `
-- Create match_shimmers function for cosine similarity search
CREATE OR REPLACE FUNCTION match_shimmers(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID,
  pool_filter TEXT DEFAULT NULL
)
RETURNS TABLE (user_id UUID, shimmer_id UUID, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.user_id,
    s.id AS shimmer_id,
    1 - (s.embedding <=> query_embedding) AS similarity  -- <=> is cosine distance in pgvector
  FROM shimmers s
  INNER JOIN users u ON u.id = s.user_id
  WHERE s.is_current = TRUE
    AND s.user_id != p_user_id
    AND s.embedding IS NOT NULL
    AND u.onboarding_complete = TRUE
    AND u.pool IN ('ocean', 'cove')
    AND (pool_filter IS NULL OR u.pool = pool_filter)
  ORDER BY s.embedding <=> query_embedding  -- ascending = closest first
  LIMIT match_count;
END;
$$;
`;

// ----------------------------------------------------------
// Embedding Cache helpers
// ----------------------------------------------------------

export interface EmbeddingCacheEntry {
  shimmerId: string;
  userId: string;
  embedding: number[];
  model: string;
  createdAt: string;
}

// Save embedding to Supabase shimmers table
export async function saveEmbedding(
  supabase: SupabaseClient,
  shimmerId: string,
  embedding: number[],
  _model: string,
  wordCount: number,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (supabase as any).from('shimmers').update({ embedding, word_count: wordCount }).eq('id', shimmerId);
  if (res.error) throw new Error(`Failed to save embedding: ${res.error.message}`);
}

// Check if embedding is stale (>30 days old or score < current)
export async function needsReembedding(
  supabase: SupabaseClient,
  shimmerId: string,
  maxAgeDays = 30,
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (supabase as any).from('shimmers').select('updated_at, is_current').eq('id', shimmerId).single();
  if (res.error || !res.data) return true;

  const updatedAt = new Date(res.data.updated_at);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);

  return !res.data.is_current || updatedAt < cutoff;
}
