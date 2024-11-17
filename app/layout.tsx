import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			{/* <Toaster richColors /> */}

			<body>{children}</body>
		</html>
	);
}
