namespace web_app_aws_cloudbox.Server.DTOs
{
    public class CreateFolderDto
    {
        public string Name { get; set; } = string.Empty;

        public int? ParentFolderId { get; set; }
    }
}
