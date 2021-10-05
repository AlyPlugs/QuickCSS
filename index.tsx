import { UPlugin } from '@classes';
import { React } from '@webpack';
import { join } from 'path';
import { existsSync } from 'fs';

import { SettingsErrorBoundary } from './components/Settings';

const CodemirrorCSS = require('codemirror/lib/codemirror.css');
const MaterialCSS = require('codemirror/theme/material.css');

const quickCssPath = join(__dirname, 'quickcss.css');

export default class QuickCSS extends UPlugin {
  public quickCss = existsSync(quickCssPath) ? require('./quickcss.css') : '';

  start(): void {
    CodemirrorCSS.attach();
    MaterialCSS.attach();

    if (this.quickCss !== '') this.quickCss.attach();

    this.__uSettingsTabs = {
      sections: [
        {
          section: 'QuickCSS',
          label: 'QuickCSS settings',
          element: (): React.ReactElement<SettingsErrorBoundary> => <SettingsErrorBoundary />
        }
      ]
    };
  }
  stop(): void {
    CodemirrorCSS.detach();
    MaterialCSS.detach();
    this.quickCss.detach();
    this.__uSettingsTabs = {};
  }
}
