using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DataServices.Interfaces;

public interface IDataContext
{
    Task ExecuteInTransactionScopeAsync(Func<Task> action, CancellationToken cancellationToken = default);
    public Task SaveChangesInTransactionScopeAsync(CancellationToken cancellationToken = default);
    public DbSet<TEntity> Set<TEntity>()
        where TEntity : class;
}