using DataServices.Models;
using System;
using System.Collections.Generic;
using WebApiData.Entities;

namespace Interfaces
{
    public interface ISettingsService
    {
        SettingsUI Initialize(Guid userId,string userEmail);
    }
}
