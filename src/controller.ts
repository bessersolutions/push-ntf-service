import DB from './database';
import Axios from 'axios';
import * as Type from './types';
import keys from './keys';

export const validate = async () => {
  const notifications : Array<Type.sqlNotification> = [];
  let results : any;
  await (await DB).query(
    "select ntf.id, ntf.receipt_key, ntf.received "
    +"from notificaciones as ntf "
    +"join sf_guard_user as sgu on ntf.client_id = sgu.client_id "
    +"where ntf.receipt_key <> '' and ntf.received = 0 and ntf.watch = 1 and sgu.pushkey <> ''"
  ).then(data => {
    console.log("val:", data.length);
    data.forEach((field : any) => {
      notifications.push({
        id : field.id,
        receipt_key : field.receipt_key,
        received : field.received
      })
    });
  }).catch(error => console.log(error));

  if(notifications.length)
  await Axios.post(keys.checkUrl, { ids : notifications.map(elem => elem.receipt_key) } )
  .then(result => {
    results = result.data.data;
  }).catch(error => console.log(error));

  if(results)
  for(let key in results) {
    const id = notifications.find(elem => elem.receipt_key === key)?.id;
    const record : Type.sqlNotification = {
      receipt_key : results[key]?.status === 'ok' ? key : (results[key].details?.error ? results[key].details?.error : key),
      received : results[key]?.status === 'ok' ? 1 : 2
    }
    await (await DB).query("update notificaciones set ? where id = ?", [record, id])
    .then(() => console.log("record:", id, record.received, record.receipt_key))
    .catch(error => console.log(error));
  };
}
///////////////////////////////////////////////////////////////////////////////////////////////
export const send = async () => {
  let notifications : Array<Type.Notification> = [];
  let results : Array<Type.PushResults> = [];
  await (await DB).query(
    "select ntf.id, sgu.pushkey, ntf.title, ntf.body "
    +"from notificaciones as ntf "
    +"join sf_guard_user as sgu on ntf.client_id = sgu.client_id "
    +"where ntf.receipt_key = '' and ntf.received = 0 and ntf.watch = 1 and sgu.pushkey <> ''"
  ).then(data => {
    console.log("send:", data.length);
    notifications = data.map((elem : any) => ({
      id : elem.id,
      to : elem.pushkey,
      title: elem.title,
      body : elem.body,
      sound : "default"
    }));
  }).catch(error => console.log(error));

  if(notifications.length)
  await Axios.post(keys.pushUrl, notifications)
  .then(result => {
    results = result.data.data.map((elem : any) => ({
      id : elem.id,
      status : elem.status,
      error : elem.details?.error ? elem.details.error : ''
    }));
  }).catch(error => console.log("Error:", error));

  if(results.length)
  for(let index = 0; index < results.length; index++) {
    const id = notifications[index].id;
    const record : Type.sqlNotification = {
      receipt_key : results[index]?.status === 'ok' ? results[index].id : results[index].error,
      received : results[index]?.status === 'ok' ? 0 : 2
    };
    await (await DB).query("update notificaciones set ? where id = ?", [record, id])
    .then(result => console.log("record:", id, record.received, record.receipt_key))
    .catch(error => console.log(error));
  }
}