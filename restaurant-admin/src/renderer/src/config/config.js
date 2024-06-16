// export const domainURL = 'http://192.168.43.181:8000'
export const isImageServer = true;

// export const domainURL = isImageServer ? 'https://mttonlinepos.pythonanywhere.com' :'https://empirepos.pythonanywhere.com'
export const domainURL = 'http://10.0.3.121:8000' || localStorage.getItem('domainURL');
export const WEBSOCKET = 'ws://10.0.3.121:8000' || localStorage.getItem('WEBSOCKET');

export const APPNAME = "Perfect Restaurant";

