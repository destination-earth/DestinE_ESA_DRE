using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DataServices.Models;

public record TokenCodeDto
{
    public string Code { get; set; } = null!;
    public string URL { get; set; } = null!;
}

public record TokenRefreshDto
{
   
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public string URL { get; set; } = null!;
}

public class DespKeyCloakTokenResponse
{

    [ JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = null!;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; } = 0!;

    [JsonPropertyName("refresh_expires_in")]
    public int RefreshExpiresIn { get; set; } = 0!;

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = null!;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = null!;

    [JsonPropertyName("not-before-policy")]
    public int NotBeforePolicy { get; set; } = 0!;

    [JsonPropertyName("session_state")]
    public string SessionState { get; set; } = null!;

    [JsonPropertyName("scope")]
    public string Scope { get; set; } = null!;
}
 