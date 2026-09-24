using System.Reflection;
using CleanStart.Application.TodoItems;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CleanStart.Application;

/// <summary>
/// Registers every application service + FluentValidation validator in this assembly.
/// No mediator, no pipeline — controllers depend on plain service interfaces
/// (e.g. ITodoItemService) and call them directly. Add a new feature folder with its
/// own I{Feature}Service, register it below, and go.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddValidatorsFromAssembly(assembly);

        services.AddScoped<ITodoItemService, TodoItemService>();

        return services;
    }
}
