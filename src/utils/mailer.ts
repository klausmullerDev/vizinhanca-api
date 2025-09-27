import nodemailer from 'nodemailer';
import logger from './logger';


async function createTransporter() {
    // O Ethereal cria uma conta de teste SMTP para nós
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // utilizador gerado pelo Ethereal
            pass: testAccount.pass, // senha gerada pelo Ethereal
        },
    });

    return transporter;
}

/**
 * Envia um e-mail de redefinição de senha.
 * @param to - O e-mail do destinatário.
 * @param token - O token de redefinição de senha.
 */
export async function sendPasswordResetEmail(to: string, token: string) {
    const transporter = await createTransporter();

    const resetUrl = `http://localhost:5173/redefinir-senha/${token}`; // URL do seu front-end

    const info = await transporter.sendMail({
        from: '"Vizinhança Solidária" <no-reply@vizinhasolidaria.com>',
        to: to,
        subject: "Redefinição de Senha",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4a90e2; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Vizinhança Solidária</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; text-align: center;">Redefinição de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se não foi você, por favor, ignore este e-mail. Caso contrário, clique no botão abaixo para escolher uma nova senha.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a90e2; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Redefinir Senha</a>
          </div>
          <p>Se você não conseguir clicar no botão, copie e cole o seguinte link no seu navegador:</p>
          <p style="word-break: break-all; color: #4a90e2;">${resetUrl}</p>
          <p style="color: #888; font-size: 14px;">Este link de redefinição de senha irá expirar em 1 hora.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p>Atenciosamente,<br>Equipe Vizinhança Solidária</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Você está recebendo este e-mail porque solicitou uma redefinição de senha.</p>
          <p style="margin: 5px 0 0 0;">Vizinhança Solidária &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
    });

    
    logger.info(`E-mail de teste enviado! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
}
