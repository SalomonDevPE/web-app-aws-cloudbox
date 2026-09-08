using Microsoft.EntityFrameworkCore;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.DTOs;
using web_app_aws_cloudbox.Server.Models;
namespace web_app_aws_cloudbox.Server.Services
{
    public class UserService
    {
        private readonly CloudBoxDbContext _db;

        public UserService(CloudBoxDbContext db)
        {
            _db = db;
        }

        public async Task<User?> GetByCognitoUserIdAsync(string cognitoUserId)
        {
            return await _db.Users
                .FirstOrDefaultAsync(x => x.CognitoUserId == cognitoUserId);
        }

        public async Task<User> GetOrCreateAsync(
            string cognitoUserId,
            string? username)
        {
            var user = await GetByCognitoUserIdAsync(cognitoUserId);

            if (user != null)
                return user;

            user = new User
            {
                CognitoUserId = cognitoUserId,
                Name = username ?? "Usuario",
                Email = username ?? string.Empty,
                StorageLimit = 5368709120,
                StorageUsed = 0,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user;
        }

        public async Task<User?> UpdateProfileAsync(
            string cognitoUserId,
            UpdateUserProfileDto data)
        {
            var user = await GetByCognitoUserIdAsync(cognitoUserId);

            if (user == null)
                return null;

            user.Name = data.Name;
            user.Email = data.Email;

            await _db.SaveChangesAsync();

            return user;
        }
    }
}
