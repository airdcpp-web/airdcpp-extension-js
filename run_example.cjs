const fs = require('fs');
const path = require('path');

const RemoteExtension = require('./dist').RemoteExtension;

const name = process.argv[2];
const packageFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'));

const extensionConfig = {
	packageInfo: Object.assign(packageFile, {
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