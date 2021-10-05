import { makeLazy, wrapSettings } from '@util';
import { ErrorBoundary, FormSection } from '@components';
import { UnControlled } from 'react-codemirror2';
import { React, DNGetter } from '@webpack';
import { Button } from '@components';
import { debounce } from 'lodash';
import { existsSync, readFileSync } from 'fs';
const { writeFile } = require('fs').promises;
import { join } from 'path';

const quickCssFile = join(__dirname, '../quickcss.css');

function loadCss(): string {
  if (existsSync(quickCssFile)) {
    const quickCss = readFileSync(quickCssFile, 'utf8');
    return quickCss;
  }
}

function reloadCss(): void {
  if (existsSync(quickCssFile)) {
    const QuickCSS = require(quickCssFile);
    QuickCSS.reload();
  }
}

async function saveCss(css: string): Promise<void> {
  const quickCss = css.trim();
  await writeFile(quickCssFile, quickCss);
  console.log('QuickCSS saved.');
  reloadCss();
}

const SettingsView = makeLazy({
  promise: () => {
    const settings = Astra.settings.get('QuickCSS');

    const { FormSection, FormItem, Markdown, FormDivider } = DNGetter;

    const SettingsView = React.memo((): React.ReactElement<typeof FormSection> => {
      const [css, setCss] = React.useState({});
      const onChange = React.useCallback(
        debounce((_, __, value) => setCss({ value }), 1000),
        []
      );
      return (
        <div>
          <FormSection title='QuickCSS' tag='h1'>
            <FormItem>
              <Markdown>
                  Edit your QuickCSS here. Don't forget to hit update, or your changes will **not**
                  be saved!
              </Markdown>
            </FormItem>
          </FormSection>
          <FormDivider />
          <br />
          <div>
            <UnControlled
              autoCursor={false}
              value={loadCss()}
              onChange={(_editor, _data, value): void => {
                onChange(_editor, _data, value);
              }}
              options={{
                mode: 'css',
                theme: 'material',
                styleActiveLine: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                lineNumbers: true,
                foldGutter: true,
                lineWrapping: false,
                indentWithTabs: false,
                tabSize: 2,
                indentUnit: 2,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                extraKeys: {
                  'Ctrl-Space': 'autocomplete'
                }
              }}
            />
          </div>
          <div style={{ marginTop: 5 }}>
            <Button
              onClick={(): void => {
                saveCss(css.value);
                // reloadCss();
              }}
              size={Button.Sizes.SMALL}>
                Update
            </Button>
          </div>
        </div>
      );
    });

    return Promise.resolve(wrapSettings(settings, SettingsView));
  }
});

export class SettingsErrorBoundary extends ErrorBoundary {
  constructor(props: { label: string }) {
    props.label = 'QuickCSS settings panel';
    super(props);
  }
  renderChildren(): React.ReactElement<typeof SettingsView> {
    return <SettingsView />;
  }
}
