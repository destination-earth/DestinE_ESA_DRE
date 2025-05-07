using System;

namespace Interfaces;

public interface ILoggedUser
{
    public Guid UserId { get;  }
    public string Name { get; }
    public string Role { get; }
    public string Email { get; }
    public Guid? CustomerId { get; }
    
    public Guid? ImpersonatedCustomerId { get; }
    public bool IsAdministrator();
    
    
}