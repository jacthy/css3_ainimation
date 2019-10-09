import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import * as _ from 'lodash';

import { ThreadsService } from './../thread/threads.service';
import { MessagesService } from './../message/messages.service';

import { Thread } from './../thread/thread.model';
import { Message } from './../message/message.model';
import { tList, userList } from '../data/chat-example-data'
import { Observable } from 'rxjs';
import { UsersService } from 'app/user/users.service';
import { User } from 'app/user/user.model';
import { SendMessageService } from 'app/send-message/send-service.service';


@Component({
  selector: 'chat-nav-bar',
  templateUrl: './chat-nav-bar.component.html',
  styleUrls: ['./chat-nav-bar.component.css']
})
export class ChatNavBarComponent implements OnInit {
  unreadMessagesCount: number;
  threads: Observable<Thread[]>;
  sendFrom: string;
  userList: User[] = userList;
  threadList = tList;
  sender: User;
  messageText: string;
  senderUser: User;
  sendThread: Thread;

  constructor(public messagesService: MessagesService, public userService: UsersService, public sendService: SendMessageService,
    public threadsService: ThreadsService) {
    this.threads = this.threadsService.orderedThreads;

  }

  sendToMe(event: Event) {
    this.threadsService.setSendThread(this.sendThread);
    this.sendService.sendMessage(this.messageText);
    event.preventDefault();
  }

  fromWho(event: Event, thread: Thread) {
    this.sendThread = thread;
    this.userService.setSenderUser(thread.lastMessage.author);
    event.preventDefault();
  }
  ngOnInit(): void {
    this.messagesService.messages
      .combineLatest(
        this.threadsService.currentThread,
        (messages: Message[], currentThread: Thread) =>
          [currentThread, messages])

      .subscribe(([currentThread, messages]: [Thread, Message[]]) => {
        this.unreadMessagesCount =
          _.reduce(
            messages,
            (sum: number, m: Message) => {
              const messageIsInCurrentThread: boolean = m.thread &&
                currentThread &&
                (currentThread.id === m.thread.id);
              if (m && !m.isRead && !messageIsInCurrentThread) {
                sum = sum + 1;
              }
              return sum;
            },
            0);
      });
    this.userService.senderUser
      .subscribe(
        (user: User) => {
          this.senderUser = user;
        });
    this.threadsService.sendThread.subscribe(
      (thread) => {
        this.sendThread = thread;
      }
    )
  }
  checkUnreadMessage(){

    this.threadsService.setCurrentThread(new Thread());
  }
}
