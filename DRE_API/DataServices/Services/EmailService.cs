using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using WebApiData.Helpers;

namespace WebApiData.Services
{
    public interface IEmailService
    {
        void Send(string to, string subject, string html, string from = null);
    }

    public class EmailService : IEmailService
    {
        //private readonly AppSettings _appSettings;

/*        public EmailService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }*/

        public void Send(string to, string subject, string html, string from = null)
        {
            // create message
            var email = new MimeMessage();
            
           // email.Sender = MailboxAddress.Parse(from ?? _appSettings.EmailFrom);
           // email.Sender.Address = from ?? _appSettings.EmailFrom;
            

            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = html };

            // send email
            using var smtp = new SmtpClient();

            // smtp.SslProtocols = System.Security.Authentication.SslProtocols.Tls11 |System.Security.Authentication.SslProtocols.Tls12 |System.Security.Authentication.SslProtocols.Tls;
            //smtp.CheckCertificateRevocation = false;

            //add mail from
            //email.From.Add(MailboxAddress.Parse(from ?? _appSettings.EmailFrom));

            //smtp.Connect(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.StartTls);
            //smtp.Authenticate(_appSettings.SmtpUser, _appSettings.SmtpPass);
            smtp.Send(email);
            smtp.Disconnect(true);
        }


 

    }
}