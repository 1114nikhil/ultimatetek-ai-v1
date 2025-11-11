import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatService } from '../../service/chat-service';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DrawerModule } from 'primeng/drawer';

interface Message {
  from: 'me' | 'bot';
  text?: string;
  tableData?: any[];
  time?: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, DrawerModule,FormsModule, ButtonModule, InputTextModule, TableModule,TextareaModule,RadioButtonModule ],
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

  drawerOpen = true; 
  newMessage = signal('');
  isLoading = signal(false);

    apis = [
    { key: 'dbquery1', name: 'DB Query 1', url: 'https://ai.ultimatetek.in:8077/dbquery/generate/insights' },
    { key: 'dbquery2', name: 'DB Query 2', url: 'https://api.example.com/dbquery2' },
  ];

  selectedApi = this.apis[0]; // default selection

  /** 🎯 Signal that holds all chat messages */
  messageBoard = signal<Message[]>([
  ]);
  /** 💡 Effect to clear chat when API changes */
  ngOnInit() {
    // Watch for selection change (manual way since we use ngModel)
    const radioButtons = document.querySelectorAll('input[name="category"]');
    radioButtons.forEach(btn => {
      btn.addEventListener('change', () => {
        this.clearChat();
      });
    });
  }
 toggleSidebar() {
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }
  /** 🧹 Clears chat messages */
  clearChat() {
    this.messageBoard.set([]);
    this.newMessage.set('');
  }
 
 
  /** 🧠 Sends a query and updates messages reactively */
send() {
    const msg = this.newMessage().trim();
    if (!msg || !this.selectedApi) return;

    this.messageBoard.update(list => [
      ...list,
      { from: 'me', text: msg, time: this.timeNow() },
    ]);

    this.newMessage.set('');
    this.scrollToBottom();

    const payload = { query: msg };
    this.isLoading.set(true);

    // Temporary loading message
    const loadingMessage: Message = { from: 'bot', text: 'Loading', time: this.timeNow() };
    this.messageBoard.update(list => [...list, loadingMessage]);
    this.scrollToBottom();

    // 🧠 Use selected API’s URL
    this.chatService.getData(payload, this.selectedApi.url).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.messageBoard.update(list => list.filter(m => m.text !== 'Loading'));

        let response;
        try {
          response = typeof res === 'string' ? JSON.parse(res) : res;
        } catch {
          response = { status: false, message: 'Invalid JSON format.' };
        }

        if (response?.status === true && Array.isArray(response.result)) {
          this.messageBoard.update(list => [
            ...list,
            { from: 'bot', tableData: response.result, time: this.timeNow() },
          ]);
        } else if (response?.status === true) {
          this.messageBoard.update(list => [
            ...list,
            { from: 'bot', text: response.result?.toString() || 'No result found.', time: this.timeNow() },
          ]);
        } else {
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
