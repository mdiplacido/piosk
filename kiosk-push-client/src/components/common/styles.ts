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
    ["content-row"]: {
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