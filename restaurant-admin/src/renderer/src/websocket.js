import { WEBSOCKET } from "./config/config";

const newSocketAdmin =  new WebSocket(WEBSOCKET+'/ws/chat/admin/');
const newSocketWaiter =  new WebSocket(WEBSOCKET+'/ws/chat/waiter/');
const newSocketKitchen =  new WebSocket(WEBSOCKET+'/ws/chat/kitchen/');


const initWebSocket = ()=>{
    newSocketAdmin.onmessage = (e) => {
        console.log(e.data);
    }
    
    newSocketWaiter.onmessage = (e) => {
        console.log(e.data);
    }
    
    newSocketKitchen.onmessage = (e) => {
        console.log(e.data);
    }
}

const sendToKitchen = (data)=>{
    newSocketKitchen.send(JSON.stringify({
        message: data
    
    }));
}

const sendToWaiter = (data)=>{
    newSocketWaiter.send(JSON.stringify({
        message: data
    }));
}

const sendToAdmin = (data)=>{
    newSocketAdmin.send(JSON.stringify({
        message: data
    }));

}

initWebSocket();

export {newSocketAdmin,newSocketWaiter, newSocketKitchen, sendToKitchen, sendToWaiter, initWebSocket, sendToAdmin}
