using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.DTOs;
using web_app_aws_cloudbox.Server.Models;
namespace web_app_aws_cloudbox.Server.Endpoints
{
    public static class FolderEndpoints
    {
        public static void MapFolderEndpoints(this WebApplication app)
        {
            app.MapPost("/api/folders", [Authorize] async (
                ClaimsPrincipal user,
                CreateFolderDto data,
                CloudBoxDbContext db) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await db.Users
                    .FirstOrDefaultAsync(x => x.CognitoUserId == cognitoUserId);

                if (cloudBoxUser == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Usuario de CloudBox no encontrado."
                    });
                }

                if (string.IsNullOrWhiteSpace(data.Name))
                {
                    return Results.BadRequest(new
                    {
                        message = "El nombre de la carpeta es obligatorio."
                    });
                }
                var folderName = data.Name.Trim();

                var folderExists = await db.Folders
                    .AnyAsync(x =>
                        x.UserId == cloudBoxUser.Id &&
                        x.ParentFolderId == data.ParentFolderId &&
                        x.Name.ToLower() == folderName.ToLower());

                if (folderExists)
                {
                    return Results.Conflict(new
                    {
                        message = "Ya existe una carpeta con ese nombre en esta ubicación."
                    });
                }
                if (data.ParentFolderId.HasValue)
                {
                    var parentFolder = await db.Folders
                        .FirstOrDefaultAsync(x =>
                            x.Id == data.ParentFolderId.Value &&
                            x.UserId == cloudBoxUser.Id);

                    if (parentFolder == null)
                    {
                        return Results.BadRequest(new
                        {
                            message = "La carpeta padre no existe."
                        });
                    }
                }

                var folder = new Folder
                {
                    UserId = cloudBoxUser.Id,
                    ParentFolderId = data.ParentFolderId,
                    Name = folderName,
                    CreatedAt = DateTime.UtcNow
                };

                db.Folders.Add(folder);
                await db.SaveChangesAsync();

                return Results.Created(
                    $"/api/folders/{folder.Id}",
                    new
                    {
                        id = folder.Id,
                        name = folder.Name,
                        parentFolderId = folder.ParentFolderId,
                        createdAt = folder.CreatedAt
                    });
            });
            app.MapPut("/api/folders/{id:int}", [Authorize] async (
                int id,
                ClaimsPrincipal user,
                CreateFolderDto data,
                CloudBoxDbContext db) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await db.Users
                    .FirstOrDefaultAsync(x =>
                        x.CognitoUserId == cognitoUserId);

                if (cloudBoxUser == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Usuario de CloudBox no encontrado."
                    });
                }

                // Validar nombre
                if (string.IsNullOrWhiteSpace(data.Name))
                {
                    return Results.BadRequest(new
                    {
                        message = "El nombre de la carpeta es obligatorio."
                    });
                }

                var folderName = data.Name.Trim();

                // Buscar la carpeta
                var folder = await db.Folders
                    .FirstOrDefaultAsync(x =>
                        x.Id == id &&
                        x.UserId == cloudBoxUser.Id);

                if (folder == null)
                {
                    return Results.NotFound(new
                    {
                        message = "La carpeta no existe."
                    });
                }

                // Validar nombre duplicado en la misma ubicación
                var folderExists = await db.Folders
                    .AnyAsync(x =>
                        x.Id != id &&
                        x.UserId == cloudBoxUser.Id &&
                        x.ParentFolderId == folder.ParentFolderId &&
                        x.Name.ToLower() == folderName.ToLower());

                if (folderExists)
                {
                    return Results.Conflict(new
                    {
                        message = "Ya existe una carpeta con ese nombre en esta ubicación."
                    });
                }

                // Cambiar nombre
                folder.Name = folderName;

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Carpeta renombrada correctamente.",
                    id = folder.Id,
                    name = folder.Name,
                    parentFolderId = folder.ParentFolderId,
                    createdAt = folder.CreatedAt
                });
            });

            app.MapGet("/api/folders", [Authorize] async (
                ClaimsPrincipal user,
                CloudBoxDbContext db,
                int? parentFolderId) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await db.Users
                    .FirstOrDefaultAsync(x => x.CognitoUserId == cognitoUserId);

                if (cloudBoxUser == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Usuario de CloudBox no encontrado."
                    });
                }

                // Si parentFolderId tiene valor,
                // buscamos las carpetas dentro de esa carpeta.
                // Si es null, buscamos solamente las carpetas raíz.
                var folders = await db.Folders
                    .Where(x =>
                        x.UserId == cloudBoxUser.Id &&
                        x.ParentFolderId == parentFolderId)
                    .OrderBy(x => x.Name)
                    .Select(x => new
                    {
                        id = x.Id,
                        name = x.Name,
                        parentFolderId = x.ParentFolderId,
                        createdAt = x.CreatedAt
                    })
                    .ToListAsync();

                return Results.Ok(folders);
            });
            app.MapDelete("/api/folders/{id:int}", [Authorize] async (
                int id,
                ClaimsPrincipal user,
                CloudBoxDbContext db) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                var cloudBoxUser = await db.Users
                    .FirstOrDefaultAsync(x => x.CognitoUserId == cognitoUserId);

                if (cloudBoxUser == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Usuario de CloudBox no encontrado."
                    });
                }

                var folder = await db.Folders
                    .FirstOrDefaultAsync(x =>
                        x.Id == id &&
                        x.UserId == cloudBoxUser.Id);

                if (folder == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Carpeta no encontrada."
                    });
                }

                var hasSubFolders = await db.Folders
                    .AnyAsync(x => x.ParentFolderId == folder.Id);

                if (hasSubFolders)
                {
                    return Results.BadRequest(new
                    {
                        message = "No puedes eliminar una carpeta que contiene subcarpetas."
                    });
                }

                db.Folders.Remove(folder);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Carpeta eliminada correctamente."
                });
            });
        }
    }
}
