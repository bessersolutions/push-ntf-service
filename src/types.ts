export interface Notification  {
  id : number;
  to : string;
  title : string;
  body : string;
  sound : string;
}

export interface PushResults {
  id : string;
  status : string;
  error? : string;
}

export interface sqlNotification {
  id? : number;
  receipt_key : string | undefined;
  received : number;
}