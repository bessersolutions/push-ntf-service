import mySql from 'promise-mysql';
import keys from './keys';

var myPool = mySql.createPool(keys.database);

myPool.then(connection => {
  connection.release;
  console.log('Database connected');
});

export default myPool;