import { sendMessage } from "@/utils/message";

export async function getStorage<T>(key: string,defaultValue?:T):Promise<T> {
    return (await sendMessage('storage:get', {key})) ?? defaultValue;
}

export async function setStorage<T>(key: string, value: T): Promise<boolean> {
    return await sendMessage('storage:set', {key, value});
}

window.__q_getStorage = getStorage;
window.__q_setStorage = setStorage;