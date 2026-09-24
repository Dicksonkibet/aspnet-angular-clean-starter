using FluentValidation;

namespace CleanStart.Application.TodoItems;

// Vertical-slice sample feature: every concern for "TodoItems" (DTOs, validators,
// service contract + implementation) lives in this feature folder. This is the
// pattern to copy for each real feature you build — new folder, same shape.

public class TodoItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public bool IsDone { get; set; }
}

public record CreateTodoItemRequest(string Title);

public class CreateTodoItemRequestValidator : AbstractValidator<CreateTodoItemRequest>
{
    public CreateTodoItemRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
}
