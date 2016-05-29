'use strict';

const { Application } = require('spectron');

const config = require('../../../config.json');
const { 
	APP_PATH,
	IMAGE_ID,
	WAIT_UNTIL_TIMEOUT
} = config;

describe('Edit > Undo', function () {
	const app = new Application({
		path: APP_PATH,
		env: {
			ELECTRON_ENABLE_LOGGING: true,
			ELECTRON_ENABLE_STACK_DUMPING: true,
			NEGATIVE_IGNORE_SETTINGS: false,
			NEGATIVE_SKIP_RESET_DIALOG: true,
			NEGATIVE_SETTINGS_PATH: '../test/fixtures/two-windows-with-data.json',
			NODE_ENV: 'development'
		}
	});
	
	this.timeout(60000);
	
	beforeEach(() => {
		return app.start();
	});

	afterEach(() => {
		if (app && app.isRunning()) {
			return app.stop();
		}
	});
	
	it('Should undo', () => {
		return app.client.waitUntilWindowLoaded()
			.then(() => app.electron.ipcRenderer.send('test-undo'))
			.then(() => {
				return app.client.waitUntil(() => {
					return app.client.selectorExecute(IMAGE_ID, (element) => element[0].getAttribute('src'))
						.then((src) => src === '');
				}, WAIT_UNTIL_TIMEOUT);
			});
	});
});
