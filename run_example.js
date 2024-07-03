import fs from 'fs';
import path from 'path';

const { RemoteExtension } = await import('./dist-es/index.js');

// const RemoteExtension = require('./dist').RemoteExtension;

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const name = process.argv[2];
const packageFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'));

const extensionConfig = {
	packageInfo: Object.assign(packageFile, {
		name,	
	}),
	dataPath: `${__dirname}/examples/data/${name}/`,
	nameSuffix: '-example',
};

const { default: example } = await import(`./examples/${name}.js`)
const { default: settings } = await import('./examples/settings.js')

RemoteExtension(
	example, 
	settings, 
	extensionConfig
);