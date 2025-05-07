using DataServices.Models;
using System.Threading;
using System.Threading.Tasks;
 
 

namespace Interfaces;
public interface IDESPKeyCloakService
{

    public Task<DespKeyCloakTokenResponse> GetTokenResponse(DespKeyCloakSettings despKeyCloakSettings, TokenCodeDto code, CancellationToken cancellationToken = default);
    public Task<DespKeyCloakTokenResponse> GetRefreshTokenResponse(DespKeyCloakSettings despKeyCloakSettings, TokenRefreshDto code, CancellationToken cancellationToken = default);

}
