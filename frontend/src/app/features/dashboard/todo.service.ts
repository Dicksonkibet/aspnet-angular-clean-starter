import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TodoItem {
  id: string;
  title: string;
  isDone: boolean;
}

/// Talks to CleanStart.API's TodoItemsController — the sample authenticated slice.
/// The JWT is attached automatically by the auth interceptor, so this service
/// doesn't need to know anything about auth at all.
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/todo-items`;

  list(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.baseUrl);
  }

  create(title: string): Observable<string> {
    return this.http.post<string>(this.baseUrl, { title });
  }

  setDone(id: string, isDone: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/done`, isDone);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
