import { useState } from 'react';
import { AdminExtensionProps } from '@recogito/studio-sdk';
import { THESAURUS_DICTS, usesSearchFromSelection, type ThesaurusSettings } from './config';

import './AdminExtension.css';

export const ThesaurusAdminExtension = (props: AdminExtensionProps) => {
  const settings = props.settings as ThesaurusSettings | undefined;

  const [searchFromSelection, setSearchFromSelection] = useState(
    usesSearchFromSelection(settings)
  );

  const [disabledDicts, setDisabledDicts] = useState<string[]>(
    settings?.disabledDicts || []
  );

  const isDirty = () => {
    const origSearch = usesSearchFromSelection(settings);
    const origDisabled = settings?.disabledDicts || [];
    return searchFromSelection !== origSearch
      || disabledDicts.sort().join() !== [...origDisabled].sort().join();
  };

  const toggleDict = (id: string) => {
    setDisabledDicts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const onSave = () => {
    props.onChangeUserSettings({
      searchFromSelection,
      disabledDicts: disabledDicts.length > 0 ? disabledDicts : undefined
    });
  };

  return (
    <div className="mn-th-admin">
      <p>MN Thesaurus for Recogito</p>

      <label className="mn-th-admin-option">
        <input
          type="checkbox"
          checked={searchFromSelection}
          onChange={evt => setSearchFromSelection(evt.target.checked)}
        />
        Use selected annotation text as the thesaurus search query
      </label>

      <h3>Dictionaries</h3>
      <ul className="mn-th-dict-list">
        {THESAURUS_DICTS.map(dict => (
          <li key={dict.id}>
            <label className="mn-th-admin-option">
              <input
                type="checkbox"
                checked={!disabledDicts.includes(dict.id)}
                onChange={() => toggleDict(dict.id)}
              />
              <code>{dict.id}</code> {dict.label}
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="primary"
        disabled={!isDirty()}
        onClick={onSave}>
        Save Settings
      </button>
    </div>
  );
};

export const AdminExtension = ThesaurusAdminExtension;
