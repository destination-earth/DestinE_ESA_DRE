using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DataServices.Models;
 
public record DespKeyCloakSettings
{

    public string ClientSecret { get; set; } = null!;
    public string ClientId { get; set; } = null!;
    public string Realm { get; set; } = null!;
    public string RealmURL { get; set; } = null!;
    public string RealmProtocol { get; set; } = null!;
    public string RealmAuth { get; set; } = null!;
    public string RealmToken { get; set; } = null!;
    public string RedirectUri { get; set; } = null!;

}

public record SettingsUI
{
    public List<DropList> MainSites { get; set; } = null!;

    public List<MenuItemUI> Menu { get; set; } = null!;
    public string UserType { get; set; } = null!;
    public string LastLogin { get; set; } = null!;
    public string UserName { get; set; } = null!;
}

public record DropList
{
    public string Value { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string Type { get; set; } = null!;
}


public record MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public string Icon { get; set; }
    public List<MenuItem> Children { get; set; } = new List<MenuItem>();

}

public record MenuItemUI
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Icon { get; set; }
    public List<MenuItemUI> Children { get; set; } = new List<MenuItemUI>();

}


public record EndpointSetting
{
    public int Id { get; set; }
    public string Url { get; set; }
    public string Icon { get; set; }
   

}


public class GenericActionResult
{

    public string Message { get; set; } 
    public bool HasError { get; set; }
    public int HttpStatus { get; set; }
}