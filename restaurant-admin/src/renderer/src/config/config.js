// export const domainURL = 'http://192.168.43.181:8000'
export const isImageServer = true;

// export const domainURL = isImageServer ? 'https://mttonlinepos.pythonanywhere.com' :'https://empirepos.pythonanywhere.com'
export const domainURL = localStorage.getItem('domainURL') || 'http://localhost:8000';
export const WEBSOCKET =  localStorage.getItem('WEBSOCKET') ||  'ws://10.0.3.121:8000';

export const APPNAME = "Perfect Restaurant";

