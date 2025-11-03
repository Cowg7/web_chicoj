// src/services/email.service.js
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

/**
 * Servicio de Email
 * Maneja el envío de correos electrónicos usando diferentes proveedores
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Inicializar el transporter de Nodemailer
   */
  async initialize() {
    try {
      // Verificar que las variables de entorno estén configuradas
      if (!config.email.service || !config.email.user || !config.email.password) {
        console.warn('⚠️ Email no configurado. Variables de entorno faltantes.');
        return false;
      }

      // Crear transporter según el servicio
      if (config.email.service === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.email.user,
            pass: config.email.password
          }
        });
      } 
      else if (config.email.service === 'smtp') {
        // SMTP personalizado (ej: para servicios como SendGrid, Mailgun, etc.)
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port || 587,
          secure: config.email.secure || false, // true para 465, false para otros puertos
          auth: {
            user: config.email.user,
            pass: config.email.password
          }
        });
      }
      else if (config.email.service === 'sendgrid') {
        // SendGrid usando SMTP
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: config.email.apiKey // API Key de SendGrid
          }
        });
      }
      else {
        console.warn(`⚠️ Servicio de email no reconocido: ${config.email.service}`);
        return false;
      }

      // Verificar la configuración
      await this.transporter.verify();
      this.initialized = true;
      console.log(`✅ Servicio de email inicializado: ${config.email.service}`);
      return true;

    } catch (error) {
      console.error('❌ Error al inicializar servicio de email:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Servicio de email no disponible');
      }
    }

    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Fallback a texto plano
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  /**
   * Enviar código de recuperación de contraseña
   */
  async enviarCodigoRecuperacion(email, nombre, codigo) {
    const subject = '🔐 Código de Recuperación - Restaurante Chicooj';
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #4A90E2;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4A90E2;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .code-box h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .code {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            padding: 15px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: inline-block;
          }
          .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #4A90E2;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🍽️ Restaurante Chicooj</h1>
            <p>Sistema de Gestión</p>
          </div>

          <h2>Hola ${nombre},</h2>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          
          <p>Tu código de recuperación es:</p>

          <div class="code-box">
            <h2>Código de Verificación</h2>
            <div class="code">${codigo}</div>
          </div>

          <div class="info-box">
            <strong>ℹ️ Información importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Este código es válido por <strong>15 minutos</strong></li>
              <li>Solo puedes intentar validarlo <strong>3 veces</strong></li>
              <li>Después de usarlo, se invalidará automáticamente</li>
            </ul>
          </div>

          <div class="warning-box">
            <strong>⚠️ Si no solicitaste este código:</strong>
            <p style="margin: 10px 0 0 0;">
              Ignora este correo. Tu cuenta está segura y no se ha realizado ningún cambio.
            </p>
          </div>

          <p style="text-align: center;">
            <a href="${config.frontendUrl}/templates/recuperar_contrasenia.html" class="btn">
              Restablecer Contraseña
            </a>
          </p>

          <div class="footer">
            <p><strong>Restaurante Chicooj</strong></p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              © 2025 Restaurante Chicooj. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Enviar confirmación de cambio de contraseña
   */
  async enviarConfirmacionCambio(email, nombre) {
    const subject = '✅ Contraseña Cambiada - Restaurante Chicooj';
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 28px;
          }
          .success-icon {
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
          }
          .info-box {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🍽️ Restaurante Chicooj</h1>
            <p>Sistema de Gestión</p>
          </div>

          <div class="success-icon">✅</div>

          <h2 style="text-align: center; color: #4CAF50;">Contraseña Actualizada</h2>

          <p>Hola ${nombre},</p>
          
          <p>Tu contraseña ha sido <strong>cambiada exitosamente</strong>.</p>

          <div class="info-box">
            <strong>✅ Cambio exitoso</strong>
            <p style="margin: 10px 0 0 0;">
              Tu contraseña se actualizó el <strong>${new Date().toLocaleString('es-GT')}</strong>
            </p>
          </div>

          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>

          <div class="warning-box">
            <strong>⚠️ Si no realizaste este cambio:</strong>
            <p style="margin: 10px 0 0 0;">
              Contacta inmediatamente a tu administrador de sistema. Tu cuenta podría estar comprometida.
            </p>
          </div>

          <div class="footer">
            <p><strong>Restaurante Chicooj</strong></p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              © 2025 Restaurante Chicooj. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: email, subject, html });
  }
}

// Exportar instancia única (Singleton)
export const emailService = new EmailService();


