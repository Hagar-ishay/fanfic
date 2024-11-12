import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Fanfic } from "@/db/types";
import { downloadFanfic } from "@/server/ao3Client";
import { ENV } from "@/server/config";
import { json } from "@remix-run/node";
import nodemailer from "nodemailer";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export async function sendToKindle(kindleEmail: string, fanfic: Fanfic) {
	const fileName = `${fanfic.id}.epub`;
	const downloadPath = path.resolve(`/tmp/${fileName}`);
	console.log({ link: fanfic.downloadLink });

	try {
		await downloadFanfic(fanfic.downloadLink, downloadPath);

		const stats = await statAsync(downloadPath);
		if (stats.size === 0) {
			throw new Error("Downloaded file is empty.");
		}

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
			subject: fanfic.title,
			attachments: [
				{
					filename: fileName,
					path: downloadPath,
				},
			],
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.messageId);

		await unlinkAsync(downloadPath);

		return json({ success: true });
	} catch (error) {
		const errorMessage =
			(typeof error === "string" && error) ||
			(error instanceof Error && error.message);

		if (fs.existsSync(downloadPath)) {
			await unlinkAsync(downloadPath);
		}
		return json({ success: false, message: errorMessage }, { status: 500 });
	}
}
