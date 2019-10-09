import { Injectable } from '@angular/core';
import  {tList ,userList}   from '../data/chat-example-data';
import { MessagesService } from 'app/message/messages.service';
import { User } from 'app/user/user.model';
import { Subject, BehaviorSubject } from 'rxjs';
import { UsersService } from 'app/user/users.service';
import { Message } from 'app/message/message.model';
import { ThreadsService } from 'app/thread/threads.service';
import { Thread } from 'app/thread/thread.model';

// var t = tList;
@Injectable()
export class SendMessageService {
  currentSender:User;
  sendThread:Thread;

  constructor(public messageService:MessagesService,public userService:UsersService,public threadsService: ThreadsService) {
    //跟踪设置的sender
    this.userService.senderUser.subscribe(
      (user:User)=>{
        this.currentSender = user;
      }
    )
    this.threadsService.sendThread.subscribe(
      (thread)=>{
        this.sendThread = thread ;
      }
    );
  }
  
  
  sendMessage(messageText:string){
    let m = new Message();
    m.author = this.currentSender;
    m.text = messageText;
    m.thread = this.sendThread;
    this.messageService.addMessage(m);
    // console.log(this.currentSender,messageText);
    // m.thread = false ;
  }

}
