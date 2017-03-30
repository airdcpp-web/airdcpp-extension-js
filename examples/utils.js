'use strict';

const byteUnits = [ 'kB','MB','GB','TB','PB','EB','ZB','YB' ];

const priorityEnum = [
	{
		id: -1,
		name: 'Paused (forced)',
	}, {
		id: 0,
		name: 'Paused',
	}, {
		id: 1,
		name: 'Lowest',
	}, {
		id: 2,
		name: 'Low',
	}, {
		id: 3,
		name: 'Normal',
	}, {
		id: 4,
		name: 'High',
	}, {
		id: 5,
		name: 'Highest',
	}
];

const fileTypeEnum = [
	{
		id: 'any',
		name: 'Any',
	}, {
		id: 'directory',
		name: 'Directory',
	}, {
		id: 'file',
		name: 'File',
	}, {
		id: 'audio',
		name: 'Audio',
	}, {
		id: 'compressed',
		name: 'Compressed',
	}, {
		id: 'document',
		name: 'Document',
	}, {
		id: 'executable',
		name: 'Executable',
	}, {
		id: 'picture',
		name: 'Picture',
	}, {
		id: 'video',
		name: 'Video',
	}
];

module.exports = {
	formatSize: function (fileSizeInBytes) {
		const thresh = 1024;
		if (Math.abs(fileSizeInBytes) < thresh) {
			return fileSizeInBytes + ' B';
		}

		let u = -1;
		do {
			fileSizeInBytes /= thresh;
			++u;
		} while (Math.abs(fileSizeInBytes) >= thresh && u < byteUnits.length - 1);

		return fileSizeInBytes.toFixed(2) + ' ' + byteUnits[u];
	},

	// Works only for directories
	getLastDirectory: function (fullPath) {
		const result = fullPath.match(/([^\\\/]+)[\\\/]$/);
		return result ? result[1] : fullPath;
	},

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	parseSearchQuery(item) {
		return {
			pattern: item.pattern,
			extensions: item.extensions.split(';'),
			file_type: item.file_type,
			min_size: item.min_size * 1024 * 1024,
		};
	},

	searchQueryDefinitions: [
		{
			key: 'pattern',
			title: 'Search string',
			default_value: '',
			type: 'string',
			optional: true,
		}, {
			key: 'extensions',
			title: 'File extensions',
			default_value: '',
			type: 'string',
			help: 'Separate extensions with ; (example: exe;iso;img)',
			optional: true,
		}, {
			key: 'file_type',
			title: 'File type',
			default_value: 'any',
			type: 'string',
			options: fileTypeEnum,
		}, {
			key: 'min_size',
			title: 'Minimum size (MiB)',
			default_value: 0,
			type: 'number',
		}
	],

	fileTypeEnum,
	priorityEnum,
};