import http from 'http';
import express from 'express';
import './config/logging';
import { SERVER } from './config/config';
import { connectDb } from './database/db';
import { application } from './app';
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
	logging.info('-------------------------------------------');
	logging.info('Connect Database');
	logging.info('-------------------------------------------');
	connectDb();

	logging.info('-------------------------------------------');
	logging.info('Start Application');
	logging.info('-------------------------------------------');
	httpServer = http.createServer(application);
	httpServer.listen(SERVER.SERVER_PORT, () => {
		logging.log('----------------------------------------');
		logging.log(`Server started on ${SERVER.SERVER_HOSTNAME}:${SERVER.SERVER_PORT}`);
		logging.log('----------------------------------------');
	});
};

export const Shutdown = (callback: any) => {
	httpServer && httpServer.close(callback);
};

Main();
