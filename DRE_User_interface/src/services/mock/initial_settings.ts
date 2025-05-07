export const SETTINGS = {
  "mainSites": [
    { "value": "Kinigos", "key": "W001", "type": "wind" },
    { "value": "Solar", "key": "S001", "type": "solar" }
  ],
  "menu": [
    {
      "id": 0,
      "name": "Dashboards",
      "type": "",
      "icon": "dashboard",
      "children": [
        { "id": 10, "name": "Overview", "type": "overview", "icon": "solar-icon-if", "children": [] },
        { "id": 11, "name": "Assessment", "type": "assessment", "icon": "solar-icon-if", "children": [] },
        { "id": 12, "name": "Forecast", "type": "forecast", "icon": "chart-icon", "children": [] }
      ]
    },
    {
      "id": 1,
      "name": "Solar",
      "type": "",
      "icon": "solar-icon-menu",
      "children": [
        { "id": 2, "name": "Solar What If", "type": "solarDemoWhatIf", "icon": "solar-icon-if", "children": [] },
        { "id": 3, "name": "Solar Demo", "type": "solarDemo", "icon": "solar-icon-demo", "children": [] }
      ]
    },
    {
      "id": 2,
      "name": "Wind",
      "type": "wind",
      "icon": "wind-icon",
      "children": []
    },
    {
      "id": 3,
      "name": "Hybrid",
      "type": "hybrid",
      "icon": "hybrid-icon",
      "children": []
    },
    {
      "id": 4,
      "name": "Pages",
      "type": "",
      "icon": "solar-icon-menu",
      "children": [
        {
          "id": 41,
          "name": "Pricing",
          "type": "pricing",
          "icon": "solar-icon-if",
          "children": [
            {
              "id": 411,
              "name": "Basic",
              "type": "basic",
              "icon": "basic-icon",
              "children": []
            },
            {
              "id": 412,
              "name": "Pro",
              "type": "pro",
              "icon": "pro-icon",
              "children": []
            }
          ]
        },
        { "id": 42, "name": "FAQs", "type": "faq", "icon": "solar-icon-if", "children": [] },
        { "id": 43, "name": "Documentation", "type": "documentation", "icon": "solar-icon-if", "children": [] }
      ]
    }
  ],
  "userType": "testUser",
  "lastLogin": "2/20/2025 11:38:26 PM",
  "userName": "the username"
}
;
