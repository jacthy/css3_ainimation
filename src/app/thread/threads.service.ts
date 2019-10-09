import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Thread } from './thread.model';
import { Message } from '../message/message.model';
import { MessagesService } from '../message/messages.service';
import * as _ from 'lodash';
import { User } from 'app/user/user.model';
import { UsersService } from 'app/user/users.service';

@Injectable()
export class ThreadsService {

  // `threads` is a observable that contains the most up to date list of threads
  threads: Observable<{ [key: string]: Thread }>;

  // `orderedThreads` contains a newest-first chronological list of threads
  orderedThreads: Observable<Thread[]>;

  // `currentThread` contains the currently selected thread
  currentThread: Subject<Thread> =
    new BehaviorSubject<Thread>(new Thread());

  sendThread: Subject<Thread> =
    new BehaviorSubject<Thread>(new Thread());

  // `currentThreadMessages` contains the set of messages for the currently
  // selected thread
  currentThreadMessages: Observable<Message[]>;
  currentUnreadMessages: Observable<Message[]>;
  currenUser: User;

  constructor(public messagesService: MessagesService,public userService:UsersService) {

    this.userService.currentUser.subscribe(
      user => {
        this.currenUser = user;
      }
    )
    this.threads = messagesService.messages
      .map( (messages: Message[]) => {
        const threads: {[key: string]: Thread} = {};
        // Store the message's thread in our accumulator `threads`
        messages.map((message: Message) => {
          threads[message.thread.id] = threads[message.thread.id] ||
            message.thread;

          // Cache the most recent message for each thread
          const messagesThread: Thread = threads[message.thread.id];
          if (!messagesThread.lastMessage ||
              messagesThread.lastMessage.sentAt < message.sentAt) {
            messagesThread.lastMessage = message;
          }
        });
        return threads;
      });

    this.orderedThreads = this.threads
      .map((threadGroups: { [key: string]: Thread }) => {
        const threads: Thread[] = _.values(threadGroups);
        return _.sortBy(threads, (t: Thread) => t.lastMessage.sentAt).reverse();
      });
    this.currentUnreadMessages = messagesService.messages.combineLatest(
      (messages:Message[])=>{
        
        if(messages.length > 0 ){
          
          return _.chain(messages)
          .filter((message: Message) =>{
              return (message.isRead === false);
            }
          )
          .value();
        }else{
          return [];
        }
      }
    );
    this.currentThreadMessages = this.currentThread
      .combineLatest(messagesService.messages,
                     (currentThread: Thread, messages: Message[]) => {
                       console.log(currentThread);
        if (currentThread.name && messages.length > 0) {
          return _.chain(messages)
            .filter((message: Message) =>{
                return (message.thread.id === currentThread.id);
              }
            )
            .map((message: Message) => {
              message.isRead = true;
              return message; })
            .value();
        } else if(messages.length > 0){
          return _.chain(messages)
          .filter((message: Message) =>{
              return (message.isRead === false && message.author !== this.currenUser);
            }
          )
          .value();
        }else{
          return [];
        }
      });
      // console.log(this.currentThreadMessages);
    this.currentThread.subscribe(this.messagesService.markThreadAsRead);
  }

  setCurrentThread(newThread: Thread): void {
    this.currentThread.next(newThread);
  }

  setSendThread(thread: Thread): void {
    this.sendThread.next(thread);
  }

}

export const threadsServiceInjectables: Array<any> = [
  ThreadsService
];
