import * as React from "react";

import { ConfigStore } from "../config/config";
import { ConfigContext } from "../config/config.provider";
import { getDisplayName } from "../util";
import { PublisherService } from "./publisher.service";

export enum PublisherCompletionStatus {
    None = "None",
    Success = "Success",
    Failure = "Failure"
}

export interface PublisherCompletionEvent {
    message: string;
    status: PublisherCompletionStatus;
}

export interface IPublishInfo {
    name: string;
    image: Electron.NativeImage;
}

export interface IPublisherService {
    isEnabled: boolean;
    currentPassword: string;
    sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent>;
}

export interface IPublisherStore {
    publisher: IPublisherService;
    changePassword: (password: string) => void;
}

export interface PublisherProviderProps {
    publisherStore: IPublisherStore;
}

export interface IPublisherState {
    password: string;
}

export const PublisherContext = React.createContext<IPublisherStore>({} as IPublisherStore);

class PublisherProvider extends React.Component<{}, IPublisherState> {
    constructor(props: any) {
        super(props);
        this.state = {
            password: "",
        };
    }

    private publisherStoreFactory = (config: ConfigStore) => {
        const publisher = new PublisherService(config, this.state.password);
        const store: IPublisherStore = {
            publisher,
            changePassword: password => this.setState({ password })
        };

        return store;
    }

    render(): JSX.Element {
        return (
            <ConfigContext.Consumer>
                {
                    config =>
                        <PublisherContext.Provider value={this.publisherStoreFactory(config)}>
                            {this.props.children}
                        </PublisherContext.Provider>
                }
            </ConfigContext.Consumer>
        );
    }
}

export function withPublisher<T extends {}>(
    Component: React.ComponentClass<PublisherProviderProps & T> | React.FC<PublisherProviderProps & T>
): React.RefForwardingComponent<typeof Component, PublisherProviderProps & T> {
    const c: React.RefForwardingComponent<typeof Component, PublisherProviderProps & T> = (props: T) => {
        return (
            <PublisherContext.Consumer>
                {publisher =>
                    <Component {...props} publisherStore={publisher} />
                }
            </PublisherContext.Consumer>
        );
    };

    c.displayName = `withPublisher(${getDisplayName(Component)})`;
    return c;
}

export default PublisherProvider;
