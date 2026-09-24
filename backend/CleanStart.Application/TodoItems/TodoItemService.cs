using CleanStart.Application.Common.Interfaces;
using CleanStart.Domain.Entities;
using FluentValidation;

namespace CleanStart.Application.TodoItems;

/// <summary>
/// Plain application service — no MediatR. Controllers call this directly. Each
/// public method is one use case (what used to be a separate Command/Query +
/// Handler pair); validation happens inline via the injected validator, the same
/// way CleanStart.API/Controllers/AuthController.cs already validates its requests.
/// </summary>
public class TodoItemService : ITodoItemService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<CreateTodoItemRequest> _createValidator;

    public TodoItemService(IUnitOfWork uow, IValidator<CreateTodoItemRequest> createValidator)
    {
        _uow = uow;
        _createValidator = createValidator;
    }

    public async Task<List<TodoItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var items = await _uow.Repository<TodoItem>().ListAsync(ct: ct);
        return items
            .Where(i => !i.IsDeleted)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new TodoItemDto { Id = i.Id, Title = i.Title, IsDone = i.IsDone })
            .ToList();
    }

    public async Task<Guid> CreateAsync(CreateTodoItemRequest request, CancellationToken ct = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);

        var item = new TodoItem { Title = request.Title };
        await _uow.Repository<TodoItem>().AddAsync(item, ct);
        await _uow.SaveChangesAsync(ct);
        return item.Id;
    }

    public async Task SetDoneAsync(Guid id, bool isDone, CancellationToken ct = default)
    {
        var repo = _uow.Repository<TodoItem>();
        var item = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Todo item not found.");

        item.IsDone = isDone;
        repo.Update(item);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var repo = _uow.Repository<TodoItem>();
        var item = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Todo item not found.");

        repo.Remove(item);
        await _uow.SaveChangesAsync(ct);
    }
}
