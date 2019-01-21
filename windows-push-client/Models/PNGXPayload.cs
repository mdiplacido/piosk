namespace windows_push_client.Models
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;

    /// <summary>
    /// The model representing the custom PNGX type, this can be serialized to json
    /// and sent to the Pi.
    /// </summary>
    public class PNGXPayload
    {
        public long BirthtimeMs { get; set; }
        public string Author { get; set; }
        public byte[] Data { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }

        public byte[] Serialize()
        {
            DefaultContractResolver contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            };

            var result = JsonConvert.SerializeObject(this, new JsonSerializerSettings
            {
                ContractResolver = contractResolver,
            });

            return System.Text.Encoding.UTF8.GetBytes(result);
        }
    }
}
