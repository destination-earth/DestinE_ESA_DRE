using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;

namespace WebApiData.Services
{

    public class PlantService: IPlantService
    {
        private readonly DataContext _context;

        public PlantService(DataContext context)
        {
            _context = context;
        }


        public SettingsUI Initialize(Guid userId)
        {
            SettingsUI settingsUI = new SettingsUI();

            DropList kinigos = new DropList
            {
                Value = "Kinigos",
                Type = "wind",
                Key = "001"
            };

            DropList mesinia = new DropList
            {
                Value = "Solar",
                Type = "solar",
                Key = "002"
            };

            settingsUI.MainSites = [kinigos, mesinia];
            settingsUI.UserType = "testUser";
            settingsUI.LastLogin = DateTime.Now.ToString();
            settingsUI.UserName = "the username";
           // settingsUI.Menu = MenuExample.GetSampleMenu();

            return settingsUI;
        }





        private class MenuExample
        {
            public static List<MenuItem> GetSampleMenu()
            {
                return new List<MenuItem>
            {
                new MenuItem
                {
                    Id = 1,
                    Name = "Solar",
                    Url = "/solar",
                    Icon = "solar-icon",

                    Children = []
                },

                new MenuItem
                {
                    Id = 2,
                    Name = "Wind",
                    Url = "/wind",
                    Icon = "wind-icon",

                    Children = []
                },

                new MenuItem
                {
                    Id = 3,
                    Name = "Hybrid",
                    Url = "/hybrid",
                    Icon = "hybrid-icon",

                    Children = []
                },

                new MenuItem
                {
                    Id = 4,
                    Name = "Plants",
                    Url = "/plants",
                    Icon = "plants-icon",

                    Children = new List<MenuItem>
                    {
                        new MenuItem
                        {
                            Id = 41,
                            Name = "Plants",
                            Url = "/plants/manage",
                            Icon = "plantsmanage-icon"
                        },
                        new MenuItem
                        {
                            Id = 42,
                            Name = "Upload Data",
                            Url = "/plants/upload",
                            Icon = "uploaddata-icon"
                        }
                    }
                }
            };

            }
        }

    }
}
