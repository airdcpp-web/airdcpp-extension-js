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
		type: 'list_string',
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

	const onOutgoingHubMessage = (message, accept, reject) => {
		const statusMessage = checkChatCommand(message.text);
		if (statusMessage) {
			socket.post('hubs/status_message', {
				hub_urls: [ message.hub_url ],
				text: statusMessage,
				severity: 'info',
			});
		}

		accept();
	};

	const onOutgoingPrivateMessage = (message, accept, reject) => {
		const statusMessage = checkChatCommand(message.text);
		if (statusMessage) {
			socket.post(`private_chat/${message.user.cid}/status_message`, {
				text: statusMessage,
				severity: 'info',
			});
		}

		accept();
	};

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

	// Basic chat command handling, returns possible status message to post
	const checkChatCommand = (text) => {
		if (text.length === 0 || text[0] !== '/') {
			return null;
		}

		if (text.indexOf('/help') === 0) {
			return `

	Chat filter commands

	/chatfilter add <word>
	/chatfilter remove <word>
	/chatfilter list

			`;
		} else if (text.indexOf('/chatfilter') === 0) {
			const params = text.split(' ');
			if (params.length < 2) {
				return 'Chat filter: not enough parameters';
			}

			const ignoredWords = settings.getValue('ignored_words');
			if (params[1] === 'add') {
				if (params.length < 3) {
					return 'Chat filter: not enough parameters';
				}

				if (ignoredWords.indexOf(params[2]) !== -1) {
					return 'Chat filter: word is filtered already';
				}

				settings.setValue('ignored_words', [
					...ignoredWords,
					params[2]
				]);

				return `Chat filter: word ${params[2]} was added`;
			} else if (params[1] == 'remove') {
				if (params.length < 3) {
					return 'Chat filter: not enough parameters';
				}

				const wordIndex = ignoredWords.indexOf(params[2]);
				if (wordIndex === -1) {
					return 'Chat filter: ignored word not found';
				}

				settings.setValue('ignored_words', ignoredWords.filter((_, curIndex) => wordIndex !== curIndex));
				return `Chat filter: word ${params[2]} was removed`;
			} else if (params[1] == 'list') {
				return `Chat filter: ${ignoredWords.join(', ')}`;
			} else {
				return 'Chat filter: unknown command';
			}
		}

		return null;
	};

	extension.onStart = async () => {
		await settings.load();

		const subscriberInfo = {
			id: 'example_chat_filter',
			name: 'Chat filter',
		};

		socket.addHook('hubs', 'hub_incoming_message_hook', onIncomingMessage, subscriberInfo);
		socket.addHook('private_chat', 'private_chat_incoming_message_hook', onIncomingMessage, subscriberInfo);

		socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
		socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
	};
};