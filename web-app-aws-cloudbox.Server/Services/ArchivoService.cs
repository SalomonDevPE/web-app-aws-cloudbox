using Microsoft.EntityFrameworkCore;
using web_app_aws_cloudbox.Server.Data;
using web_app_aws_cloudbox.Server.Models;
namespace web_app_aws_cloudbox.Server.Services
{
    public class ArchivoService
    {
        private readonly CloudBoxDbContext _db;

        public ArchivoService(CloudBoxDbContext db)
        {
            _db = db;
        }

        public async Task<List<Archivo>> GetFilesAsync(
            int userId,
            int? folderId)
        {
            return await _db.Archivos
                .Where(x =>
                    x.UserId == userId &&
                    x.FolderId == folderId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<Archivo?> GetByIdAsync(
            int id,
            int userId)
        {
            return await _db.Archivos
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);
        }

        public async Task<Archivo> CreateAsync(Archivo file)
        {
            _db.Archivos.Add(file);

            await _db.SaveChangesAsync();

            return file;
        }

        public async Task<bool> DeleteAsync(
            int id,
            int userId)
        {
            var file = await GetByIdAsync(id, userId);

            if (file == null)
                return false;

            _db.Archivos.Remove(file);

            await _db.SaveChangesAsync();

            return true;
        }
    }
}
