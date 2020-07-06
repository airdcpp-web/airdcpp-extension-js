'use strict';

// This example script will reject incoming chat messages containing unwanted words
// Additionally it provides handling for outgoing chat commands that can also be used to
// add/remove ignored words (note that changes are not persisted when reloading the script)

const SettingDefinitions = [
	{
		// Announce finished bundles when they are added in share
		key: 'skip_op',
		title: "Don't ignore messages sent by operators",
		default_value: true,
		type: 'boolean',
	}, {
		key: 'ignored_words',
		title: 'Ignored words',
		type: 'list',
		item_type: 'string',
		optional: true,
		default_value: [
			'ignoretest',
			'http://',
		],
	}
];

const SettingsManager = require('airdcpp-extension-settings');

// MODULE
module.exports = function (socket, extension) {
	const settings = SettingsManager(socket, {
		extensionName: extension.name,
		configVersion: 1,
		configFile: extension.configPath + 'config.json',
		definitions: SettingDefinitions,
	});

	const onIncomingMessage = (message, accept, reject) => {
		if (
			allowFilterUser(message.from) && // actual sender of the message
			(!message.replyTo || allowFilterUser(message.replyTo)) // possible chatroom
		) {
			const matchingWord = settings.getValue('ignored_words').find(word => message.text.indexOf(word) !== -1);
			if (matchingWord) {
				reject('filtered', `Filter due to message matching the word "${matchingWord}"`);
				return;
			}
		}

		accept();
	};

	// Returns whether messages from this user can be filtered
	const allowFilterUser = (user) => {
		if (user.flags.indexOf('self') !== -1) {
			// Don't filter own messages...
			return false;
		}

		if (settings.getValue('skip_op') && user.flags.indexOf('op') !== -1) {
			return false;
		}

		return true;
	};

	const checkFilterArgs = (args) => {
		const ignoredWords = settings.getValue('ignored_words');
		switch (args[0]) {
			case 'add': {
				if (args.length < 2) {
					return 'Chat filter: not enough parameters';
				}

				const word = args[1];
				if (ignoredWords.indexOf(word) !== -1) {
					return `Chat filter: word "${word}" is filtered already`;
				}

				settings.setValue('ignored_words', [
					...ignoredWords,
					word
				]);

				return `Chat filter: word "${word}" was added`;
			}
			case 'remove': {
				if (args.length < 2) {
					return 'Chat filter: not enough parameters';
				}

				const word = args[1];
				const wordIndex = ignoredWords.indexOf(word);
				if (wordIndex === -1) {
					return `Chat filter: ignored word "${word}" was not found`;
				}

				settings.setValue('ignored_words', ignoredWords.filter((_, curIndex) => wordIndex !== curIndex));
				return `Chat filter: word "${word}" was removed`;
			}
			case 'list': {
				return `Chat filter: ${ignoredWords.join(', ')}`;
			}
			default: {
				return 'Chat filter: unknown command';
			}
		}
	}

	// Basic chat command handling, returns possible status message to post
	const checkChatCommand = ({ command, args }) => {
		switch (command) {
			case 'help': {
				return `

	Chat filter commands

	/chatfilter add <word>
	/chatfilter remove <word>
	/chatfilter list
			
				`;
			}
			case 'chatfilter': {
				if (args.length === 0) {
					return 'Chat filter: not enough parameters';
				}

				return checkFilterArgs(args);
			}
		}

		return null;
	};

	const onChatCommand = (type, data, entityId) => {
		const statusMessage = checkChatCommand(data);
		if (statusMessage) {
			socket.post(`${type}/${entityId}/status_message`, {
				text: statusMessage,
				severity: 'info',
			});
		}
	};

	extension.onStart = async (sessionInfo) => {
		if (sessionInfo.system_info.api_feature_level < 4) {
			throw new Error(`API feature level 4 is required for running this example`);
		}

		await settings.load();

		const subscriberInfo = {
			id: 'example_chat_filter',
			name: 'Chat filter',
		};

		// Incoming message hooks
		socket.addHook('hubs', 'hub_incoming_message_hook', onIncomingMessage, subscriberInfo);
		socket.addHook('private_chat', 'private_chat_incoming_message_hook', onIncomingMessage, subscriberInfo);

		// Chat command listeners
		socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(this, 'hubs'));
		socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(this, 'private_chat'));
	};
};