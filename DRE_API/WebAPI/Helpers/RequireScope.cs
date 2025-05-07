using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;

namespace WebApi.Helpers;

public class RequireScope : IAuthorizationRequirement
{
    public RequireScope(params string[] scopes)
    {
        Scopes = scopes.ToList() ?? new List<string>();
    }

    public IList<string> Scopes { get; }
}