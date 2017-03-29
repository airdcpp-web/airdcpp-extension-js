const fs = require('fs');
const path = require('path');

const RemoteExtension = require('./').RemoteExtension;

const name = process.argv[2];
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'));

const extensionConfig = {
	packageInfo: Object.assign(package, {
		name,	
	}),
	dataPath: `${__dirname}/examples/data/${name}/`,
	nameSuffix: '-example',
};

RemoteExtension(
	require(`./examples/${name}.js`), 
	require('./examples/settings.js'), 
	extensionConfig
);