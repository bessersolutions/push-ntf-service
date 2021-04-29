import * as svc from './controller';

const start = async () => {
  setInterval(async () => {
    console.log(new Date());
    await svc.validate();
    await svc.send();
  }, 300000)
}

start();