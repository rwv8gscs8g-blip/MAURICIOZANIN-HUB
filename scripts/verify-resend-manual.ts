import { sendEmail } from "../src/lib/email";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkEmail() {
  console.log("Checking Resend configuration...");
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is missing!");
    process.exit(1);
  } else {
    console.log("✅ RESEND_API_KEY is present");
  }

  if (!process.env.MAIL_FROM) {
    console.error("❌ MAIL_FROM is missing!");
    process.exit(1);
  } else {
    console.log("✅ MAIL_FROM is present:", process.env.MAIL_FROM);
  }

  console.log("\nSending test email...");
  try {
    const result = await sendEmail({
      to: "mauriciozanin@gmail.com", // Usando email seguro para teste
      subject: "Teste de Configuração Resend via Script",
      html: "<p>Se você recebeu este email, o Resend está configurado corretamente!</p>",
      text: "Se você recebeu este email, o Resend está configurado corretamente!"
    });
    
    if (result.simulated) {
       console.log("⚠️ Email simulated (API Key might be invalid or environment issue)");
    } else {
       console.log("✅ Email sent successfully!", result);
    }

  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

checkEmail();
