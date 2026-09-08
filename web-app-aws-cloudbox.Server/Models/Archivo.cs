namespace web_app_aws_cloudbox.Server.Models
{
    public class Archivo
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int? FolderId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Extension { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long Size { get; set; }

        public string S3Key { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public User User { get; set; } = null!;

        public Folder? Folder { get; set; }
    }
}
