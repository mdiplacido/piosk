namespace windows_push_client.Services
{
    using Renci.SshNet;
    using windows_push_client.Models;

    public class SFTPClientFactory
    {
        private readonly Config config;
        private readonly SecretService secrets;

        public SFTPClientFactory(Config config, SecretService secrets)
        {
            this.config = config;
            this.secrets = secrets;
        }

        public SftpClient Create()
        {
            var password = this.secrets.GetSecret(this.config.SFTPUsername);
             
            var connectionInfo = new ConnectionInfo(this.config.SFTPAddress,
                                                    this.config.SFTPUsername,
                                                    new PasswordAuthenticationMethod(this.config.SFTPUsername, password));

            return new SftpClient(connectionInfo);
        }
    }
}
