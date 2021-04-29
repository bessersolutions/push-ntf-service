## Simple implementation
## for the expo push-notifications API

### Add keys.ts file to your src folder exporting an object like this:

export default {
  database : {
    host : '<your_mysql_server_ip_address>',
    user : '<mysql_username>',
    password : '<mysql_username_password>',
    database : '<database_name>'
  },
  pushUrl : 'https://exp.host/--/api/v2/push/send',
  checkUrl: 'https://exp.host/--/api/v2/push/getReceipts'
}