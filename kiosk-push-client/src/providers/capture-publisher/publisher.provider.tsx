import * as React from "react";
import * as uuid from "uuid";
import { ConfigContext } from "../config/config.provider";
import { ConfigStore } from "../config/config";
import { getDisplayName } from "../util";
import { PublisherService } from "./publisher.service";
import { Queue } from "algothizms";

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

export interface IPublisherServiceProvider {
    isEnabled: boolean;
    canSend(): Promise<boolean>;
    sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent>;
}

export interface IPublisherService {
    canEnqueue(): boolean;
    enqueue(info: IPublishInfo): Promise<void>;
    sendImage: IPublisherServiceProvider["sendImage"];
}

export interface IPublisherStore {
    currentPassword: string;
    publisher: IPublisherService;
    changePassword: (password: string) => void;
}

export interface PublisherProviderProps {
    publisherStore: IPublisherStore;
}

export type PublisherQueue = Queue<{ attempts: number; info: IPublishInfo; }>;

export interface IPublisherState {
    password: string;
    queue: PublisherQueue;
}

export const PublisherContext = React.createContext<IPublisherStore>({} as IPublisherStore);

export function makePublishInfo(image: Electron.NativeImage): IPublishInfo {
    return {
        name: uuid() + ".png",
        image,
    };
}

class PublisherProvider extends React.Component<{}, IPublisherState> {
    constructor(props: any) {
        super(props);
        this.state = {
            password: "",
            queue: new Queue(),
        };
    }

    private publisherStoreFactory = (config: ConfigStore) => {
        const service = new PublisherService(config, this.state.password, this.state.queue);
        const store: IPublisherStore = {
            currentPassword: this.state.password,
            publisher: service,
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

export function withPublisher<P extends {}>(
    Component: React.ComponentClass<PublisherProviderProps & P> | React.FC<PublisherProviderProps & P>
): React.RefForwardingComponent<typeof Component, P> {
    const c: React.RefForwardingComponent<typeof Component, P> = (props: P) => {
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
