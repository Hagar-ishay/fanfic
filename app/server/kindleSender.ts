import fs from "node:fs";
import { promisify } from "node:util";
import { ENV } from "@/server/config";
import nodemailer from "nodemailer";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export async function sendToKindle(
	kindleEmail: string,
	title: string,
	fileName: string,
	downloadPath: string,
) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: ENV.GMAIL_EMAIL,
			pass: ENV.GMAIL_APP_PASSWORD,
		},
	});

	const mailOptions = {
		from: ENV.GMAIL_EMAIL,
		to: kindleEmail,
		subject: title,
		text: "Please find the attached book.",
		attachments: [
			{
				filename: fileName,
				path: downloadPath,
				contentType: "application/epub+zip",
				headers: {
					"Content-Disposition": "attachment",
				},
			},
		],
	};

	// await transporter.sendMail(mailOptions);
}
