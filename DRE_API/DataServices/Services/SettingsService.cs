using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;

namespace WebApiData.Services
{

    public class SettingsService: ISettingsService
    {
        private readonly DataContext _context;

        public SettingsService(DataContext context)
        {
            _context = context;
        }


        public SettingsUI Initialize(Guid userId,string userEmail)
        {
            SettingsUI settingsUI = new SettingsUI();

            DropList kinigos = new DropList
            {
                Value = "Kinigos",
                Type = "wind",
                Key = "W001"
            };

            DropList mesinia = new DropList
            {
                Value = "Solar",
                Type = "solar",
                Key = "S001"
            };

            settingsUI.MainSites = [kinigos, mesinia];
            settingsUI.UserType = "testUser";
            settingsUI.LastLogin = DateTime.Now.ToString();
            settingsUI.UserName = userEmail;
            settingsUI.Menu = MenuExample.GetSampleMenu();

            return settingsUI;
        }





        private class MenuExample
        {
            public static List<MenuItemUI> GetSampleMenu()
            {
                var whatif = new MenuItemUI
                {
                    Id = 1,
                    Name = "Solar Demo",
                    Type = "solarDemo",
                    Icon = "solar-icon-menu",
                    Children = []
                };

                var overview = new MenuItemUI
                {
                    Id = 1031,
                    Name = "Overview V1",
                    Type = "jobs",
                    Icon = "gear-icon",
                    Children = []
                };




                var solar = new MenuItemUI
                {
                    Id = 2,
                    Name = "Solar What If",
                    Type = "solarDemoWhatIf",
                    Icon = "solar-icon-menu",
                    Children = []
                };

                var kpis = new MenuItemUI
                {
                    Id = 10,
                    Name = "Overview",
                    Type = "overview",
                    Icon = "kpi-icon",
                    Children = []
                };

                //var overview = new MenuItemUI
                //{
                //    Id = 10,
                //    Name = "Overview",
                //    Type = "overview",
                //    Icon = "globe",
                //    Children = [kpis, jobs]
                //};


                var assesment = new MenuItemUI
                {
                    Id = 1101,
                    Name = "Assessment",
                    Type = "assessment",
                    Icon = "check",
                    Children = []
                };
  



                var forecast = new MenuItemUI
                {
                    Id = 1102,
                    Name = "Forecast",
                    Type = "forecast",
                    Icon = "chart-icon",
                    Children = []
                };

                var pricing = new MenuItemUI
                {
                    Id = 41,
                    Name = "Plans",
                    Type = "pricing",
                    Icon = "money",
                    Children = []
                };

                var faq = new MenuItemUI
                {
                    Id = 42,
                    Name = "FAQs",
                    Type = "faq",
                    Icon = "question",
                    Children = []
                };

                var documentation = new MenuItemUI
                {
                    Id = 43,
                    Name = "Documentation",
                    Type = "documentation",
                    Icon = "book",
                    Children = []
                };



                var rr4 = new MenuItemUI
                {
                    Id = 44,
                    Name = "Use Case Demo",
                    Type = "documentation",
                    Icon = "solar-icon-if",
                    Children = []
                };

                var dashboards = new MenuItemUI
                {
                    Id = 0,
                    Name = "Dashboards",
                    Type = "",
                    Icon = "dashboard",

                    Children = [kpis, assesment, forecast]
                };

                var solars = new MenuItemUI
                {
                    Id = 100,
                    Name = "Solar Demos",
                    Type = "",
                    Icon = "solar-icon-menu",

                    Children = [solar, whatif]
                };

                var winds = new MenuItemUI
                {
                    Id = 102,
                    Name = "Wind Demo",
                    Type = "wind",
                    Icon = "wind-icon",

                    Children = []
                };
                var hybrids = new MenuItemUI
                {
                    Id = 103,
                    Name = "Hybrid Demo",
                    Type = "hybrid",
                    Icon = "hybrid-icon",

                    Children = []
                };

                //var profile = new MenuItemUI
                //{
                //    Id = 103,
                //    Name = "Profile",
                //    Type = "profile",
                //    Icon = "profile-icon",

                //    Children = []
                //};


                var pages = new MenuItemUI
                {
                    Id =1044,
                    Name = "Pages",
                    Type = "",
                    Icon = "solar-icon-menu",

                    Children = [ faq, pricing, documentation] //pricing,
                };

                return new List<MenuItemUI>
                {

                    new MenuItemUI
                    {
                        Id = 1000,
                        Name = "Use Case Demo",
                        Type = "",
                        Icon = "solar-icon-menu",
                        Children = [solars,winds,hybrids]
                    },
                    new MenuItemUI
                    {
                        Id = 1010,
                        Name = "RR5",
                        Type = "",
                        Icon = "solar-icon-menu",
                        Children = [dashboards, pages]
                    },



                };



                /*                ,new MenuItem
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
                                }*/


            }
        }

    }
}
/*
 * 
 

                return new List<MenuItemUI>
                {
                new MenuItemUI
                {
                    Id = 0,
                    Name = "Dashboards",
                    Type = "",
                    Icon = "dashboard",

                    Children = [overview, assesment, forecast]
                },


                new MenuItemUI
                {
                    Id = 1,
                    Name = "Solar",
                    Type = "",
                    Icon = "solar-icon-menu",

                    Children = [solar,whatif]
                },

                new MenuItemUI
                {
                    Id = 2,
                    Name = "Wind",
                    Type = "wind",
                    Icon = "wind-icon",

                    Children = []
                },

                new MenuItemUI
                {
                    Id = 3,
                    Name = "Hybrid",
                    Type = "hybrid",
                    Icon = "hybrid-icon",

                    Children = []
                },


                 new MenuItemUI
                {
                    Id = 4,
                    Name = "Pages",
                    Type = "",
                    Icon = "solar-icon-menu",

                    Children = [pricing, faq, documentation]
                },  
                };



 * */