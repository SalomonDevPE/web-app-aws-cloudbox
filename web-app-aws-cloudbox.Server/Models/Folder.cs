namespace web_app_aws_cloudbox.Server.Models
{
    public class Folder
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int? ParentFolderId { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        // Relación con el usuario propietario
        public User User { get; set; } = null!;

        // Relación consigo misma para carpetas dentro de carpetas
        public Folder? ParentFolder { get; set; }

        public ICollection<Folder> SubFolders { get; set; } = new List<Folder>();
    }
}
