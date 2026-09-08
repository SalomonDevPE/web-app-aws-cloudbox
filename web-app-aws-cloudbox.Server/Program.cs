using Amazon;
using Amazon.CognitoIdentityProvider;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.Endpoints;
using web_app_aws_cloudbox.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<IAmazonCognitoIdentityProvider>(_ =>
    new AmazonCognitoIdentityProviderClient(
        new AmazonCognitoIdentityProviderConfig
        {
            RegionEndpoint = RegionEndpoint.USEast1
        }   
    ));

builder.Services.AddDbContext<CloudBoxDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("CloudBoxConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("CloudBoxConnection")
        )
    ));
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ArchivoService>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority =
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UUxJ24QzU";

        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer =
                "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UUxJ24QzU",

            ValidateAudience = false,

            ValidateLifetime = true
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("CloudBoxPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://localhost:54097"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


builder.Services.AddAuthorization();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingresa el Access Token de Cognito."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDefaultAWSOptions(
    builder.Configuration.GetAWSOptions());

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var config = new AmazonS3Config
    {
        RegionEndpoint = RegionEndpoint.USEast1
    };

    return new AmazonS3Client(config);
});

builder.Services.AddScoped<S3Service>();

var app = builder.Build();
app.MapUserEndpoints();
app.MapFolderEndpoints();
app.MapArchivoEndpoints();
app.UseCors("CloudBoxPolicy");
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/database/test", async (CloudBoxDbContext db) =>
{
    try
    {
        var connected = await db.Database.CanConnectAsync();

        return Results.Ok(new
        {
            connected,
            message = connected
                ? "Conexión a MySQL correcta"
                : "No se pudo conectar a MySQL"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            title: "Error de conexión a MySQL"
        );
    }
});
app.MapGet("/api/auth/me", [Authorize] (ClaimsPrincipal user) =>
{
    var cognitoUserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var username = user.FindFirst("username")?.Value;

    return Results.Ok(new
    {
        authenticated = true,
        cognitoUserId,
        username
    });
});

app.MapFallbackToFile("/index.html");

app.Run();

