import { useState } from 'react';
import { AdminExtensionProps } from '@recogito/studio-sdk';
import { THESAURUS_DICTS, usesSearchFromSelection, type ThesaurusSettings } from './config';

import './AdminExtension.css';

export const ThesaurusAdminExtension = (props: AdminExtensionProps) => {
  const settings = props.settings as ThesaurusSettings | undefined;
  const [searchFromSelection, setSearchFromSelection] = useState(
    usesSearchFromSelection(settings)
  );

  const dirty = searchFromSelection !== usesSearchFromSelection(settings);

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

      <button
        type="button"
        className="primary"
        disabled={!dirty}
        onClick={() => props.onChangeUserSettings({ searchFromSelection })}>
        Save Settings
      </button>

      <h3>Indexed classes</h3>
      <ul>
        {THESAURUS_DICTS.map(dict => (
          <li key={dict.id}>
            <code>{dict.id}</code> {dict.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AdminExtension = ThesaurusAdminExtension;
