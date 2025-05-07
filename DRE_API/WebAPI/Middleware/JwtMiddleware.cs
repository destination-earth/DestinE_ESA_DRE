using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApiData.Helpers;

namespace WebApi.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
     

        public JwtMiddleware(RequestDelegate next )
        {
            _next = next;
        
        }

        public async Task Invoke(HttpContext context, DataContext dataContext)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

       

            await _next(context);
        }


    }
}