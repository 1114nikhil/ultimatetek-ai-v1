import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatService } from '../../service/chat-service';

interface Message {
  from: 'me' | 'bot';
  text?: string;
  tableData?: any[];
  time?: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  animations: [
    trigger('sidebarState', [
      state('expanded', style({ width: '320px', opacity: 1 })),
      state('collapsed', style({ width: '80px', opacity: 0.95 })),
      transition('expanded <=> collapsed', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
})
export class Chat {
 constructor(private chatService: ChatService) {}

  collapsed = false;
  newMessage = signal('');
  isLoading = signal(false);

  /** 🎯 Signal that holds all chat messages */
  messageBoard = signal<Message[]>([
  ]);

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  /** 🧠 Sends a query and updates messages reactively */
 send() {
  const msg = this.newMessage().trim();
  if (!msg) return;

  // 🧍‍♂️ User message
  this.messageBoard.update(list => [
    ...list,
    { from: 'me', text: msg, time: this.timeNow() },
  ]);

  this.newMessage.set('');
  this.scrollToBottom();

  const payload = { query: msg };
  this.isLoading.set(true);

  // 🧠 Add temporary loading message to messageBoard
  const loadingMessage: Message = {
    from: 'bot',
    text: 'Loading',
    time: this.timeNow(),
  };
  this.messageBoard.update(list => [...list, loadingMessage]);
  this.scrollToBottom();

  // 🚀 Make API call
  this.chatService.getData(payload).subscribe({
    next: (res: any) => {
      this.isLoading.set(false);

      // Remove the "Loading" bubble
      this.messageBoard.update(list => list.filter(m => m.text !== 'Loading'));

      // Parse response
      let response: any;
      try {
        response = typeof res === 'string' ? JSON.parse(res) : res;
      } catch {
        response = { status: false, message: 'Invalid JSON format.' };
      }

      // ✅ Success with table data
      if (response?.status === true && Array.isArray(response.result)) {
        this.messageBoard.update(list => [
          ...list,
          { from: 'bot', tableData: response.result, time: this.timeNow() },
        ]);
      }
      // ✅ Success with text data
      else if (response?.status === true) {
        this.messageBoard.update(list => [
          ...list,
          { from: 'bot', text: response.result?.toString() || 'No result found.', time: this.timeNow() },
        ]);
      }
      // ❌ Error
      else {
        this.messageBoard.update(list => [
          ...list,
          { from: 'bot', text: response?.message || 'Something went wrong.', time: this.timeNow() },
        ]);
      }

      this.scrollToBottom();
    },
    error: err => {
      console.error('Chat API error:', err);
      this.isLoading.set(false);

      // Remove "Loading" bubble
      this.messageBoard.update(list => list.filter(m => m.text !== 'Loading'));

      this.messageBoard.update(list => [
        ...list,
        { from: 'bot', text: '⚠️ Server error. Please try again later.', time: this.timeNow() },
      ]);

      this.scrollToBottom();
    },
  });
}

  timeNow() {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-scroll');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
