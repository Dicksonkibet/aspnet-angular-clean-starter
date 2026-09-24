namespace CleanStart.Application.TodoItems;

/// <summary>
/// Application-layer contract for the TodoItems feature. Controllers depend on this
/// interface, never on the concrete service — keeps the API layer decoupled from how
/// the use case is actually implemented.
/// </summary>
public interface ITodoItemService
{
    Task<List<TodoItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<Guid> CreateAsync(CreateTodoItemRequest request, CancellationToken ct = default);
    Task SetDoneAsync(Guid id, bool isDone, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
