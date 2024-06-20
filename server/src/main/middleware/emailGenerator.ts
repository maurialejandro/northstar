import { EnvConfig } from "../config/envConfig.ts";
import { User } from "../types/userTypes.ts";
import {Stripe} from "stripe";

const config = new EnvConfig();

export const emailGenerator = {
    changeContactInfo: (currentUser: Partial<User>, token: string) => {
        return {
            to: currentUser.email,
            from: config.settingsEmail,
            subject: 'Contact Information Update Request',
            text: `
                Dear ${currentUser.name || 'User'},
                We received a request to update your contact information.
                If you made this request, please click on the link below to confirm:
                ${config.clientUrl}/update-contact?token=${token}
                If you did not make this request, we recommend you secure your account immediately.
                Regards,
                Northstar Team
              `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                        }
        
                        a {
                            color: #007BFF;
                            text-decoration: none;
                        }
        
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <p>Dear ${currentUser.name || 'User'},</p>
                    <p>We received a request to update your contact information.</p>
                    <p>If you made this request, please click on the link below to confirm:</p>
                    <p><a href="${config.clientUrl}/settings?token=${token}">Confirm Contact Update</a></p>
                    <p>If you did not make this request, we recommend you secure your account immediately.</p>
                    <p>Regards,<br>Northstar Team</p>
                </body>
                </html>
              `,
            };
        },

    // TODO include a link that lets them pay for the subscription
    rejectedCardForBuyer: (currentUser: User, card: Stripe.PaymentMethod.Card) => {
        return {
            to: currentUser.email,
            from: config.settingsEmail,
            subject: 'Could not renew your subscription',
            text: `
                Dear ${currentUser.name || 'User'},
                Your subscription could not be renewed.
                Your ${card.brand} card ending in ${card.last4} has been rejected.
                Regards,
                Northstar Team.
              `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                        }
        
                        a {
                            color: #007BFF;
                            text-decoration: none;
                        }
        
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <p>Dear ${currentUser.name || 'User'},</p>
                    <p>Your subscription could not be renewed.</p>
                    <p>Your ${card.brand} card ending in ${card.last4} has been rejected.</p>
                    <p>Regards,<br>Northstar Team</p>
                </body>
                </html>
              `,
            };
        },
    
    rejectedCardForAdmin: (currentUser: User, card: Stripe.PaymentMethod.Card) => {
        return {
            to: config.adminEmail,
            from: config.settingsEmail,
            subject: 'Buyer Card was Rejected',
            text: `
                Buyer ${currentUser.name || 'User'} subscription could not be renewed,
                Buyer ${card.brand} card ending in ${card.last4} has been rejected.
                Regards,
                Northstar Team.
              `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                        }
        
                        a {
                            color: #007BFF;
                            text-decoration: none;
                        }
        
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <p>Buyer ${currentUser.name || 'User'} subscription could not be renewed,</p>
                    <p>Buyer ${card.brand} card ending in ${card.last4} has been rejected.</p>
                    <p>Regards,<br>Northstar Team</p>
                </body>
                </html>
              `,
        };
    }
};
