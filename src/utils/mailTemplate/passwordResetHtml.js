function passwordResetHtml({ resetLink }) {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Lipslay Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          @media only screen and (max-width: 600px) {
            .inner-body { width: 100% !important; }
            .footer { width: 100% !important; }
          }
          @media only screen and (max-width: 500px) {
            .button { width: 100% !important; }
          }
        </style>
      </head>
      <body style="background-color: #ffffff; color: #718096; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100% !important;">
        <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #edf2f7; width: 100%">
          <tr>
            <td align="center">
              <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td class="header" style="padding: 25px 0; text-align: center">
                    <a
                      href="${process.env.FRONTEND_URL || 'https://lipslay.com'}"
                      style="color: #3d4852; font-size: 19px; font-weight: bold; text-decoration: none;"
                    >Lipslay Marketplace</a>
                  </td>
                </tr>
                <tr>
                  <td
                    class="body"
                    width="100%"
                    style="background-color: #edf2f7; border: hidden !important"
                  >
                    <table
                      class="inner-body"
                      align="center"
                      width="570"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        background-color: #ffffff;
                        border-radius: 2px;
                        box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025),
                          2px 4px 0 rgba(0, 0, 150, 0.015);
                        margin: 0 auto;
                        width: 570px;
                      "
                    >
                      <tr>
                        <td class="content-cell" style="padding: 32px">
                          <h1
                            style="
                              color: #3d4852;
                              font-size: 18px;
                              font-weight: bold;
                              margin-top: 0;
                            "
                          >
                            Hello!
                          </h1>
                          <p style="font-size: 16px; line-height: 1.5em">
                            You are receiving this email because we received a
                            password reset request for your account.
                          </p>
                          <table
                            class="action"
                            align="center"
                            width="100%"
                            style="margin: 30px auto; text-align: center"
                          >
                            <tr>
                              <td align="center">
                                <table
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                >
                                  <tr>
                                    <td align="center">
                                      <table
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                      >
                                        <tr>
                                          <td>
                                            <a
                                              href="${resetLink}"
                                              class="button button-primary"
                                              target="_blank"
                                              rel="noopener"
                                              style="
                                                border-radius: 4px;
                                                color: #fff;
                                                display: inline-block;
                                                text-decoration: none;
                                                background-color: #e21d48;
                                                border-bottom: 8px solid #e21d48;
                                                border-left: 18px solid #e21d48;
                                                border-right: 18px solid #e21d48;
                                                border-top: 8px solid #e21d48;
                                              "
                                              >Reset Password</a
                                            >
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <p style="font-size: 16px; line-height: 1.5em">
                            This password reset link will expire in 60 minutes.
                          </p>
                          <p style="font-size: 16px; line-height: 1.5em">
                            If you did not request a password reset, no further
                            action is required.
                          </p>
                          <p style="font-size: 16px; line-height: 1.5em">
                            Regards,<br />Lipslay Marketplace
                          </p>
                          <table
                            class="subcopy"
                            width="100%"
                            style="
                              border-top: 1px solid #e8e5ef;
                              margin-top: 25px;
                              padding-top: 25px;
                            "
                          >
                            <tr>
                              <td>
                                <p style="line-height: 1.5em; font-size: 14px">
                                  If you're having trouble clicking the "Reset
                                  Password" button, copy and paste the URL below
                                  into your web browser:
                                  <span
                                    class="break-all"
                                    style="word-break: break-all"
                                    ><a href="${resetLink}" style="color: #3869d4"
                                      >${resetLink}</a
                                    ></span
                                  >
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table
                      class="footer"
                      align="center"
                      width="570"
                      style="margin: 0 auto; text-align: center; width: 570px"
                    >
                      <tr>
                        <td
                          class="content-cell"
                          align="center"
                          style="padding: 32px"
                        >
                          <p
                            style="
                              line-height: 1.5em;
                              color: #b0adc5;
                              font-size: 12px;
                              text-align: center;
                            "
                          >
                            © 2025 Lipslay Marketplace. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

module.exports = passwordResetHtml;