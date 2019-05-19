import { createStyles, Theme, WithStyles } from "@material-ui/core";

export const containerStyles = (theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
        overflow: "hidden",
        padding: `0 ${theme.spacing.unit * 3}px`,
    },
    header: {
        ["padding-top"]: "10px"
    },
    headerGrid: {
        backgroundColor: "white",
        position: "fixed",
        width: "100%",
    },
    ["content-row"]: {
        ["padding-top"]: "80px !important",
        ["padding-left"]: "30px !important"
    },
    button: {
    },
    textField: {
    },
    table: {
    }
});

export interface ContainerStyleProps extends WithStyles<typeof containerStyles> {
}

export default containerStyles;