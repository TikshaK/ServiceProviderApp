import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export class NetworkUnavailableError extends Error {
	constructor() {
		super('An internet connection is required to make this request.');
		this.name = 'NetworkUnavailableError';
	}
}

let offlineAlertVisible = false;

function showOfflineAlert(): void {
	if (!offlineAlertVisible) {
		offlineAlertVisible = true;
		Alert.alert(
			'No Internet Connection',
			'Please check your internet connection and try again.',
			[{ text: 'OK', onPress: () => { offlineAlertVisible = false; } }],
			{ cancelable: false, onDismiss: () => { offlineAlertVisible = false; } },
		);
	}
}

function isOnline(isConnected: boolean | null, isInternetReachable: boolean | null): boolean {
	return isConnected === true && isInternetReachable !== false;
}

export async function ensureInternetConnection(): Promise<void> {
	const networkState = await NetInfo.fetch();
	if (isOnline(networkState.isConnected, networkState.isInternetReachable)) {
		return;
	}

	showOfflineAlert();
	throw new NetworkUnavailableError();
}

export async function baseApi<T>(request: () => Promise<T>): Promise<T> {
	await ensureInternetConnection();
	return request();
}

export function subscribeWhenOnline(subscribe: () => () => void): () => void {
	let unsubscribeRequest: (() => void) | undefined;
	let isDisposed = false;
	let wasOffline = false;

	const unsubscribeNetwork = NetInfo.addEventListener(state => {
		if (state.isConnected === null) {
			return;
		}

		if (isOnline(state.isConnected, state.isInternetReachable)) {
			wasOffline = false;
			if (!isDisposed && !unsubscribeRequest) {
				unsubscribeRequest = subscribe();
			}
			return;
		}

		if (!wasOffline) {
			showOfflineAlert();
		}
		wasOffline = true;
		unsubscribeRequest?.();
		unsubscribeRequest = undefined;
	});

	return () => {
		isDisposed = true;
		unsubscribeNetwork();
		unsubscribeRequest?.();
	};
}
