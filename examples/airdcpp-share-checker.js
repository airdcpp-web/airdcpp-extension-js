'use strict';

// This script will search for a list of forbidden items directly from each connecting user
// Forbidden items will be reported privately to the user and also locally as status message


const Utils = require('./utils');

const SettingDefinitions = [
	{
		// Limitations: 
		// - it will announce the directory every time when new files are hashed into it
		// - when multiple per-volume hashers are used and hashing the same directory, there will be a separate announcement for each of them
		// A cache of already announced directories could be implemented to avoid such issues
		key: 'check_own_share',
		title: 'Check own share',
		default_value: true,
		type: 'boolean',
	}, {
		// Announce finished bundles when they are added in share
		key: 'check_connecting_users',
		title: 'Check each connecting user',
		default_value: true,
		type: 'boolean',
	}, {
		key: 'search_items',
		title: 'Search items',
		optional: true,
		default_value: [
			{
				extensions: 'iso',
				min_size: 500,
				report_message: 'ISO file(s) over 500 MB',
			}
		],
		type: 'list',
		item_type: 'struct',
		definitions: [
			...Utils.searchQueryDefinitions,
			{
				key: 'report_message',
				title: 'Report message',
				default_value: '',
				type: 'string',
				help: 'Message to show when forbidden items are found',
			},
		]
	}
];

// CONFIG END

// UTILS
const formatResultPaths = (paths) => {
	return paths.join(', ');
};

const SettingsManager = require('airdcpp-extension-settings');

// MODULE
module.exports = function (socket, extension) {
	const settings = SettingsManager(socket, {
		extensionName: extension.name,
		configVersion: 1,
		configFile: extension.configPath + 'config.json',
		definitions: SettingDefinitions,
	});

	const onUserConnected = (user) => {
		// Direct search is supported only in ADC hubs
		if (user.flags.indexOf('nmdc') !== -1 || user.flags.indexOf('me') !== -1) {
			return;
		}

		// Perform search for every item
		settings.getValue('search_items').forEach(async (item) => {
			// Get a new instance
			const instance = await socket.post('search');

			// Post the search
			await socket.post(`search/${instance.id}/user_search`, {
				user: user,
				query: Utils.parseSearchQuery(item),
			});

			// Wait for the results to arrive
			await Utils.sleep(5000);

			// Get the best results
			const results = await socket.get(`search/${instance.id}/results/0/10`);

			// Report
			if (results.length > 0) {
				const paths = results.map(result => result.path, []);
				reportUserResults(user, item, paths);
			}

			// Preserve resources
			socket.delete(`search/${instance.id}`);
		});
	};

	const reportUserResults = (user, item, results) => {
		// Notify the user
		// Forbidden item(s) found from share: ISO file(s) over 500 MB (example: /Linux/Ubuntu 15.04.iso)
		socket.post('private_chat/chat_message', {
			user: user,
			text: `Forbidden item(s) found from share: ${item.report_message} (${formatResultPaths(results)})`,
		});

		// Show a status message in that particular hub
		// [100]MrFastSpeed: ISO file(s) over 500 MB (/Linux/Ubuntu 15.04.iso)
		socket.post('hubs/status_message', {
			hub_urls: [ user.hub_url ],
			text: `${user.nick}: ${item.report_message} (${formatResultPaths(results)})`,
			severity: 'info',
		});
	};

	const searchOwnShare = () => {
		// Perform search for every item
		settings.getValue('search_items').forEach(async (item) => {
			// Share results are returned instantly
			const results = await socket.post('share/search', {
				query: Utils.parseSearchQuery(item),
				share_profile: undefined // Search from all profiles
			});

			if (results.length > 0) {
				const paths = results.map(result => result.real_paths, []);
				reportShareResults(item, paths);
			}
		});
	};

	const reportShareResults = (item, results) => {
		// Show an event message
		// Forbidden item found from own share: ISO file(s) over 500 MB (/Linux/Ubuntu 15.04.iso)
		socket.post('events', {
			text: `Forbidden item found from own share: ${item.report_message} (${formatResultPaths(results)})`,
			severity: 'warning',
		});
	};

	extension.onStart = async () => {
		// Init settings
		await settings.load();

		if (settings.getValue('check_connecting_users')) {
			socket.addListener('hubs', 'hub_user_connected', onUserConnected);
		}

		if (settings.getValue('check_own_share')) {
			// Check own share on every startup
			searchOwnShare();
		}
	};
};