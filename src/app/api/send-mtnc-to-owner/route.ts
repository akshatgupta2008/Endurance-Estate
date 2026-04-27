import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
    const emailUser = process.env.EMAIL_USER;
    const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailAppPassword) {
      return NextResponse.json(
        {
          message: 'Email is not configured on the server',
          error: 'Missing EMAIL_USER or EMAIL_APP_PASSWORD'
        },
        { status: 500 }
      );
    }

        const body = await request.json();

        const {
            houseId,
            tenantName,
            issueCategory,
            issue,
            urgency,
            preferredDate,
            preferredTime,
            entryPermission,
            owner_email,   // Owner's email
            // tenant_email,   // Tenant's email
            // idToken
        } = body;

          if (!owner_email) {
            return NextResponse.json(
              { message: 'Failed to send email', error: 'Missing owner_email' },
              { status: 400 }
            );
          }

          const isDev = process.env.NODE_ENV !== 'production';
          const transporter = createTransport({
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailAppPassword
            },
            debug: isDev,
            logger: isDev
          });

        const emailContent = `
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 15px; margin: 0; line-height: 1.6;">
 <div style="max-width: 100%; background-color: white; margin: 0 auto; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="padding: 30px; background-color: #2c3e50; color: white; text-align: left; display: flex; align-items: center; justify-content: space-between;">
        <div>
            <h1 style="margin: 0 0 5px 0; font-size: 28px; font-weight: 600;">New Maintenance Request</h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">This request has been submitted by your tenant <strong>${tenantName}</strong></p>
        </div>
        <div style="margin-left: auto;">
            <img src="https://i.postimg.cc/YhyDpfF7/logo3.jpg" alt="Company Logo" style="height: 10rem; max-width: 100%;">
        </div>
    </div>
</div>
    
    <!-- Main Content -->
    <div style="padding: 30px;">
      <!-- Two Column Layout for Larger Screens -->
      <div style="display: flex; flex-wrap: wrap; margin: 0 -15px;">
        <!-- Left Column -->
        <div style="flex: 1; min-width: 280px; padding: 0 15px; box-sizing: border-box;">
          <!-- Tenant Info -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Tenant Name</label>
            <div style="font-size: 16px; padding: 12px; background-color: #f5f5f5; border-left: 3px solid #2c3e50;">${tenantName}</div>
          </div>
          
          <!-- Property ID -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Property ID</label>
            <div style="font-size: 16px; padding: 12px; background-color: #f5f5f5; border-left: 3px solid #2c3e50;">${houseId}</div>
          </div>
          
          <!-- Issue Category -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Issue Category</label>
            <div style="font-size: 16px; padding: 12px; background-color: #f5f5f5; border-left: 3px solid #2c3e50;">${issueCategory}</div>
          </div>
        </div>
        
        <!-- Right Column -->
        <div style="flex: 1; min-width: 280px; padding: 0 15px; box-sizing: border-box;">
          <!-- Urgency -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Urgency</label>
            <div style="font-size: 16px; padding: 12px; color: white; background-color: #c0392b; display: inline-block; border-radius: 4px;">${urgency}</div>
          </div>
          
          <!-- Preferred Date/Time -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Preferred Schedule</label>
            <div style="font-size: 16px; padding: 12px; background-color: #f5f5f5; border-left: 3px solid #2c3e50;">${preferredDate} at ${preferredTime}</div>
          </div>
          
          <!-- Entry Permission -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Entry Permission</label>
            <div style="font-size: 16px; padding: 12px; background-color: ${entryPermission === true ? '#ebf7f2' : '#fdecea'}; color: ${entryPermission === true ? '#27ae60' : '#c0392b'}; display: inline-block; border-radius: 4px;">
              ${entryPermission === true ? 'Access Granted' : 'Access Not Granted'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Description (Full Width) -->
      <div style="margin-top: 15px;">
        <label style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 8px;">Description</label>
        <div style="font-size: 16px; padding: 20px; background-color: #f5f5f5; border-left: 3px solid #2c3e50; white-space: pre-wrap; line-height: 1.6; min-height: 120px;">${issue}</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 30px; background-color: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666;">
      This email is sent on behalf of your tenant ${tenantName}. You can reply directly to this email to contact the tenant.
    </div>
  </div>
</body>
`;

        await transporter.sendMail({
          from: `"${tenantName || 'Tenant'} via Property Manager" <${emailUser}>`,
          to: owner_email,
          subject: 'New Maintenance Request for Your Property',
          html: emailContent
        });

        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        // console.error('Full error details:', error);

        return NextResponse.json(
            {
                message: 'Failed to send email',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}