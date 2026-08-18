import { useEffect, useState } from 'react';
import { AnnotationEditorExtensionProps } from '@recogito/studio-sdk';
import { createBody } from '@annotorious/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Spinner } from '@recogito/studio-sdk/components';
import { MagnifyingGlass, PencilSimple, Tag, Trash, X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDebounce } from 'use-debounce';
import {  SEARCH_LIMIT, PURPOSE, type ThesaurusData } from './config';

import './EditorExtension.css';

const uriID = (uri: string) =>
  uri.includes('/entity/') ? uri.split('/').pop() || uri : uri;

const parsedata = (value?: string): ThesaurusData | undefined => {
  if (!value) return;
  try {
    const parsed = JSON.parse(value);
    if (!parsed.id) return;
    return {
      id: parsed.id,
      title: parsed.title ?? parsed.label ?? parsed.id,
      description: parsed.description,
      typeLabel: parsed.typeLabel
    };
  } catch {
    return;
  }
};

const search = async (query: string): Promise<ThesaurusData[]> => {
  const params = new URLSearchParams({ q: query, limit: String(SEARCH_LIMIT) });
  const response = await fetch(`/api/mn-thesaurus/search?${params}`);
  const data = await response.json();
  return data.results || [];
};

const SearchDialog = (props: {
  initialQuery?: string;
  onClose(): void;
  onSelect(concept: ThesaurusData): void;
}) => {
  const [query, setQuery] = useState(props.initialQuery || '');
  const [debounced] = useDebounce(query, 300);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ThesaurusData[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const q = debounced.trim();
    if (!q) {
      setResults([]);
      setError(undefined);
      setSearching(false);
      return;
    }

    setSearching(true);
    setError(undefined);
    search(q)
      .then(setResults)
      .catch(err => {
        console.error(err);
        setResults([]);
        setError(String(err));
      })
      .finally(() => setSearching(false));
  }, [debounced]);

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) props.onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="mn-th-dialog-overlay" />
        <Dialog.Content className="mn-th-dialog not-annotatable">
          <VisuallyHidden>
            <Dialog.Title>Mare Nostrum Thesaurus search</Dialog.Title>
          </VisuallyHidden>

          <header className="mn-th-dialog-header">
            <form
              className="mn-th-searchbox"
              onSubmit={evt => { evt.preventDefault(); }}>
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={query}
                onChange={evt => setQuery(evt.target.value)} />
              {searching ? (
                <Spinner className="mn-th-search-icon" size={14} />
              ) : (
                <MagnifyingGlass className="mn-th-search-icon" size={20} />
              )}
            </form>
            <Dialog.Close className="unstyled icon-only">
              <X size={28} />
            </Dialog.Close>
          </header>

          {error && <p className="mn-th-error">{error}</p>}
          {results.length > 0 && (
            <p className="mn-th-results-count">{results.length} results</p>
          )}

          <ul className="mn-th-results">
            {results.map(result => (
              <li key={result.id}>
                <button
                  type="button"
                  className="mn-th-result"
                  onClick={() => { props.onSelect(result); props.onClose(); }}>
                  <span className="mn-th-result-title">{result.title}</span>
                  {result.typeLabel && (
                    <span className="mn-th-result-type">{result.typeLabel}</span>
                  )}
                  {result.description && (
                    <span className="mn-th-result-description">{result.description}</span>
                  )}
                  <span className="mn-th-result-id">{uriID(result.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const ThesaurusEditorExtension = (props: AnnotationEditorExtensionProps) => {
  const { annotation, me, isSelected } = props;
  const [concept, setConcept] = useState<ThesaurusData | undefined>();
  const [showSearch, setShowSearch] = useState(false);
  const isMine = me.id === annotation.target.creator?.id;

  const saveConcept = (next: ThesaurusData) => {
    props.onUpdateAnnotation({
      ...annotation,
      bodies: [
        ...annotation.bodies.filter(b => b.purpose !== PURPOSE),
        createBody(
          annotation,
          { purpose: PURPOSE, value: JSON.stringify(next) },
          new Date(),
          me
        )
      ]
    });
    setShowSearch(false);
  };

  useEffect(() => {
    const body = annotation.bodies.find(b => b.purpose === PURPOSE);
    setConcept(parsedata(body?.value));
  }, [annotation]);

  if (!concept && !(isMine && isSelected)) return null;

  return (
    <div className="mn-th-editor">
      {concept ? (
        <article className="mn-th-tag">
          <div className="mn-th-tag-body">
            <h3>{concept.title}</h3>
            {concept.typeLabel && <p className="mn-th-tag-type">{concept.typeLabel}</p>}
            {concept.description && (
              <p className="mn-th-tag-description">{concept.description}</p>
            )}
            <a href={concept.id} target="_blank" rel="noreferrer">
              {uriID(concept.id)}
            </a>
          </div>
          {isMine && (
            <div className="mn-th-tag-actions">
              <button type="button" className="unstyled icon-only" onClick={() => setShowSearch(true)}>
                <PencilSimple size={16} />
              </button>
              <button
                type="button"
                className="unstyled icon-only"
                onClick={() => props.onUpdateAnnotation({
                  ...annotation,
                  bodies: annotation.bodies.filter(b => b.purpose !== PURPOSE)
                })}>
                <Trash size={16} />
              </button>
            </div>
          )}
        </article>
      ) : (
        <button type="button" className="mn-th-add unstyled" onClick={() => setShowSearch(true)}>
          <Tag size={16} />
          Add thesaurus tag
        </button>
      )}

      {showSearch && (
        <SearchDialog
          initialQuery={concept?.title}
          onClose={() => setShowSearch(false)}
          onSelect={saveConcept} />
      )}
    </div>
  );
};

export const EditorExtension = ThesaurusEditorExtension;
