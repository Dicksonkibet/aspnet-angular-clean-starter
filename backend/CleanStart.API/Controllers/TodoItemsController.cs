using CleanStart.Application.TodoItems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanStart.API.Controllers;

/// <summary>Sample controller — thin by design. Every method is one line: call the
/// application service, return the result. Business logic lives entirely in
/// CleanStart.Application/TodoItems/TodoItemService.cs. No mediator in between —
/// the service is just injected via the constructor like anything else.</summary>
[ApiController]
[Route("api/todo-items")]
[Authorize]
public class TodoItemsController : ControllerBase
{
    private readonly ITodoItemService _todoItems;
    public TodoItemsController(ITodoItemService todoItems) => _todoItems = todoItems;

    [HttpGet]
    public async Task<ActionResult<List<TodoItemDto>>> GetAll(CancellationToken ct) =>
        Ok(await _todoItems.GetAllAsync(ct));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTodoItemRequest request, CancellationToken ct) =>
        Ok(await _todoItems.CreateAsync(request, ct));

    [HttpPatch("{id:guid}/done")]
    public async Task<IActionResult> SetDone(Guid id, [FromBody] bool isDone, CancellationToken ct)
    {
        await _todoItems.SetDoneAsync(id, isDone, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _todoItems.DeleteAsync(id, ct);
        return NoContent();
    }
}
