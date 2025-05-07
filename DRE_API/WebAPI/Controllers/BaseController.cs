using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Helpers;
using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Interfaces;

namespace WebApi.Controllers;

[Consumes("application/json")]
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[Route("api/[controller]")]
[ApiController]
public class BaseController<T>(IServiceProvider serviceProvider) : ControllerBase
    where T : ControllerBase
{
    protected readonly IServiceProvider ServiceProvider = serviceProvider;
    protected readonly ILogger<T> Logger = serviceProvider.GetRequiredService<ILogger<T>>();
    protected readonly ILoggedUser? LoggedUser = serviceProvider.GetService<ILoggedUser>();



    protected async Task<IActionResult> ProcessCreatedResult<TId, TModel>(
        Func<Task<IResult<TId, ServiceError>>> createCommand,
        Func<TId, Task<IResult<TModel, ServiceError>>> query,
        string nameOfAction,
        Func<TModel, object> routeValue)
    {
        var createdResult = await createCommand.Invoke();
        if (createdResult.IsFailure) return ProcessResult(createdResult);
        var queryResult = await query.Invoke(createdResult.Value);
        if (queryResult.IsFailure) return ProcessResult(createdResult);
        return CreatedAtAction(nameOfAction,
            routeValue.Invoke(queryResult.Value),
            queryResult.Value);
    }
    protected async Task<IActionResult> ProcessUpdateResult<TModel>(
        Func<Task<IResult<bool, ServiceError>>> createUpdateCommand,
        Func<Task<IResult<TModel, ServiceError>>> query,
        string nameOfAction,
        Func<TModel, object> routeValue)
    {
        var createdResult = await createUpdateCommand.Invoke();
        if (createdResult.IsFailure) return ProcessResult(createdResult);
        if (!createdResult.Value) return NoContent();
        var queryResult = await query.Invoke();
        if (queryResult.IsFailure) return ProcessResult(createdResult);
        return CreatedAtAction(nameOfAction,
            routeValue.Invoke(queryResult.Value),
        queryResult.Value);
    }

    protected IActionResult ProcessResult<TResult>(IResult<TResult, ServiceError> result)
    {
        return StatusCode((int)result.Error.ErrorCode, result.Error.ErrorObject ?? result.Error.Message);
    }

    protected async Task<IActionResult> ProcessNoContent(
        Func<Task<IResult<bool, ServiceError>>> deleteCommand
    )
    {
        var result = await deleteCommand.Invoke();
        if (result.IsFailure) return ProcessResult(result);
        return NoContent();
    }
}