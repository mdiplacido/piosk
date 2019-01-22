namespace windows_push_client.Services
{
    using CredentialManagement;
    using System;

    public class SecretService
    {
        public string GetSecret(string username)
        {
            using (var cred = new Credential(username))
            {
                this.AddCommonProperties(cred);
                cred.Load();

                if (string.IsNullOrWhiteSpace(cred.Password))
                {
                    throw new ApplicationException($"Password is null or empty for user '{username}'");
                }

                return cred.Password;
            }
        }

        public void SetSecret(string username, string password)
        {
            using (var cred = new Credential(username, password))
            {
                this.AddCommonProperties(cred);
                cred.Save();
            }
        }

        private void AddCommonProperties(Credential cred)
        {
            cred.Type = CredentialType.Generic;
            cred.Target = "WindowsPushClientSFTPCredential";
            cred.PersistanceType = PersistanceType.LocalComputer;
        }
    }
}
