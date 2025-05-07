using DataServices.Models;
using System;
using System.Collections.Generic;
using System.Net;
using WebApiData.Entities;

namespace Interfaces
{
    public interface IPlantService
    {
        SettingsUI Initialize(Guid userId); //ToDo: Delete this.
       
        //string PlantSettings(int plantId);
        //List<string> Plants(Guid userId);

        //void CreatePlant(string settings);
        //void UpdatePlant(string settings);
        //void CreateHybridPlant(string selections);


    }
}
