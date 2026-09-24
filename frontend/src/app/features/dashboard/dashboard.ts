import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { extractApiErrorMessage } from '../../core/http/api-error';
import { TodoItem, TodoService } from './todo.service';

// Sample authenticated page — proves the full slice works: JWT attached
// automatically by the interceptor, hits the sample TodoItems feature on the API.
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly todos = inject(TodoService);

  readonly items = signal<TodoItem[]>([]);
  readonly error = signal<string | null>(null);
  title = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.todos.list().subscribe({
      next: (items) => this.items.set(items),
      error: (err) => this.error.set(extractApiErrorMessage(err, 'Failed to load.')),
    });
  }

  addItem(): void {
    const title = this.title.trim();
    if (!title) return;

    this.todos.create(title).subscribe({
      next: () => {
        this.title = '';
        this.load();
      },
      error: (err) => this.error.set(extractApiErrorMessage(err, 'Failed to add item.')),
    });
  }

  toggleDone(item: TodoItem): void {
    this.todos.setDone(item.id, !item.isDone).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(extractApiErrorMessage(err, 'Failed to update item.')),
    });
  }

  remove(id: string): void {
    this.todos.remove(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(extractApiErrorMessage(err, 'Failed to remove item.')),
    });
  }
}
