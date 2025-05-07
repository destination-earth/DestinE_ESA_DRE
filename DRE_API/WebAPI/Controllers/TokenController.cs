using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using WebApi.Controllers;
using DataServices.Models;
using Interfaces;
using YamlDotNet.Core.Tokens;
using System.Diagnostics;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;

namespace RestApi.Controllers;
public class TokenController : BaseController<TokenController>
{
    private readonly IDESPKeyCloakService _keyCloakService;
    private IConfiguration _configuration { get; }

    private   IAntiforgery _antiforgery { get; }

    public TokenController(IServiceProvider serviceProvider, IConfiguration configuration) : base(serviceProvider)
    {
        //, IAntiforgery antiforgery
        _keyCloakService = serviceProvider.GetRequiredService<IDESPKeyCloakService>();
        _configuration = configuration;
       // _antiforgery = antiforgery;
    }

    //[Authorize]
    //[HttpGet("antiforgery")]
    //public IActionResult GetAntiForegeryToken()
    //{
    //    var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

    //    Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!,
    //        new CookieOptions
    //        {
    //            HttpOnly = false,
    //            Secure = true,
    //            SameSite = SameSiteMode.Strict
    //        });

    //    return NoContent();
    //}


    [HttpPost("GetToken")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(TokenCodeDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetToken([FromBody] TokenCodeDto code)
    {
        var despKeyCloakSettings = PopulateDespSettings();
        var item = await _keyCloakService.GetTokenResponse(despKeyCloakSettings, code)!;
        if (item.AccessToken == null)
        {
            var errorResponse = new
            {
                Message = item.RefreshToken,
                ItemId = 0,
                Timestamp = DateTime.UtcNow
            };

            Debug.Print("error:" + item.RefreshToken);

          return Ok(errorResponse);
        }

        Debug.Print("Normal:" + item.RefreshToken);
        return Ok(item);
    }


    [HttpPost("RefreshToken")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(TokenCodeDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshToken([FromBody] TokenRefreshDto code)
    {
        var despKeyCloakSettings = PopulateDespSettings();
        var item = await _keyCloakService.GetRefreshTokenResponse(despKeyCloakSettings, code)!;
        if (item.AccessToken == null)
        {
            var errorResponse = new
            {
                Message = item.RefreshToken,
                ItemId = 0,
                Timestamp = DateTime.UtcNow
            };
             return Ok(errorResponse);
        }
        return Ok(item);
    }



    [HttpGet("settings")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(TokenCodeDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings()
    {
        var despKeyCloakSettings = PopulateDespSettings();
        
        return Ok(despKeyCloakSettings);
    }


    private DespKeyCloakSettings PopulateDespSettings()
    {

        DespKeyCloakSettings despKeyCloakSettings = new DespKeyCloakSettings();
        despKeyCloakSettings.ClientSecret = _configuration.GetSection("KEYCLOAK_clientSecret").Value!;
        despKeyCloakSettings.ClientId = _configuration.GetSection("KEYCLOAK_clientId").Value!;
        despKeyCloakSettings.Realm = _configuration.GetSection("KEYCLOAK_realm").Value!;
        despKeyCloakSettings.RealmURL = _configuration.GetSection("KEYCLOAK_realmURL").Value!;
        despKeyCloakSettings.RealmProtocol = _configuration.GetSection("KEYCLOAK_realmProtocol").Value!;
        despKeyCloakSettings.RealmAuth = _configuration.GetSection("KEYCLOAK_realmAuth").Value!;
        despKeyCloakSettings.RealmToken = _configuration.GetSection("KEYCLOAK_realmToken").Value!;
        //despKeyCloakSettings.RedirectUri = "http://localhost:4000/callback.html";
        despKeyCloakSettings.RedirectUri = _configuration.GetSection("KEYCLOAK_redirect").Value!;
    
        return despKeyCloakSettings;
    }

}