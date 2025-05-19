The UI is based on 3 projects:

The DataServices, this is used to handle all DB related interactions.
The WebAPI, it manages the web api calls, it requires IAM intergration.
The react - > the GUI.



The application uses a PostgreSQL and to setup you need to delete migrations and DataContextModelSnapshot
Then run dotnet ef migrations add RecreateSnapshot --force this will re-create the snapshot and then 
you can run Add-Migration InitialSnapshot and then update the db. 
The user is not hanlded by the application, hence no user relation entity exists.

The main tables that are used in the application are the followin:

Jobs			Holds the jobs requested by the user - each job is a assessment or forecast request, the request data and
				response data are stored in this table. The JSON request is stored as text field.

JobResponses	Each job can have 1 or more responses. Each response contains the JSON file to visualize (graphs, tables,
				charts). 

JobFiles		This contains records of the files that the user can download. Some jobs may generate files that  can't be
				visualized, (e.g. result data in CSV, most times quite large)


DailyJobs		This is an optional table. If a developer wants to track (needs external appplication to call daily for 
				forecast or assessment), this table is used to log requests and responses. It has a debbuging usage.


Demodata		This is	an optional table. It can keep demo data for UI (like the data found in the about)






Secrets.
The following secrets are needed to run the application. The UI uses IAM open id. 
You neeed to setup and use the relevant urls.

dotnet user-secrets init 
dotnet user-secrets set  "KEYCLOAK_clientSecret" "zLdsrrewIWme9doktKYX"
dotnet user-secrets set  "KEYCLOAK_clientId" "my-bearer"
dotnet user-secrets set  "KEYCLOAK_realm" "desp"
dotnet user-secrets set  "KEYCLOAK_realmURL" "#/realms/desp"
dotnet user-secrets set  "KEYCLOAK_realmProtocol" "#/realms/desp/protocol"
dotnet user-secrets set  "KEYCLOAK_realmAuth" "#/protocol/openid-connect/auth"
dotnet user-secrets set  "KEYCLOAK_realmToken" "#realms/desp/protocol/openid-connect/token"

dotnet user-secrets set  "KEYCLOAK_redirect" "##/callback.html
dotnet user-secrets set  "HYREFAPP_logpath" "/data/logs/"
dotnet user-secrets set  "KEYCLOAK_jobtoken" "916ab7c8-ac91b02090b8"
dotnet user-secrets set  "KEYCLOAK_healthtoken" "zF4NrePTUlLMnVnPT0K"

dotnet user-secrets set  "dbConnection" "Database=tsdb; Username=tsdbadmin; Password=xxxx; host=localhost; Port=5432; sslmode=disable;"

dotnet user-secrets set  "NoaBaseUrl" "#/solarcore/";
dotnet user-secrets set  "NoaInferenceUrl" "#/solar-forecast/";
dotnet user-secrets set  "WeMetBasicAssessementUrl" "#/assessment/basic";
dotnet user-secrets set  "WeMetPremiumAssessementUrl" "#/assessment/premium";
dotnet user-secrets set  "WeMetBasicForecastUrl" "#/wind/forecast";
dotnet user-secrets set  "WeMetPremiumForecastUrl" "#/wind/forecast";
dotnet user-secrets set  "SolarUploadAssessment" "/dredata/solar/assessment/uploaded/";
dotnet user-secrets set  "SolarUploadForecast" "/dredata/solar/uploaded/";
dotnet user-secrets set  "SolarUploadForecastStored" "/app/data/";
dotnet user-secrets set  "WindUploadAssessment" "/dredata/wind/assessment/uploaded/";
dotnet user-secrets set  "WindUploadForecast" "/dredata/wind/forecast/uploaded/";
dotnet user-secrets set  "SolarModelOutputPath" "./models/";
dotnet user-secrets set  "NoaSolarValidate" "#/solarcore/validate-csv/";
dotnet user-secrets set  "NoaSolarAssessmentBasicUrl" "#/solar-basic-assessment-service/";
dotnet user-secrets set  "NoaSolarAssessmentPremiumUrl" "#/solar-assessment-premium-service";
dotnet user-secrets set  "NoaSolarForecastOnlyParkSpecs" "#/solar-forecast-one-off-service-park-specifications";
dotnet user-secrets set  "FileDownloadUrl" "#/jobs/filedownload"

There are required to allow to download files, since no tocken is used:

dotnet user-secrets set  "FileDownloadKey" "12345678901234567890123456789012"
dotnet user-secrets set  "FileDownloadIV" "1234567890123456"
