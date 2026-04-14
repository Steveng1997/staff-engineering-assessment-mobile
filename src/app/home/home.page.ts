import {
  Component,
  OnInit,
  Injector,
  runInInjectionContext,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

// Staff Level Tip: Define interfaces to avoid runtime errors and improve IDE autocompletion
interface Task {
  id?: string;
  name: string;
  category: string;
  completed: boolean;
  createdAt: any;
}

interface Category {
  id?: string;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // Optimization: OnPush reduces change detection cycles for better mobile performance
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private tasksCollection: AngularFirestoreCollection<Task>;
  private categoriesCollection: AngularFirestoreCollection<Category>;

  tasks$!: Observable<Task[]>;
  categories$!: Observable<Category[]>;
  selectedCategory$ = new BehaviorSubject<string>('All');

  // Unified Form State for Creation and Editing [rite: image_71f0ec.png]
  newTaskName: string = '';
  newTaskCategory: string = '';
  editingTask: Task | null = null; // Holds the ID if we are editing a task

  // Category Form State
  newCategoryName: string = '';
  editingCategory: Category | null = null; // Holds the ID if we are editing a category

  // UI State [pite: image_71f0ec.png]
  isTaskModalOpen: boolean = false;
  showCategoryForm: boolean = false;

  // Feature Flags from Remote Config
  showDeleteButton: boolean = true;

  constructor(
    private afs: AngularFirestore,
    private remoteConfig: AngularFireRemoteConfig,
    private injector: Injector,
  ) {
    this.tasksCollection = this.afs.collection<Task>('tasks');
    this.categoriesCollection = this.afs.collection<Category>('categories');
    this.initObservables();
  }

  ngOnInit() {
    this.loadRemoteConfig();
  }

  /**
   * Initializes data streams using RxJS switchMap to dynamically filter by category.
   */
  private initObservables() {
    this.categories$ = this.categoriesCollection.valueChanges({
      idField: 'id',
    });

    this.tasks$ = this.selectedCategory$.pipe(
      switchMap((category) => {
        const categorySearch = category.toLowerCase();

        return runInInjectionContext(this.injector, () => {
          const query =
            category === 'All' || !category
              ? this.afs.collection<Task>('tasks', (ref) =>
                  ref.orderBy('createdAt', 'desc'),
                )
              : this.afs.collection<Task>('tasks', (ref) =>
                  ref
                    .where('category', '==', categorySearch)
                    .orderBy('createdAt', 'desc'),
                );

          return query.valueChanges({ idField: 'id' });
        });
      }),
      catchError((err) => {
        console.error('Stream Error:', err);
        return of([]);
      }),
    );
  }

  /**
   * Fetches Feature Flags from Firebase Remote Config.
   */
  private async loadRemoteConfig() {
    try {
      await this.remoteConfig.fetchAndActivate();
      this.showDeleteButton =
        await this.remoteConfig.getBoolean('show_delete_button');
    } catch (err) {
      this.showDeleteButton = true; // Fallback for production safety
    }
  }

  // --- UI LOGIC ---

  setTaskModalOpen(isOpen: boolean) {
    this.isTaskModalOpen = isOpen;
    // Clear form and editing state when closing [prite: image_71f0ec.png]
    if (!isOpen) {
      this.newTaskName = '';
      this.newTaskCategory = '';
      this.editingTask = null;
    }
  }

  // --- TASK BUSINESS LOGIC ACTIONS (CREATE & EDIT) ---

  /**
   * Handles both task creation and editing based on the 'editingTask' state [pite: image_71f0ec.png].
   */
  async handleTaskSubmit() {
    if (!this.newTaskName.trim() || !this.newTaskCategory) return;
    const nameLower = this.newTaskName.trim();
    const categoryLower = this.newTaskCategory.toLowerCase();

    if (this.editingTask) {
      // Logic for UPDATING a task
      await runInInjectionContext(this.injector, () =>
        this.tasksCollection.doc(this.editingTask!.id).update({
          name: nameLower,
          category: categoryLower,
        }),
      );
      this.editingTask = null; // Clear state after success
    } else {
      // Logic for CREATING a task
      await this.tasksCollection.add({
        name: nameLower,
        category: categoryLower,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    this.setTaskModalOpen(false); // Close modal and clear form
  }

  /**
   * Fills the modal with task data to prepare for editing [pite: image_71f0ec.png].
   */
  startEditTask(task: Task) {
    this.editingTask = task;
    this.newTaskName = task.name;
    this.newTaskCategory = task.category;
    this.setTaskModalOpen(true);
  }

  async deleteTask(id: string) {
    runInInjectionContext(this.injector, () =>
      this.tasksCollection.doc(id).delete(),
    );
  }

  async toggleTask(task: Task) {
    runInInjectionContext(this.injector, () =>
      this.tasksCollection.doc(task.id).update({ completed: !task.completed }),
    );
  }

  // --- CATEGORY BUSINESS LOGIC ACTIONS (CREATE, EDIT, DELETE) ---

  /**
   * Handles both category creation and editing based on the 'editingCategory' state [vite: image_71f0ca.png, image_71f0ec.png].
   */
  async handleCategorySubmit() {
    if (!this.newCategoryName.trim()) return;
    const nameLower = this.newCategoryName.trim().toLowerCase();

    if (this.editingCategory) {
      // Logic for UPDATING a category
      await runInInjectionContext(this.injector, () =>
        this.categoriesCollection
          .doc(this.editingCategory!.id)
          .update({ name: nameLower }),
      );
      this.editingCategory = null;
    } else {
      // Logic for CREATING a category
      await this.categoriesCollection.add({ name: nameLower });
    }
    this.newCategoryName = '';
    this.showCategoryForm = false; // Hide form after success
  }

  /**
   * Prepares the category form for editing [vite: image_71f0ca.png, image_71f0ec.png].
   */
  startEditCategory(category: Category) {
    this.editingCategory = category;
    this.newCategoryName = category.name;
    this.showCategoryForm = true;
  }

  async deleteCategory(id: string, name: string) {
    try {
      await runInInjectionContext(this.injector, () =>
        this.categoriesCollection.doc(id).delete(),
      );
      if (this.selectedCategory$.value === name)
        this.selectedCategory$.next('All');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  filterTasks(event: any) {
    this.selectedCategory$.next(event.detail.value);
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }
}
