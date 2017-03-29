'use strict';

// This script will announce hashed directories and finished bundles in connected hubs

const SettingDefinitions = [
	{
		// Limitations: 
		// - it will announce the directory every time when new files are hashed into it
		// - when multiple per-volume hashers are used and hashing the same directory, there will be a separate announcement for each of them
		// A cache of already announced directories could be implemented to avoid such issues
		key: 'announce_hashed',
		title: 'Announce hashed items',
		defaultValue: true,
		type: 'boolean',
	}, {
		// Announce finished bundles when they are added in share
		key: 'announce_finished_bundles',
		title: 'Announce finished bundles',
		defaultValue: true,
		type: 'boolean',
	}, {
		key: 'hub_urls',
		title: 'Hub addresses',
		defaultValue: [],
		help: 'Leave empty to enable in all hubs',
		type: 'list_string',
		optional: true,
	}
];


const SettingsManager = require('airdcpp-extension-settings');
const Utils = require('./utils');

module.exports = function (socket, extension) {
	const settings = SettingsManager(socket, {
		extensionName: extension.name,
		configVersion: 1,
		configFile: extension.configPath + 'config.json',
		definitions: SettingDefinitions,
	});

	const onDirectoryShared = (name, size) => {
		// Send a chat message to specified hubs
		const urls = settings.getValue('hub_urls');
		socket.post('hubs/chat_message', {
			hub_urls: urls.length > 0 ? urls : undefined,
			text: `The directory ${name} (${Utils.formatSize(size)}) was added in share`,
		});
	};

	const onBundleStatusChanged = (bundle) => {
		if (bundle.status.id !== 'shared') {
			return;
		}

		if (bundle.type.id === 'file') {
			return;
		}

		onDirectoryShared(bundle.name, bundle.size);
	};

	const onDirectoryHashed = (directoryInfo) => {
		onDirectoryShared(Utils.getLastDirectory(directoryInfo.path), directoryInfo.size);
	};

	extension.onStart = async () => {
		// Init settings
		await settings.load();

		// Add listeners
		if (settings.getValue('announce_hashed')) {
			socket.addListener('hash', 'hasher_directory_finished', onDirectoryHashed);
		}

		if (settings.getValue('announce_finished_bundles')) {
			socket.addListener('queue', 'queue_bundle_status', onBundleStatusChanged);
		}
	};
}