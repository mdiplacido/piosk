import { Theme, createStyles, WithStyles } from "@material-ui/core";

export interface ContainerStyleProps extends WithStyles<typeof containerStyles> {
}

const containerStyles = (theme: Theme) => createStyles({
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
    }
});

export default containerStyles;