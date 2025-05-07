using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using Npgsql;
using System;
using System.Collections.Generic;
using WebApiData.Entities;
using JsonNet.ContractResolvers;
using Microsoft.EntityFrameworkCore.Design;
using System.Threading.Tasks;
using System.Threading;
using static Org.BouncyCastle.Math.EC.ECCurve;
using DataServices.Interfaces;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Diagnostics;


namespace WebApiData.Helpers
{
    public class DataContext : DbContext, IDesignTimeDbContextFactory<DataContext>, IDataContext
    {

        public virtual DbSet<PlantType> PlantType { get; set; }
        public virtual DbSet<Plant> Plant { get; set; }      
        public virtual DbSet<SolarEnergyProduction> SolarEnergyProduction { get; set; }
        public virtual DbSet<WindEnergyProduction> WindEnergyProduction { get; set; }
        public virtual DbSet<SolarEnergyPrediction> SolarEnergyPrediction { get; set; }
        public virtual DbSet<WindEnergyPrediction> WindEnergyPrediction { get; set; }
        public virtual DbSet<Endpoint> Endpoint { get; set; }
        public virtual DbSet<RetrievalLog> RetrievalLog { get; set; }
        public virtual DbSet<RetrievalMethodType> RetrievalMethodType { get; set; }
        public virtual DbSet<DataFormat> DataFormat { get; set; }
        public virtual DbSet<Predictions> Predictions { get; set; }
        public virtual DbSet<LiveMeasurements> LiveMeasurements { get; set; }
        public virtual DbSet<Sensor> Sensor { get; set; }
        public virtual DbSet<JobsDb> JobsDb { get; set; }

        public virtual DbSet<UploadedData> UploadedData { get; set; }

        public virtual DbSet<DniGhi> DniGhi { get; set; }
        public virtual DbSet<WindSpeedDist> WindSpeedDist { get; set; }
        public virtual DbSet<WindDirectional> WindDirectional { get; set; }
        public virtual DbSet<CVSLinks> CVSLinks { get; set; }

        public virtual DbSet<WindRose> WindRose { get; set; }

        public virtual DbSet<JobsResponses> JobsResponses { get; set; }

        public virtual DbSet<JobFiles> JobFiles { get; set; }

         public virtual DbSet<DemoData> DemoData { get; set; }
 
        



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SolarEnergyProduction>().HasKey(e => new { e.PlantId, e.DataTimeStamp });

            modelBuilder.Entity<WindEnergyProduction>().HasKey(e => new { e.PlantId, e.DataTimeStamp });

            modelBuilder.Entity<SolarEnergyPrediction>().HasKey(e => new { e.PlantId, e.DataTimeStamp });

            modelBuilder.Entity<WindEnergyPrediction>().HasKey(e => new { e.PlantId, e.DataTimeStamp });

            modelBuilder.Entity<Predictions>().HasKey(e => new { e.PlantId, e.SensorId, e.DataTimeStamp });
            modelBuilder.Entity<LiveMeasurements>().HasKey(e => new { e.PlantId, e.SensorId,e.KeyType,e.PlatformTimeStamp, e.DataTimeStamp });


            base.OnModelCreating(modelBuilder);
        }

        public DataContext CreateDbContext(string[] args)
        {

            var builder = new ConfigurationBuilder()
            .AddUserSecrets<DataContext>() // Load user secrets
            .AddEnvironmentVariables();

            var configuration = builder.Build();

            string connectionString = configuration["dbConnection"];
            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new DataContext(optionsBuilder.Options);
        }

        public DataContext() { }

        public DataContext(DbContextOptions options) :
            base(options)
        {
        }

        internal static readonly Dictionary<string, NpgsqlDataSource> DataSources = new();

        internal static NpgsqlDataSource GetDatasource(string connectionString)
        {
            if (DataSources.TryGetValue(connectionString, out var source))
            {
                return source;
            }

            var dBuilder = new NpgsqlDataSourceBuilder(
                connectionString
            );


            var datasource =
                CreateDatasource(dBuilder
                ).Build();
            DataSources.TryAdd(connectionString, datasource);
            return datasource;
        }

        public static DataContext Create(DbContextOptionsBuilder optionsBuilder, string? connectionString = null)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                var config = new ConfigurationBuilder()
                    .AddUserSecrets<DataContext>()
                    .Build();
                if (string.IsNullOrWhiteSpace(config.GetConnectionString("dbConnection")))
                {
                    throw new InvalidOperationException("You need to set the app secret with connection string!");
                }

                connectionString = config.GetConnectionString("dbConnection");
            }


            return new DataContext(CreateDataContext(optionsBuilder, connectionString!));
        }

        internal static DbContextOptions CreateDataContext(DbContextOptionsBuilder optionsBuilder, string connectionString)
        {
            optionsBuilder.UseNpgsql(GetDatasource(connectionString), // replace with your Connection String
                    options =>
                    {
                        options.UseNetTopologySuite();
                        options.UseRelationalNulls();
                        options.EnableRetryOnFailure(3);
                        options.MigrationsHistoryTable("__migrations", "migrations");
                        options.CommandTimeout((int)TimeSpan.FromMinutes(10).TotalSeconds);
                    }
                ).UseSnakeCaseNamingConvention()
                .EnableSensitiveDataLogging()
                .EnableDetailedErrors();
            return optionsBuilder.Options;
        }

        internal static NpgsqlDataSourceBuilder CreateDatasource(NpgsqlDataSourceBuilder dataSourceBuilder)
        {
            dataSourceBuilder.UseJsonNet(settings: new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.None,
                TypeNameAssemblyFormatHandling =
                    TypeNameAssemblyFormatHandling.Simple,
                ContractResolver = new PrivateSetterContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy(true, true, true)
                },
                Formatting = Formatting.None,
                MaxDepth = Int32.MaxValue,
            });

            dataSourceBuilder.UseNetTopologySuite();
            dataSourceBuilder.EnableParameterLogging();


            return dataSourceBuilder;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            var builder = new ConfigurationBuilder()
                           .SetBasePath(Directory.GetCurrentDirectory())
                           .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                           .AddUserSecrets<DataContext>() // Load user secrets
                           .AddEnvironmentVariables();

            var configuration = builder.Build();
            string connectionString = configuration["dbConnection"];
            options.UseNpgsql(connectionString);
        }

        public async Task ExecuteInTransactionScopeAsync(Func<Task> action, CancellationToken cancellationToken = default)
        {
            var strategy = Database.CreateExecutionStrategy();

            await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await Database.BeginTransactionAsync(cancellationToken))
                {
                    try
                    {
                        await action();
                        await transaction.CommitAsync(cancellationToken);
                    }
                    catch
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        throw;
                    }
                }
            });
        }

        public Task SaveChangesInTransactionScopeAsync(CancellationToken cancellationToken = default)
        {
            return ExecuteInTransactionScopeAsync(async () => await SaveChangesAsync(cancellationToken), cancellationToken);
        }

    }
}