using Microsoft.AspNetCore.Authorization;
using OpenIddict.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Helpers
{
    //public class RequireScopeHandler : AuthorizationHandler<RequireScope>
    //{

    //    protected override Task HandleRequirementAsync(
    //        AuthorizationHandlerContext context, RequireScope requirement)
    //    {
    //        if (context == null)
    //            throw new ArgumentNullException(nameof(context));
    //        if (requirement == null)
    //            throw new ArgumentNullException(nameof(requirement));
    //        if (!requirement.Scopes.Any())
    //        {
    //            context.Succeed(requirement);
    //            return Task.CompletedTask;
    //        }

    //        var scopeClaims = context.User.Claims.FirstOrDefault(t => t.Type == "scope")?.Value.Split(' ').ToList();


    //        if (scopeClaims != null && requirement.Scopes.All(x => context.User.HasScope(x) ||
    //                scopeClaims.Any(sc => sc.Equals(x, StringComparison.InvariantCultureIgnoreCase))))
    //        {
    //            context.Succeed(requirement);
    //        }

    //        return Task.CompletedTask;
    //    }
    //}

    public class RequireScopeHandler : AuthorizationHandler<RequireScope>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context, RequireScope requirement)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));
            if (requirement == null)
                throw new ArgumentNullException(nameof(requirement));

            if (!requirement.Scopes.Any())
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Extract space-separated scopes
            var scopeClaim = context.User.Claims.FirstOrDefault(c => c.Type == "scope")?.Value;
            var scopeList = scopeClaim?.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                                       .ToList() ?? new List<string>();

            // Validate required scopes
            var hasAllRequiredScopes = requirement.Scopes.All(requiredScope =>
                scopeList.Any(userScope => string.Equals(userScope, requiredScope, StringComparison.OrdinalIgnoreCase)));

            if (hasAllRequiredScopes)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }

}