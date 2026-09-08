namespace web_app_aws_cloudbox.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string CognitoUserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public long StorageLimit { get; set; }
        public long StorageUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
