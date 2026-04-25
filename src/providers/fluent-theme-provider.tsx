import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export function FluentThemeProvider({ children }: Props) {
	return <>{children}</>;
}
