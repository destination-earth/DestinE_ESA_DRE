using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OpenIddict.Abstractions;
using Interfaces;

namespace Aspnet.Helpers;

public class LoggedUser : ILoggedUser
{
    private readonly Guid? _impersonatedCustomerId;
    public LoggedUser(Guid userId, string email, string name, string role, Guid? customerId,
        Guid? impersonatedCustomerId)
    {
        CustomerId = customerId;
        _impersonatedCustomerId = impersonatedCustomerId ?? customerId;
        Email = email;
        Name = name;
        UserId = userId;
        Role = role;
    }

    //public static ILoggedUser? Create(IHttpContextAccessor httpContextAccessor)
    //{
    //    if (httpContextAccessor.HttpContext?
    //            .User == null || !(httpContextAccessor?.HttpContext?.User.Identity?.IsAuthenticated ?? false))
    //        return null; //new LoggedUser(Guid.Parse("83ea906e-3e49-474e-8143-6aeb6aa8ab7e"),"admin@localhost","Admin","Administrator",null,null);
    //    var user = httpContextAccessor.HttpContext.User;
    //    Guid? customerId = null;
    //    if (httpContextAccessor.HttpContext.Request.RouteValues.Where(x =>
    //                x.Key.Equals(
    //                    "customerId",
    //                    StringComparison
    //                        .InvariantCultureIgnoreCase)).Select(x => x.Value).FirstOrDefault()
    //            is string str && !string.IsNullOrWhiteSpace(str) &&
    //        Guid.TryParse(str, out var extractedCustomerId))
    //    {
    //        customerId = extractedCustomerId;
    //    }

    //    return new LoggedUser(
    //            Guid.Parse(user.GetClaim(ClaimTypes.NameIdentifier)??user.GetClaim(OpenIddictConstants.Claims.Subject)!),
    //            user.GetClaim(ClaimTypes.Email)??user.GetClaim(OpenIddictConstants.Claims.Email)!,
    //            user.GetClaim(ClaimTypes.GivenName)??user.GetClaim(OpenIddictConstants.Claims.GivenName) ??
    //            user.GetClaim(ClaimTypes.Name) ?? user.GetClaim(ClaimTypes.Email)?? user.GetClaim(OpenIddictConstants.Claims.Name)?? user.GetClaim(OpenIddictConstants.Claims.Email)!,
    //            user.GetClaim(ClaimTypes.Role)??user.GetClaim(OpenIddictConstants.Claims.Role)??"norole",
    //            user.HasClaim("cid") ? Guid.Parse(user.GetClaim("cid")!) : null, customerId)
    //        ;
    //}

    public static ILoggedUser? Create(IHttpContextAccessor httpContextAccessor)
    {
        if (httpContextAccessor.HttpContext?.User == null || !(httpContextAccessor.HttpContext.User.Identity?.IsAuthenticated ?? false)) return null;

        var user = httpContextAccessor.HttpContext.User; Guid? customerId = null; if (httpContextAccessor.HttpContext.Request.RouteValues.Where(x => x.Key.Equals("customerId", StringComparison.InvariantCultureIgnoreCase)).Select(x => x.Value).FirstOrDefault() is string str && !string.IsNullOrWhiteSpace(str) && Guid.TryParse(str, out var extractedCustomerId)) { customerId = extractedCustomerId; }

        var email = user.GetClaim(ClaimTypes.Email) ?? user.GetClaim(OpenIddictConstants.Claims.Email) ?? user.GetClaim("preferred_username");

        return new LoggedUser(Guid.Parse(user.GetClaim(ClaimTypes.NameIdentifier) ?? user.GetClaim(OpenIddictConstants.Claims.Subject)!), email, user.GetClaim(ClaimTypes.GivenName) ?? user.GetClaim(OpenIddictConstants.Claims.GivenName) ?? user.GetClaim(ClaimTypes.Name) ?? email ?? user.GetClaim(OpenIddictConstants.Claims.Name) ?? email!, user.GetClaim(ClaimTypes.Role) ?? user.GetClaim(OpenIddictConstants.Claims.Role) ?? "norole", user.HasClaim("cid") ? Guid.Parse(user.GetClaim("cid")!) : null, customerId);
    }



    public Guid UserId { get; }
    public string Name { get; }
    public string Role { get; }
    public string Email { get; }
    public Guid? CustomerId { get; }


    public Guid? ImpersonatedCustomerId
    {
        get => IsAdministrator() ? _impersonatedCustomerId : CustomerId;
    }

    public bool IsAdministrator()
    {
        return Role.Equals("Administrator", StringComparison.InvariantCultureIgnoreCase);
    }
}