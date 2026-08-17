import { AdminExtensionProps } from '@recogito/studio-sdk';
import { THESAURUS_DICTS } from './config';

import './AdminExtension.css';

export const AdminExtension = (_props: AdminExtensionProps) => (
  <div className="mn-th-admin">
    <p>MN Thesaurus for Recogito</p>

    <h3>Indexed classes</h3>
    <ul>
      {THESAURUS_DICTS.map(dict => (
        <li key={type.id}>
          <code>{type.id}</code> {type.label}
        </li>
      ))}
    </ul>
  </div>
);
