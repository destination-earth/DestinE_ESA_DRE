using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Interfaces;
using System.Net.Http.Headers;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using DataServices.Models;
using DataServices.Interfaces;
using WebApiData.Helpers;

namespace WebApiData.Services;

public class DESPKeyCloakService: IDESPKeyCloakService
{

    private readonly DataContext _context;

    protected readonly ILogger _logger;


    public DESPKeyCloakService(DataContext context, ILogger<DESPKeyCloakService> logger)
    {
        _context = context;
        _logger = logger;
    }


    public async Task<DespKeyCloakTokenResponse> GetTokenResponse(DespKeyCloakSettings despKeyCloakSettings, TokenCodeDto code, CancellationToken cancellationToken = default)
    {
        DespKeyCloakTokenResponse keyCloakTokenResponse = new DespKeyCloakTokenResponse();

        HttpClient client = new HttpClient();

        client.DefaultRequestHeaders.Accept.Clear();
        //client.DefaultRequestHeaders.Add("Content-Type", "application/x-www-form-urlencoded");
        client.DefaultRequestHeaders.Accept.Add(
          new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));
   

       string clientid = despKeyCloakSettings.ClientId;
       string forToken = despKeyCloakSettings.RealmToken;
       string clientSecret = despKeyCloakSettings.ClientSecret;
       string redirectUri = despKeyCloakSettings.RedirectUri;

        var requestData = new Dictionary<string, string>();
        requestData["grant_type"] = "authorization_code";
        requestData["client_id"] = clientid;
        requestData["client_secret"] = clientSecret;
       // requestData["redirect_uri"] = code.URL;
       //I don't have the URL from the IaM Response
        requestData["redirect_uri"] = redirectUri;

        requestData["code"] = code.Code;

        if (code.Code==null )
        {
            keyCloakTokenResponse.AccessToken = null;
            keyCloakTokenResponse.RefreshToken = "null_code";
            return keyCloakTokenResponse;
        }


        try
        {
            var response = await client.PostAsync(new Uri(forToken), new FormUrlEncodedContent(requestData));
            var responseString = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                keyCloakTokenResponse = JsonSerializer.Deserialize<DespKeyCloakTokenResponse>(responseString)!;                
            }
            else
            {
                keyCloakTokenResponse.AccessToken = null;
                keyCloakTokenResponse.RefreshToken = responseString;
                return keyCloakTokenResponse;

            }
        }
        catch (Exception ex)
        {
            keyCloakTokenResponse.AccessToken= null;
            keyCloakTokenResponse.RefreshToken = ex.Message.ToString() + ".";
            return keyCloakTokenResponse;


        }


        return keyCloakTokenResponse;
    }


    public async Task<DespKeyCloakTokenResponse> GetRefreshTokenResponse(DespKeyCloakSettings despKeyCloakSettings, TokenRefreshDto code, CancellationToken cancellationToken = default)
    {
        DespKeyCloakTokenResponse keyCloakTokenResponse = new DespKeyCloakTokenResponse();
        HttpClient client = new HttpClient();
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Accept.Add(
          new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));

        var requestData = new Dictionary<string, string>();
        requestData["grant_type"] = "refresh_token";
        requestData["client_id"] = despKeyCloakSettings.ClientId;
        requestData["refresh_token"] = code.RefreshToken;
        requestData["client_secret"] = despKeyCloakSettings.ClientSecret;
        

        try
        {
            var response = await client.PostAsync(new Uri(despKeyCloakSettings.RealmToken), new FormUrlEncodedContent(requestData));
            var responseString = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                keyCloakTokenResponse = JsonSerializer.Deserialize<DespKeyCloakTokenResponse>(responseString)!;
            }
            else
            {
                keyCloakTokenResponse.AccessToken = null;
                keyCloakTokenResponse.RefreshToken = null;
                return keyCloakTokenResponse;

            }

        }
        catch (Exception ex)
        {
            keyCloakTokenResponse.AccessToken = null;
            keyCloakTokenResponse.RefreshToken = ex.Message.ToString() + ".";
            return keyCloakTokenResponse;
        }
        return keyCloakTokenResponse;
    }
}