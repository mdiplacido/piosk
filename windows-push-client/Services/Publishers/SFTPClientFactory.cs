namespace windows_push_client.Services
{
    using Renci.SshNet;
    using windows_push_client.Models;

    public class SFTPClientFactory
    {
        private readonly Config config;

        public SFTPClientFactory(Config config)
        {
            this.config = config;
        }

        public SftpClient Create()
        {
            var passwordText = new System.Net.NetworkCredential(string.Empty, this.config.SFTPPassword).Password;

            var connectionInfo = new ConnectionInfo(this.config.SFTPAddress,
                                                    this.config.SFTPUsername,
                                                    new PasswordAuthenticationMethod(this.config.SFTPUsername, passwordText));

            return new SftpClient(connectionInfo);
        }
    }
}
