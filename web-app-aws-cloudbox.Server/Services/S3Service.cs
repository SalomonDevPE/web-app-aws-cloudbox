using Amazon.S3;
using Amazon.S3.Model;
namespace web_app_aws_cloudbox.Server.Services
{
    public class S3Service
    {
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _configuration;

        public S3Service(
            IAmazonS3 s3,
            IConfiguration configuration)
        {
            _s3 = s3;
            _configuration = configuration;
        }

        public async Task<string> UploadAsync(
            Stream fileStream,
            string key,
            string contentType)
        {
            var bucketName =
                _configuration["AWS:S3:BucketName"];

            if (string.IsNullOrWhiteSpace(bucketName))
            {
                throw new InvalidOperationException(
                    "No se ha configurado el nombre del bucket S3.");
            }

            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType
            };

            await _s3.PutObjectAsync(request);

            return key;
        }

        public async Task DeleteAsync(string key)
        {
            var bucketName =
                _configuration["AWS:S3:BucketName"];

            if (string.IsNullOrWhiteSpace(bucketName))
            {
                throw new InvalidOperationException(
                    "No se ha configurado el nombre del bucket S3.");
            }

            var request = new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key
            };

            await _s3.DeleteObjectAsync(request);
        }
        public string GetPreSignedUrl(
    string key,
    int expirationMinutes = 10,
    string? downloadFileName = null)
        {
            var bucketName =
                _configuration["AWS:S3:BucketName"];

            if (string.IsNullOrWhiteSpace(bucketName))
            {
                throw new InvalidOperationException(
                    "No se ha configurado el nombre del bucket S3.");
            }

            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Verb = HttpVerb.GET
            };

            if (!string.IsNullOrWhiteSpace(downloadFileName))
            {
                request.ResponseHeaderOverrides =
                    new ResponseHeaderOverrides
                    {
                        ContentDisposition =
                            $"attachment; filename=\"{downloadFileName}\""
                    };
            }

            return _s3.GetPreSignedURL(request);
        }
    }
}
