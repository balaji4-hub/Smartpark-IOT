export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

export const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? `${socketProtocol}//${window.location.host}/ws` : 'ws://localhost:4000/ws');
