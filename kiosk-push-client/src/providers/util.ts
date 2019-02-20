export function getDisplayName(Component: React.ComponentClass | React.FunctionComponent): string {
    return Component.displayName || Component.name || "Component";
}
