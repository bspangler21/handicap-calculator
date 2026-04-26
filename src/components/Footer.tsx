import versionData from "../version.json";
const VERSION = `v1.0.${versionData.version}`;

export function Footer() {
  return (
		<div className="flex bg-primary w-full min-h-[50px]">
			<p className="flex h-full text-primary-foreground text-base items-center ml-auto pr-2">
				{VERSION}
			</p>
		</div>
	);
}