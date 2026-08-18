export const PURPOSE = 'mn-thesaurus';

export const THESAURUS_URL = 'https://thesaurus.mn.cenagis.edu.pl';

export const SPARQL_URL = `${THESAURUS_URL}/sparql`;

export const LANGUAGE = 'en';

export const SEARCH_LIMIT = 100;

export const SEARCH_FROM_SELECTION_DEFAULT = true;

export type ThesaurusSettings = {
  searchFromSelection?: boolean;
};

export const usesSearchFromSelection = (settings?: ThesaurusSettings) =>
  settings?.searchFromSelection ?? SEARCH_FROM_SELECTION_DEFAULT;

export interface ThesaurusData {
  id: string;
  title: string;
  description?: string;
  typeLabel?: string;
}

export const THESAURUS_DICTS: { id: string; label: string }[] = [
  { id: 'Q449', label: 'amphora type' },
  { id: 'Q450', label: 'vessel form' },
  { id: 'Q451', label: 'vessel part' },
  { id: 'Q452', label: 'sub-category' },
  { id: 'Q453', label: 'provenance' },
  { id: 'Q454', label: 'chronology' },
  { id: 'Q455', label: 'morphology' },
  { id: 'Q456', label: 'state of preservation' },
  { id: 'Q457', label: 'surface treatment' },
  { id: 'Q786', label: 'Harris matrix relationships' },
  { id: 'Q790', label: 'trench parameters' },
  { id: 'Q793', label: 'visual item metadata' },
  { id: 'Q796', label: 'linguistic object metadata' }
];

export const DICT_LABELS = Object.fromEntries(
  THESAURUS_DICTS.map(({ id, label }) => [`${THESAURUS_URL}/entity/${id}`, label])
);
