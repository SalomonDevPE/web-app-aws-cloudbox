using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.Models;
using web_app_aws_cloudbox.Server.Services;

namespace web_app_aws_cloudbox.Server.Endpoints
{
    public static class ArchivoEndpoints
    {
        public static void MapArchivoEndpoints(this WebApplication app)
        {
            app.MapPost("/api/archivos/upload", async (
    HttpRequest request,
    ClaimsPrincipal user,
    CloudBoxDbContext db,
    S3Service s3Service) =>
            {
                var cognitoUserId =
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(cognitoUserId))
                {
                    return Results.Unauthorized();
                }

                if (!request.HasFormContentType)
                {
                    return Results.BadRequest(new
                    {
                        message = "La solicitud no es multipart/form-data."
                    });
                }

                var form = await request.ReadFormAsync();

                var file = form.Files.GetFile("file");

                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new
                    {
                        message = "No se recibió ningún archivo."
                    });
                }

                int? folderId = null;

                if (int.TryParse(
                    request.Query["folderId"],
                    out var parsedFolderId))
                {
                    folderId = parsedFolderId;
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

                if (folderId.HasValue)
                {
                    var folderExists = await db.Folders
                        .AnyAsync(x =>
                            x.Id == folderId.Value &&
                            x.UserId == cloudBoxUser.Id);

                    if (!folderExists)
                    {
                        return Results.NotFound(new
                        {
                            message = "La carpeta no existe."
                        });
                    }
                }

                var extension = Path.GetExtension(file.FileName);

                var key = folderId.HasValue
                    ? $"{cloudBoxUser.Id}/{folderId.Value}/{Guid.NewGuid()}{extension}"
                    : $"{cloudBoxUser.Id}/{Guid.NewGuid()}{extension}";

                await using var stream = file.OpenReadStream();

                await s3Service.UploadAsync(
                    stream,
                    key,
                    file.ContentType ?? "application/octet-stream");

                var archivo = new Archivo
                {
                    UserId = cloudBoxUser.Id,
                    FolderId = folderId,
                    Name = file.FileName,
                    Extension = extension,
                    ContentType = file.ContentType ?? "application/octet-stream",
                    Size = file.Length,
                    S3Key = key,
                    CreatedAt = DateTime.UtcNow
                };

                db.Archivos.Add(archivo);

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Archivo subido correctamente.",
                    archivo.Id,
                    archivo.Name,
                    archivo.Size,
                    archivo.FolderId,
                    archivo.S3Key,
                    archivo.CreatedAt
                });
            })
.DisableAntiforgery()
.RequireAuthorization();
            // DELETE: eliminar archivo de S3 y MySQL
            app.MapDelete("/api/archivos/{id:int}", async (
                int id,
                ClaimsPrincipal user,
                CloudBoxDbContext db,
                S3Service s3Service) =>
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

                var archivo = await db.Archivos
                    .FirstOrDefaultAsync(x =>
                        x.Id == id &&
                        x.UserId == cloudBoxUser.Id);

                if (archivo == null)
                {
                    return Results.NotFound(new
                    {
                        message = "El archivo no existe."
                    });
                }

                try
                {
                    // 1. Eliminar archivo físico de S3
                    await s3Service.DeleteAsync(archivo.S3Key);

                    // 2. Eliminar registro de MySQL
                    db.Archivos.Remove(archivo);

                    await db.SaveChangesAsync();

                    return Results.Ok(new
                    {
                        message = "Archivo eliminado correctamente.",
                        id = archivo.Id
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        title: "Error eliminando el archivo"
                    );
                }
            })
            .RequireAuthorization();
// GET: listar archivos del usuario
app.MapGet("/api/archivos", async (
    ClaimsPrincipal user,
    CloudBoxDbContext db,
    int? folderId) =>
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

    // =========================================================
    // OBTENER ARCHIVOS
    // =========================================================

    var query = db.Archivos
        .Where(x =>
            x.UserId == cloudBoxUser.Id);

    // Si se especifica una carpeta,
    // mostrar solamente los archivos de esa carpeta.
    //
    // Si folderId es null,
    // mostrar TODOS los archivos del usuario.
    if (folderId.HasValue)
    {
        query = query.Where(x =>
            x.FolderId == folderId.Value);
    }

    var archivos = await query
        .OrderByDescending(x => x.CreatedAt)
        .Select(x => new
        {
            x.Id,
            x.Name,
            x.Extension,
            x.ContentType,
            x.Size,
            x.FolderId,
            x.S3Key,
            x.CreatedAt
        })
        .ToListAsync();

    return Results.Ok(archivos);
})
.RequireAuthorization();


            app.MapGet("/api/archivos/s3-test", async (
    IAmazonS3 s3,
    IConfiguration configuration) =>
            {
                var bucketName = configuration["AWS:S3:BucketName"];

                if (string.IsNullOrWhiteSpace(bucketName))
                {
                    return Results.BadRequest(new
                    {
                        message = "No se ha configurado el bucket S3."
                    });
                }

                try
                {
                    await s3.ListObjectsV2Async(new Amazon.S3.Model.ListObjectsV2Request
                    {
                        BucketName = bucketName,
                        MaxKeys = 1
                    });

                    return Results.Ok(new
                    {
                        message = "Conexión con S3 correcta.",
                        bucket = bucketName
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        title: "Error conectando con Amazon S3"
                    );
                }
            })
.RequireAuthorization();
            // GET: obtener URL temporal para visualizar archivo
            app.MapGet("/api/archivos/{id:int}/view", async (
                int id,
                ClaimsPrincipal user,
                CloudBoxDbContext db,
                S3Service s3Service) =>
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

                var archivo = await db.Archivos
                    .FirstOrDefaultAsync(x =>
                        x.Id == id &&
                        x.UserId == cloudBoxUser.Id);

                if (archivo == null)
                {
                    return Results.NotFound(new
                    {
                        message = "El archivo no existe."
                    });
                }

                try
                {
                    var url = s3Service.GetPreSignedUrl(
                        archivo.S3Key,
                        10);

                    return Results.Ok(new
                    {
                        url
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        title: "Error generando URL del archivo"
                    );
                }
            })
            .RequireAuthorization();
            // GET: obtener URL temporal para descargar archivo
            app.MapGet("/api/archivos/{id:int}/download", async (
                int id,
                ClaimsPrincipal user,
                CloudBoxDbContext db,
                S3Service s3Service) =>
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

                var archivo = await db.Archivos
                    .FirstOrDefaultAsync(x =>
                        x.Id == id &&
                        x.UserId == cloudBoxUser.Id);

                if (archivo == null)
                {
                    return Results.NotFound(new
                    {
                        message = "El archivo no existe."
                    });
                }

                try
                {
                    var url = s3Service.GetPreSignedUrl(
                        archivo.S3Key,
                        10,
                        archivo.Name);

                    return Results.Ok(new
                    {
                        url
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        title: "Error generando URL de descarga"
                    );
                }
            })
            .RequireAuthorization();
        }
    }
}
