import type { APIRoute } from 'astro';
import {
  LANGUAGE,
  SEARCH_LIMIT,
  THESAURUS_URL,
  SPARQL_URL,
  THESAURUS_DICTS,
  DICT_LABELS,
  type ThesaurusData
} from '../config';

const fixq = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ').trim();

const createsparql = (query: string, limit: number, disabledDicts?: string[]) => {
  const activeDicts = disabledDicts?.length
    ? THESAURUS_DICTS.filter(d => !disabledDicts.includes(d.id))
    : THESAURUS_DICTS;

  if (activeDicts.length === 0) return '';

  const typeValues = activeDicts
    .map(({ id, label }) => `    wd:${id}    # ${label}`)
    .join('\n');

  return `
    PREFIX wd: <${THESAURUS_URL}/entity/>
    PREFIX wdt: <${THESAURUS_URL}/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?type WHERE {
      VALUES ?plabel { "${fixq(query)}" }
      ?item rdfs:label ?itemL
      FILTER(LANG(?itemL) = "${LANGUAGE}")
      FILTER(CONTAINS(LCASE(?itemL), LCASE(?plabel)))
      OPTIONAL {
        ?item schema:description ?descL .
        FILTER(LANG(?descL) = "${LANGUAGE}")
      }
      { ?item wdt:P1/wdt:P2* ?type }
      UNION { ?item wdt:P2+ ?type }
      UNION { ?item wdt:P20+ ?type }
      VALUES ?type {
    ${typeValues}
      }
      BIND(COALESCE(?itemL, STR(?item)) AS ?itemLabel)
      BIND(COALESCE(?descL, "") AS ?itemDescription)
    } LIMIT ${limit}
    `;
};

const search = async (query: string, limit: number, disabledDicts?: string[]): Promise<ThesaurusData[]> => {
  const sparql = createsparql(query, limit, disabledDicts);
  if (!sparql) return [];
  const headers = {
    'User-Agent': 'Recogito-MN',
    Accept: 'application/sparql-results+json'
  };

  const params = new URLSearchParams({
    query: sparql,
    format: 'json'
  });

  let response = await fetch(`${SPARQL_URL}?${params}`, { headers });

  if (response.status >= 400) {
    response = await fetch(SPARQL_URL, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
  }

  if (!response.ok) {
    throw new Error(`mn sparql ${response.status}`);
  }

  const data = await response.json();
  const results: ThesaurusData[] = [];
  const seen = new Set<string>();

  for (const row of data?.results?.bindings || []) {
    const id = row.item?.value as string | undefined;
    if (!id || seen.has(id) || !id.includes('/entity/')) continue;
    seen.add(id);

    const typeUri = row.type?.value as string | undefined;
    const description = row.itemDescription?.value as string | undefined;

    results.push({
      id,
      title: row.itemLabel?.value || id.split('/').pop() || id,
      description: description || undefined,
      typeLabel: typeUri ? DICT_LABELS[typeUri] : undefined
    });
  }

  return results;
};

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';
  if (!query) {
    return Response.json({ results: [] });
  }

  let limit = SEARCH_LIMIT;
  const limitParam = url.searchParams.get('limit');
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!Number.isNaN(parsed)) limit = parsed;
  }

  const disabled = url.searchParams.get('disabled')?.split(',').filter(Boolean);

  try {
    return Response.json({ results: await search(query, limit, disabled) });
  } catch (error) {
    console.warn('mn sparql failed:', error);
    return Response.json({
      results: [],
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
