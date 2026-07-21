export function baseLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>${title}</title></head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#050912;padding:24px 32px;">
                <span style="color:#F2EFE6;font-size:18px;font-weight:600;letter-spacing:0.05em;">RUDRAAS DYNAMICS</span>
                <div style="color:#8a8f99;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">Careers</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;color:#9a9a9a;font-size:11px;">
                This is an automated message from the Rudraas Dynamics Careers Portal. Please do not reply directly to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
