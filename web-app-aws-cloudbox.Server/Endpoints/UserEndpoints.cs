using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.DTOs;
using web_app_aws_cloudbox.Server.Models;
using web_app_aws_cloudbox.Server.Services;
namespace web_app_aws_cloudbox.Server.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            app.MapGet("/api/users/me", [Authorize] async (
            ClaimsPrincipal user,
            UserService userService) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var username =
                    user.FindFirst("username")?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await userService.GetOrCreateAsync(
                    cognitoUserId,
                    username
                );

                return Results.Ok(new
                {
                    id = cloudBoxUser.Id,
                    cognitoUserId = cloudBoxUser.CognitoUserId,
                    name = cloudBoxUser.Name,
                    email = cloudBoxUser.Email,
                    storageLimit = cloudBoxUser.StorageLimit,
                    storageUsed = cloudBoxUser.StorageUsed,
                    createdAt = cloudBoxUser.CreatedAt
                });
            });

            app.MapPut("/api/users/me", [Authorize] async (
                ClaimsPrincipal user,
                UpdateUserProfileDto data,
                UserService userService) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await userService.UpdateProfileAsync(
                    cognitoUserId,
                    data
                );

                if (cloudBoxUser == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Usuario de CloudBox no encontrado."
                    });
                }

                return Results.Ok(new
                {
                    message = "Perfil actualizado correctamente.",
                    id = cloudBoxUser.Id,
                    cognitoUserId = cloudBoxUser.CognitoUserId,
                    name = cloudBoxUser.Name,
                    email = cloudBoxUser.Email,
                    storageLimit = cloudBoxUser.StorageLimit,
                    storageUsed = cloudBoxUser.StorageUsed
                });
            });
        }
    }
}
