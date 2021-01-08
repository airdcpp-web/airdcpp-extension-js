'use strict';

// This example script will search the specified items in random order and download
// the best match for each of them

const Utils = require('./utils');

const SettingDefinitions = [
	{
		key: 'search_interval',
		title: 'Search interval (minutes)',
		default_value: 5,
		type: 'number',
	}, {
		key: 'search_items',
		title: 'Search items',
		optional: true,
		default_value: [
			{
				pattern: 'ubuntu',
				extensions: 'iso;img',
				priority: Utils.priorityAutoId,
				file_type: 'any',
			}
		],
		type: 'list',
		item_type: 'struct',
		definitions: [
			...Utils.searchQueryDefinitions,
			{
				key: 'priority',
				title: 'Priority',
				default_value: Utils.priorityAutoId,
				type: 'number',
				options: Utils.priorityEnum,
			}, {
				key: 'target_directory',
				title: 'Target directory',
				default_value: '',
				type: 'directory_path',
				help: 'Leave empty to use the default download directory',
				optional: true,
			},
		]
	}
];

const SettingsManager = require('airdcpp-extension-settings');

module.exports = function (socket, extension) {
	let searchInterval;

	const settings = SettingsManager(socket, {
		extensionName: extension.name,
		configVersion: 1,
		configFile: extension.configPath + 'config.json',
		definitions: SettingDefinitions,
	});

	const searchItem = async () => {
		// Anything to search for?
		const itemCount = settings.getValue('search_items').length;
		if (itemCount === 0) {
			return;
		}

		// Get a random item to search for
		const pos = Math.floor(Math.random() * itemCount);
		const item = settings.getValue('search_items')[pos];

		// Create instance
		const instance = await socket.post('search');

		// Add instance-specific listener for results
		const unsubscribe = await socket.addListener('search', 'search_hub_searches_sent', searchInfo => {
			onSearchSent(item, instance, unsubscribe, searchInfo);
		}, instance.id);

		// Perform the actual search
		const searchQueueInfo = await socket.post(`search/${instance.id}/hub_search`, {
			query: Utils.parseSearchQuery(item),
		});

		// Show log message for the user
		socket.post('events', {
			text: `Auto downloader: the item ${item.pattern} was searched for from ${searchQueueInfo.queued_count} hubs`,
			severity: 'info',
		});
	};

	const onSearchSent = async (item, instance, unsubscribe, searchInfo) => {
		// Collect the results for 5 seconds
		await Utils.sleep(5000);

		// Get only the first result (results are sorted by relevance)
		const results = await socket.get(`search/${instance.id}/results/0/1`);

		if (results.length > 0) {
			// We have results, download the best one
			const result = results[0];
			socket.post(`search/${instance.id}/results/${result.id}/download`, {
				priority: Utils.toApiPriority(item.priority),
				target_directory: item.target_directory,
			});
		}

		// Remove listener for this search instance
		unsubscribe();
	};

	extension.onStart = async () => {
		// Init settings
		await settings.load();

		// Set inteval
		searchInterval = setInterval(searchItem, settings.getValue('search_interval') * 60 * 1000);

		// Perform an instant search as well
		searchItem();
	};

	extension.onStop = () => {
		// We can't search without a socket
		clearInterval(searchInterval);
	};
}