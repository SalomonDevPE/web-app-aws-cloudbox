using Microsoft.EntityFrameworkCore;
using web_app_aws_cloudbox.Server.Models;

namespace web_app_aws_cloudbox.Server.Data
{
    public class CloudBoxDbContext : DbContext
    {
        public CloudBoxDbContext(DbContextOptions<CloudBoxDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<Archivo> Archivos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Nombres reales de las tablas en MySQL/RDS
            modelBuilder.Entity<User>()
                .ToTable("users");

            modelBuilder.Entity<Folder>()
                .ToTable("folders");

            modelBuilder.Entity<Archivo>()
                .ToTable("archivos");

            // Relaciones de Folder
            modelBuilder.Entity<Folder>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Folder>()
                .HasOne(f => f.ParentFolder)
                .WithMany(f => f.SubFolders)
                .HasForeignKey(f => f.ParentFolderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relaciones de Archivo
            modelBuilder.Entity<Archivo>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Archivo>()
                .HasOne(f => f.Folder)
                .WithMany()
                .HasForeignKey(f => f.FolderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}