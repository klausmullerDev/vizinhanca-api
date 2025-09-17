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
                <p>Você solicitou uma redefinição de senha.</p>
                <p>Clique neste <a href="${resetUrl}">link</a> para redefinir sua senha.</p>
                <p>Este link irá expirar em 1 hora.</p>
            `,
    });

    
    logger.info(`E-mail de teste enviado! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
}

