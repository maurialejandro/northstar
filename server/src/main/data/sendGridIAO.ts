import { injectable } from "tsyringe";
import sendGrid from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { EnvConfig } from "../config/envConfig";

@injectable()
export default class SendGridIAO {
    private sendGridClient: typeof sendGrid;

    constructor(private readonly config: EnvConfig) {
        sendGrid.setApiKey(this.config.sendGridApiKey);
        this.sendGridClient = sendGrid;
    }

    async sendEmail(msg: MailDataRequired): Promise<[sendGrid.ClientResponse, unknown]> { // TODO: type this
        try {
            return await this.sendGridClient.send(msg);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}
