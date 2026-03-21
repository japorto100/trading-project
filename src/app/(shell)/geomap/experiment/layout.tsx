export default function GeoMapExperimentLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<link rel="stylesheet" href="/cesium/Widgets/widgets.css" />
			{children}
		</>
	);
}
