import { Timestamp } from '@angular/fire/firestore';

export interface Category {
  id?: string;
  name: string;
}

export interface Task {
  id?: string;
  name: string;
  category: string;
  completed: boolean;
  createdAt: Timestamp;
}
